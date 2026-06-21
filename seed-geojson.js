const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'geo_grafis',
    port: process.env.DB_PORT || 3306
};

const db = mysql.createConnection(dbConfig);

function seedGeojson() {
    db.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL for seeding', err.message);
            process.exit(1);
        }

        const dataPath = path.resolve(__dirname, '../data/kecamatan-makassar.geojson');
        fs.readFile(dataPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading geojson file:', err);
                return db.end();
            }

            let geojson;
            try {
                geojson = JSON.parse(data);
            } catch(e) {
                console.error("Error parsing geojson", e);
                return db.end();
            }

            // Ensure province exists
            db.query("SELECT id FROM provinces WHERE name = 'Sulawesi Selatan'", (err, results) => {
                if (err) return db.end();
                
                let provinceId;
                if (results.length > 0) {
                    provinceId = results[0].id;
                    insertRegency(provinceId, data);
                } else {
                    db.query("INSERT INTO provinces (name) VALUES ('Sulawesi Selatan')", (err, res) => {
                        if (err) return db.end();
                        provinceId = res.insertId;
                        insertRegency(provinceId, data);
                    });
                }
            });
        });
    });
}

function insertRegency(provinceId, geojsonData) {
    db.query("SELECT id FROM regencies WHERE name = 'Kota Makassar'", (err, results) => {
        if (results && results.length > 0) {
            console.log("Regency 'Kota Makassar' already exists. Updating GeoJSON...");
            db.query("UPDATE regencies SET geojson_data = ? WHERE id = ?", [geojsonData, results[0].id], (err) => {
                if (err) console.error(err);
                else console.log("GeoJSON updated successfully.");
                db.end();
                process.exit(0);
            });
        } else {
            console.log("Inserting 'Kota Makassar' Regency...");
            db.query("INSERT INTO regencies (province_id, name, geojson_data) VALUES (?, ?, ?)", [provinceId, 'Kota Makassar', geojsonData], (err) => {
                if (err) console.error(err);
                else console.log("Regency inserted successfully.");
                db.end();
                process.exit(0);
            });
        }
    });
}

seedGeojson();
