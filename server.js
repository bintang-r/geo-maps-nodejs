const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
});
const upload = multer({ storage: storage });

// File Upload Endpoint
app.post('/api/upload', upload.array('images', 10), (req, res) => {
    try {
        const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
        res.json({ urls: fileUrls });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Categories CRUD
app.get('/api/categories', (req, res) => {
    db.query('SELECT * FROM categories ORDER BY name ASC', [], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/categories', (req, res) => {
    const { name, color, icon_name } = req.body;
    db.query('INSERT INTO categories (name, color, icon_name) VALUES (?, ?, ?)', [name, color, icon_name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, name, color, icon_name });
    });
});

app.put('/api/categories/:id', (req, res) => {
    const { name, color, icon_name } = req.body;
    db.query('UPDATE categories SET name = ?, color = ?, icon_name = ? WHERE id = ?', [name, color, icon_name, req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: req.params.id, name, color, icon_name });
    });
});

app.delete('/api/categories/:id', (req, res) => {
    db.query('DELETE FROM categories WHERE id = ?', [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted' });
    });
});

// Provinces & Districts
app.get('/api/provinces', (req, res) => {
    db.query('SELECT * FROM provinces ORDER BY name ASC', [], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/provinces', (req, res) => {
    const { name } = req.body;
    db.query('INSERT INTO provinces (name) VALUES (?)', [name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, name });
    });
});

app.get('/api/districts', (req, res) => {
    db.query('SELECT * FROM districts ORDER BY name ASC', [], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/districts', (req, res) => {
    const { regency_id, name } = req.body;
    db.query('INSERT INTO districts (regency_id, name) VALUES (?, ?)', [regency_id, name], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, regency_id, name });
    });
});

// Regencies
app.get('/api/regencies', (req, res) => {
    const provinceId = req.query.province_id;
    let query = 'SELECT id, province_id, name FROM regencies ORDER BY name ASC';
    let params = [];
    if (provinceId) {
        query = 'SELECT id, province_id, name FROM regencies WHERE province_id = ? ORDER BY name ASC';
        params.push(provinceId);
    }
    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.get('/api/regencies/:id/geojson', (req, res) => {
    db.query('SELECT geojson_data FROM regencies WHERE id = ?', [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: 'Regency not found' });
        
        try {
            // geojson_data is stored as a string, parse it to send as json
            const geojson = JSON.parse(results[0].geojson_data);
            res.json(geojson);
        } catch(e) {
            res.status(500).json({ error: 'Invalid GeoJSON data' });
        }
    });
});

app.post('/api/regencies', (req, res) => {
    const { province_id, name, geojson_data } = req.body;
    db.query('INSERT INTO regencies (province_id, name, geojson_data) VALUES (?, ?, ?)', [province_id, name, geojson_data], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: result.insertId, province_id, name });
    });
});


// Get all locations
app.get('/api/locations', (req, res) => {
    const { search } = req.query;
    let query = 'SELECT * FROM locations';
    let params = [];
    if (search) {
        query += ' WHERE name LIKE ? OR category LIKE ? OR description LIKE ?';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }
    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Find nearby locations
app.get('/api/locations/nearby', (req, res) => {
    const { lat, lng, radius } = req.query; // radius in km
    if (!lat || !lng) return res.status(400).json({ error: 'lat and lng required' });
    const rad = radius || 5;

    // Haversine formula
    const query = `
        SELECT *, (
            6371 * acos(
                cos(radians(?)) * cos(radians(lat)) *
                cos(radians(lng) - radians(?)) +
                sin(radians(?)) * sin(radians(lat))
            )
        ) AS distance
        FROM locations
        HAVING distance < ?
        ORDER BY distance
        LIMIT 20
    `;
    db.query(query, [lat, lng, lat, rad], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get GeoJSON for a specific province
app.get('/api/provinces/:id/geojson', (req, res) => {
    const { id } = req.params;
    db.query('SELECT geojson_data FROM provinces WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0 || !results[0].geojson_data) {
            return res.status(404).json({ error: 'GeoJSON not found for this province' });
        }
        try {
            res.json(JSON.parse(results[0].geojson_data));
        } catch (e) {
            res.status(500).json({ error: 'Invalid GeoJSON data stored in database' });
        }
    });
});

// Get a single location
app.get('/api/locations/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM locations WHERE id = ?', [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json(results[0]);
    });
});

// Create a new location
app.post('/api/locations', (req, res) => {
    const { name, lat, lng, category, address, country, province, city, district, images, description, operating_hours } = req.body;
    
    // Stringify images array if provided
    const imagesStr = Array.isArray(images) ? JSON.stringify(images) : (images || '[]');

    const query = `
        INSERT INTO locations (name, lat, lng, category, address, country, province, city, district, images, description, operating_hours) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [name, lat, lng, category, address, country, province, city, district, imagesStr, description, operating_hours];
    
    db.query(query, params, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: result.insertId, ...req.body });
    });
});

// Update a location
app.put('/api/locations/:id', (req, res) => {
    const { id } = req.params;
    const { name, lat, lng, category, address, country, province, city, district, images, description, operating_hours } = req.body;
    
    const imagesStr = Array.isArray(images) ? JSON.stringify(images) : (images || '[]');

    const query = `
        UPDATE locations 
        SET name = ?, lat = ?, lng = ?, category = ?, address = ?, country = ?, province = ?, city = ?, district = ?, images = ?, description = ?, operating_hours = ?
        WHERE id = ?
    `;
    const params = [name, lat, lng, category, address, country, province, city, district, imagesStr, description, operating_hours, id];
    
    db.query(query, params, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json({ id, ...req.body });
    });
});

// Delete a location
app.delete('/api/locations/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM locations WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json({ message: 'Location deleted successfully' });
    });
});

// GET comments for a location
app.get('/api/locations/:id/comments', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM comments WHERE location_id = ? ORDER BY created_at DESC', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// POST a new comment
app.post('/api/locations/:id/comments', (req, res) => {
    const { id } = req.params;
    const { user_name, text, rating } = req.body;
    
    if (!user_name || !text || !rating) {
        return res.status(400).json({ error: 'Name, text, and rating are required' });
    }

    db.query('INSERT INTO comments (location_id, user_name, text, rating) VALUES (?, ?, ?, ?)', [id, user_name, text, rating], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Update average rating of location
        db.query('SELECT AVG(rating) as avg_rating FROM comments WHERE location_id = ?', [id], (err, avgResult) => {
            if (!err && avgResult.length > 0) {
                db.query('UPDATE locations SET rating = ? WHERE id = ?', [avgResult[0].avg_rating, id]);
            }
        });

        res.status(201).json({ id: result.insertId, location_id: id, user_name, text, rating });
    });
});

// =====================================================
// SMART CHATBOT ENGINE — 100% Data Driven
// Hanya menjawab berdasarkan data yang ada di database
// =====================================================
const smartChatbot = (message, dbResults) => {
    const m = message.toLowerCase().trim();

    // Jika tidak ada data sama sekali
    if (!dbResults || dbResults.length === 0) {
        return 'Maaf, saya belum memiliki data destinasi wisata saat ini. Silakan coba lagi nanti.';
    }

    // ── Salam ──
    const greetings = ['halo', 'hai', 'hello', 'hi', 'selamat', 'assalamualaikum', 'permisi', 'apa kabar'];
    if (greetings.some(g => m.includes(g))) {
        const categories = [...new Set(dbResults.map(r => r.category))].join(', ');
        return `Halo! Selamat datang di Smart Wisata Sumut. Saya hanya bisa menjawab berdasarkan data destinasi wisata yang tersedia. Saat ini ada ${dbResults.length} destinasi dengan kategori: ${categories}. Silakan tanya tentang salah satunya!`;
    }

    // ── Terima kasih ──
    if (m.includes('terima kasih') || m.includes('makasih') || m.includes('thank')) {
        return 'Sama-sama! Semoga informasi wisata yang saya berikan bermanfaat. Selamat berwisata di Sumatera Utara!';
    }

    // ── Daftar semua destinasi ──
    if (m.includes('daftar') || m.includes('semua') || m.includes('list') || m.includes('apa saja')) {
        const list = dbResults.map((r, i) => `${i + 1}. ${r.name} (${r.category})`).join(', ');
        return `Berikut daftar ${dbResults.length} destinasi wisata yang tersedia: ${list}. Mau tahu detail salah satunya?`;
    }

    // ── Rekomendasi / terbaik ──
    if (m.includes('rekomendasi') || m.includes('terbaik') || m.includes('top') || m.includes('populer') || m.includes('bagus') || m.includes('saran')) {
        const top = [...dbResults].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
        const list = top.map((k, i) => `${i + 1}. ${k.name} (${k.category}) rating ${k.rating || 'N/A'} bintang`).join(', ');
        return `Berdasarkan rating tertinggi dari data kami, berikut top ${top.length} destinasi: ${list}. Mau saya ceritakan detail salah satunya?`;
    }

    // ── Pencarian berdasarkan kategori ──
    const categoryMap = {
        kuliner: 'Kuliner',
        makanan: 'Kuliner',
        makan: 'Kuliner',
        restoran: 'Kuliner',
        kafe: 'Kuliner',
        pantai: 'Pantai',
        beach: 'Pantai',
        laut: 'Pantai',
        alam: 'Alam',
        hiking: 'Alam',
        trekking: 'Alam',
        'air terjun': 'Alam',
        hutan: 'Alam',
        gunung: 'Alam',
        sejarah: 'Sejarah',
        museum: 'Sejarah',
        istana: 'Sejarah',
        heritage: 'Sejarah',
        religi: 'Religi',
        masjid: 'Religi',
        gereja: 'Religi',
        vihara: 'Religi',
        ibadah: 'Religi',
        hiburan: 'Hiburan',
        rekreasi: 'Hiburan',
        taman: 'Hiburan',
        'kebun binatang': 'Hiburan',
        wahana: 'Hiburan',
        belanja: 'Pusat Perbelanjaan',
        mall: 'Pusat Perbelanjaan',
        shopping: 'Pusat Perbelanjaan',
        pasar: 'Pusat Perbelanjaan',
    };

    for (const [keyword, categoryName] of Object.entries(categoryMap)) {
        if (m.includes(keyword)) {
            const matches = dbResults.filter(r => r.category === categoryName);
            if (matches.length === 0) {
                return `Maaf, belum ada data destinasi kategori "${categoryName}" dalam database kami saat ini.`;
            }
            const sorted = [...matches].sort((a, b) => (b.rating || 0) - (a.rating || 0));
            const list = sorted.map(k => `${k.name} di ${k.city} (rating ${k.rating || 'N/A'}, jam: ${k.operating_hours || '-'})`).join('; ');
            return `Destinasi kategori ${categoryName} yang tersedia dalam data kami (${matches.length} tempat): ${list}. Mau tahu detail salah satunya?`;
        }
    }

    // ── Jam operasional ──
    if (m.includes('jam') || m.includes('buka') || m.includes('tutup') || m.includes('operasional')) {
        // Cari nama lokasi spesifik dulu
        const found = dbResults.find(r => m.includes(r.name.toLowerCase()));
        if (found) {
            return `Jam operasional ${found.name}: ${found.operating_hours || 'informasi belum tersedia dalam data kami'}. Lokasi: ${found.city}.`;
        }
        // Umum
        const withHours = dbResults.filter(r => r.operating_hours).slice(0, 5);
        const list = withHours.map(r => `${r.name}: ${r.operating_hours}`).join('; ');
        return `Berikut jam operasional beberapa destinasi dari data kami: ${list}. Tanya nama destinasi spesifik untuk info lengkapnya!`;
    }

    // ── Kota / Kabupaten tertentu ──
    const cities = [...new Set(dbResults.map(r => r.city).filter(Boolean))];
    for (const city of cities) {
        if (city && m.includes(city.toLowerCase().replace('kabupaten ', '').replace('kota ', ''))) {
            const cityLocs = dbResults.filter(r => r.city === city);
            const list = cityLocs.map(r => `${r.name} (${r.category})`).join(', ');
            return `Destinasi wisata di ${city} berdasarkan data kami (${cityLocs.length} tempat): ${list}. Ingin tahu detail salah satunya?`;
        }
    }

    // ── Pencarian nama lokasi spesifik ──
    const nameMatch = dbResults.filter(r =>
        r.name.toLowerCase().includes(m) ||
        m.split(' ').some(word => word.length > 3 && r.name.toLowerCase().includes(word))
    );

    if (nameMatch.length > 0) {
        const loc = nameMatch[0];
        const desc = loc.description ? `Deskripsi: ${loc.description.substring(0, 150)}...` : '';
        return `Informasi tentang ${loc.name}: Kategori ${loc.category}. Lokasi di ${loc.city}, ${loc.province || 'Sumatera Utara'}. Rating: ${loc.rating || 'belum ada'} bintang. Jam buka: ${loc.operating_hours || 'tidak tersedia'}. ${desc}`;
    }

    // ── Pencarian kata kunci dalam deskripsi ──
    const descMatch = dbResults.filter(r =>
        r.description && m.split(' ').some(word => word.length > 4 && r.description.toLowerCase().includes(word))
    );

    if (descMatch.length > 0) {
        const list = descMatch.slice(0, 3).map(r => `${r.name} (${r.category})`).join(', ');
        return `Berdasarkan kata kunci Anda, destinasi yang mungkin relevan dari data kami: ${list}. Mau info lebih lanjut tentang salah satunya?`;
    }

    // ── Fallback: hanya dalam konteks data ──
    const categories = [...new Set(dbResults.map(r => r.category))].join(', ');
    return `Maaf, saya tidak menemukan informasi tersebut dalam data destinasi wisata kami. Saya hanya dapat menjawab tentang ${dbResults.length} destinasi yang ada dalam sistem. Kategori tersedia: ${categories}. Coba tanyakan nama destinasi atau kategorinya!`;
};

app.post('/api/chatbot', (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    db.query('SELECT id, name, category, city, province, rating, description, operating_hours FROM locations ORDER BY rating DESC', [], (err, results) => {
        const dbData = err ? [] : results;
        const reply = smartChatbot(message, dbData);
        res.json({ reply, totalLocations: dbData.length });
    });
});

// Get statistics
app.get('/api/stats', (req, res) => {
    const stats = {};
    
    db.query('SELECT COUNT(*) as total FROM locations', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.totalPoints = rows[0].total;
        
        db.query('SELECT category, COUNT(*) as count FROM locations GROUP BY category', (err, categories) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.categories = categories;
            
            db.query('SELECT district, COUNT(*) as count FROM locations GROUP BY district', (err, districts) => {
                if (err) return res.status(500).json({ error: err.message });
                stats.districts = districts;
                
                res.json(stats);
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
