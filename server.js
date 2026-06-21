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
    db.query('SELECT * FROM locations', [], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
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
        INSERT INTO locations (name, lat, lng, category, address, country, province, city, district, image, description, operating_hours) 
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
        SET name = ?, lat = ?, lng = ?, category = ?, address = ?, country = ?, province = ?, city = ?, district = ?, image = ?, description = ?, operating_hours = ?
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
