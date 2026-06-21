const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Get all locations
app.get('/api/locations', (req, res) => {
    db.query('SELECT * FROM locations', [], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
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
    const { name, lat, lng, category, address, country, province, city, district } = req.body;
    
    const query = `
        INSERT INTO locations (name, lat, lng, category, address, country, province, city, district) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [name, lat, lng, category, address, country, province, city, district];
    
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
    const { name, lat, lng, category, address, country, province, city, district } = req.body;
    
    const query = `
        UPDATE locations 
        SET name = ?, lat = ?, lng = ?, category = ?, address = ?, country = ?, province = ?, city = ?, district = ?
        WHERE id = ?
    `;
    const params = [name, lat, lng, category, address, country, province, city, district, id];
    
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
