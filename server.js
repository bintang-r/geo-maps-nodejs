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

// COMMENTS
app.get('/api/locations/:id/comments', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM comments WHERE location_id = ? ORDER BY created_at DESC', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/locations/:id/comments', (req, res) => {
    const { id } = req.params;
    const { user_name, text, rating } = req.body;
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
// SMART CHATBOT ENGINE — Smart Wisata Sumut
// =====================================================
const smartChatbot = (message, dbResults) => {
    const m = message.toLowerCase().trim();

    const greetings = ['halo', 'hai', 'hello', 'hi', 'selamat', 'assalamualaikum', 'permisi'];
    if (greetings.some(g => m.includes(g))) {
        return `Halo! 👋 Selamat datang di Smart Wisata Sumut! Saya asisten AI yang siap membantu Anda menemukan destinasi wisata terbaik di Sumatera Utara. Anda bisa tanya soal kuliner, pantai, alam, sejarah, religi, hiburan, atau pusat perbelanjaan. Apa yang ingin Anda ketahui?`;
    }

    if (m.includes('terima kasih') || m.includes('makasih') || m.includes('thank')) {
        return `Sama-sama! 😊 Selamat berwisata di Sumatera Utara. Semoga perjalanan Anda menyenangkan! Kalau ada pertanyaan lain, saya siap membantu kapan saja.`;
    }

    if (m.includes('danau toba') || (m.includes('toba') && !m.includes('samosir'))) {
        const loc = dbResults.find(r => r.name.toLowerCase().includes('danau toba'));
        const rating = loc ? `Rating: ${loc.rating}/5` : '';
        return `Danau Toba adalah danau vulkanik terbesar di dunia dengan luas sekitar 1.130 km persegi! ${rating}. Di tengah danau terdapat Pulau Samosir, pusat kebudayaan Batak Toba. Akses dari Medan sekitar 3 sampai 4 jam berkendara. Suhu di sana 18 sampai 25 derajat Celcius, jadi jangan lupa bawa jaket ya!`;
    }

    if (m.includes('samosir')) {
        return `Pulau Samosir adalah pulau vulkanik di tengah Danau Toba yang merupakan pusat kebudayaan Batak Toba. Di sana Anda bisa menemukan desa tradisional, makam raja Batak, kerajinan tenun Ulos, dan menikmati pemandangan danau yang memukau dari berbagai sisi pulau.`;
    }

    if (m.includes('kuliner') || m.includes('makanan') || m.includes('makan') || m.includes('restoran') || m.includes('wisata kuliner')) {
        const kuliners = dbResults.filter(r => r.category === 'Kuliner').slice(0, 3);
        const list = kuliners.map(k => `${k.name} dengan rating ${k.rating} di ${k.city}`).join(', ');
        return `Wisata kuliner Sumatera Utara sangat kaya! Beberapa rekomendasi: ${list}. Makanan wajib coba antara lain Soto Medan dengan kuah santan yang gurih, Mie Aceh yang pedas dan kaya rempah, Bika Ambon sebagai oleh-oleh khas, dan Ikan Mas Arsik khas masakan Batak. Mana yang ingin Anda coba duluan?`;
    }

    if (m.includes('pantai') || m.includes('beach') || m.includes('surfing') || m.includes('snorkeling')) {
        const beaches = dbResults.filter(r => r.category === 'Pantai').slice(0, 3);
        const list = beaches.map(k => `${k.name} di ${k.city}`).join(', ');
        return `Pantai di Sumatera Utara sangat indah! Beberapa pilihan: ${list}. Pantai Lagundri dan Sorake di Nias adalah pantai kelas dunia untuk surfing dengan ombak yang konsisten dan sempurna, terkenal di kalangan peselancar internasional sejak tahun 1970-an! Waktu terbaik berkunjung adalah April hingga September.`;
    }

    if (m.includes('alam') || m.includes('hiking') || m.includes('trekking') || m.includes('air terjun') || m.includes('hutan')) {
        const natures = dbResults.filter(r => r.category === 'Alam').slice(0, 3);
        const list = natures.map(k => `${k.name} di ${k.city}`).join(', ');
        return `Wisata alam Sumatera Utara luar biasa! Antara lain: ${list}. Bukit Lawang adalah pintu masuk ke Taman Nasional Gunung Leuser untuk melihat orangutan Sumatera liar di habitatnya. Air Terjun Sipiso-piso setinggi 120 meter adalah salah satu yang tertinggi di Indonesia dengan pemandangan langsung ke Danau Toba!`;
    }

    if (m.includes('sejarah') || m.includes('museum') || m.includes('istana') || m.includes('batak') || m.includes('kolonial')) {
        const histories = dbResults.filter(r => r.category === 'Sejarah').slice(0, 3);
        const list = histories.map(k => `${k.name} di ${k.city}`).join(', ');
        return `Wisata sejarah Sumatera Utara sangat kaya: ${list}. Istana Maimun dibangun tahun 1888, merupakan ikon Kota Medan peninggalan Kesultanan Deli dengan arsitektur perpaduan Islam, Melayu, dan Eropa. Museum Batak TB Silalahi Center di tepi Danau Toba menyimpan ribuan koleksi artefak budaya Batak.`;
    }

    if (m.includes('religi') || m.includes('masjid') || m.includes('gereja') || m.includes('vihara') || m.includes('ibadah')) {
        const religions = dbResults.filter(r => r.category === 'Religi').slice(0, 3);
        const list = religions.map(k => `${k.name} di ${k.city}`).join(', ');
        return `Wisata religi Sumatera Utara: ${list}. Masjid Raya Al-Mashun Medan dibangun tahun 1906, merupakan salah satu masjid terindah di Indonesia dengan arsitektur perpaduan Timur Tengah, India Mughal, dan Spanyol. Vihara Gunung Timur adalah vihara Tionghoa terbesar di Sumatera!`;
    }

    if (m.includes('hiburan') || m.includes('rekreasi') || m.includes('taman') || m.includes('kebun binatang')) {
        const ents = dbResults.filter(r => r.category === 'Hiburan').slice(0, 3);
        const list = ents.map(k => `${k.name} di ${k.city}`).join(', ');
        return `Wisata hiburan Sumatera Utara: ${list}. Medan Zoo memiliki koleksi satwa asli Sumatera seperti harimau Sumatera, orangutan, dan gajah. Taman Teladan adalah taman kota favorit warga Medan untuk olahraga dan piknik keluarga.`;
    }

    if (m.includes('belanja') || m.includes('mall') || m.includes('shopping') || m.includes('pusat perbelanjaan') || m.includes('pasar')) {
        const malls = dbResults.filter(r => r.category === 'Pusat Perbelanjaan').slice(0, 3);
        const list = malls.map(k => `${k.name} di ${k.city}`).join(', ');
        return `Pusat perbelanjaan di Sumatera Utara: ${list}. Sun Plaza adalah mall premium terbesar Medan dengan lebih dari 300 tenant, buka pukul 10 sampai 22. Pasar Berastagi di dataran tinggi Karo adalah surga belanja produk pertanian segar seperti markisa, jeruk, dan stroberi langsung dari petani!`;
    }

    if (m.includes('medan') || m.includes('kota medan')) {
        const medanLocs = dbResults.filter(r => r.city === 'Kota Medan').slice(0, 4);
        const list = medanLocs.map(k => `${k.name} kategori ${k.category}`).join(', ');
        return `Kota Medan adalah ibukota Sumatera Utara dan kota terbesar ke-3 di Indonesia! Destinasi populer di Medan antara lain: ${list}. Medan mudah diakses via Bandara Internasional Kualanamu, sekitar 40 menit dari pusat kota. Ada kereta bandara yang praktis!`;
    }

    if (m.includes('nias') || m.includes('lagundri') || m.includes('sorake')) {
        return `Pulau Nias adalah surga tersembunyi di Sumatera Utara! Daya tarik utamanya adalah Pantai Lagundri dan Sorake, surf spot kelas dunia. Ada juga tradisi Lompat Batu yang unik, rumah adat Omo Hada yang megah, dan festival budaya yang spektakuler. Akses bisa via penerbangan dari Kualanamu sekitar 1 jam, atau kapal feri dari Sibolga selama 8 sampai 10 jam.`;
    }

    if (m.includes('rekomendasi') || m.includes('saran') || m.includes('terbaik') || m.includes('top') || m.includes('populer')) {
        const topLocs = [...dbResults].sort((a, b) => b.rating - a.rating).slice(0, 5);
        const list = topLocs.map((k, i) => `${i + 1}. ${k.name} kategori ${k.category} dengan rating ${k.rating}`).join(', ');
        return `Berikut top 5 destinasi wisata Sumatera Utara berdasarkan rating: ${list}. Semua destinasi ini sangat layak dikunjungi! Ingin saya bantu merencanakan rute perjalanan?`;
    }

    if (m.includes('transportasi') || m.includes('akses') || m.includes('perjalanan') || m.includes('naik apa')) {
        return `Cara menuju destinasi wisata Sumut: Bandara Kualanamu adalah hub utama Medan dengan kereta bandara ke pusat kota. Dari Medan ke Danau Toba sekitar 3 sampai 4 jam, ke Bukit Lawang sekitar 3 jam, ke Berastagi sekitar 2 jam, dan ke Pantai Cermin sekitar 1 jam. Ke Nias bisa naik pesawat dari Kualanamu sekitar 1 jam, atau kapal feri dari Sibolga. Sewa mobil dengan sopir lokal sangat direkomendasikan untuk perjalanan yang nyaman!`;
    }

    if (m.includes('jam') || m.includes('buka') || m.includes('tutup') || m.includes('waktu')) {
        return `Informasi jam operasional umum: Alam dan pantai umumnya buka 24 jam dan terbaik dikunjungi pagi atau sore hari. Museum dan wisata sejarah umumnya buka pukul 8 sampai 17. Tempat religi buka dari pukul 5 pagi. Mall buka pukul 10 sampai 22. Restoran dan kuliner bervariasi, banyak yang buka hingga malam hari. Disarankan cek Google Maps untuk jam terkini sebelum berkunjung.`;
    }

    // Dynamic lookup in DB
    const matching = dbResults.filter(r =>
        r.name.toLowerCase().includes(m) ||
        (r.description && r.description.toLowerCase().includes(m)) ||
        r.category.toLowerCase().includes(m)
    );

    if (matching.length > 0) {
        const loc = matching[0];
        return `Saya menemukan informasi tentang ${loc.name}! Kategori: ${loc.category}. Rating: ${loc.rating}/5. Lokasi: ${loc.city}. Jam buka: ${loc.operating_hours || 'informasi belum tersedia'}. ${loc.description ? loc.description : ''} Ada yang ingin Anda tanyakan lagi?`;
    }

    return `Saya belum memiliki informasi spesifik tentang itu. Coba tanyakan tentang destinasi wisata seperti Danau Toba, Bukit Lawang, atau Nias. Atau tanyakan berdasarkan kategori seperti kuliner, pantai, alam, sejarah, religi, hiburan, atau belanja. Bisa juga tanya info transportasi atau rekomendasi destinasi terbaik. Saya siap membantu!`;
};

app.post('/api/chatbot', (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    db.query('SELECT id, name, category, city, rating, description, operating_hours FROM locations', [], (err, results) => {
        const dbData = err ? [] : results;
        const reply = smartChatbot(message, dbData);
        res.json({ reply });
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
