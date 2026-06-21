const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'geo_grafis',
    port: process.env.DB_PORT || 3306
};

const connection = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    port: dbConfig.port
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.stack);
        return;
    }
    
    connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``, (err) => {
        if (err) return console.error("Error creating database:", err);

        const db = mysql.createConnection(dbConfig);
        
        db.connect((err) => {
            if (err) return console.error("Error connecting to database:", err);
            
            console.log("Connected to the MySQL server.");
            
            const initDb = () => {
                // CATEGORIES
                const createCategoriesTable = `
                    CREATE TABLE IF NOT EXISTS categories (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        color VARCHAR(50) DEFAULT '#3b82f6',
                        icon_name VARCHAR(100) DEFAULT 'fa-solid fa-location-dot'
                    )
                `;
                db.query(createCategoriesTable, (err) => {
                    if (err) return console.error("Error categories table:", err.message);
                    db.query("SELECT COUNT(*) AS count FROM categories", (err, results) => {
                        if (results && results[0].count === 0) {
                            const defaultCategories = [
                                ['Perguruan Tinggi Negeri', '#3b82f6', 'fa-solid fa-graduation-cap'],
                                ['Perguruan Tinggi Swasta', '#8b5cf6', 'fa-solid fa-school'],
                                ['Rumah Sakit', '#ef4444', 'fa-solid fa-hospital'],
                                ['Wisata', '#10b981', 'fa-solid fa-tree'],
                                ['Pusat Perbelanjaan', '#f59e0b', 'fa-solid fa-cart-shopping'],
                                ['Lainnya', '#64748b', 'fa-solid fa-map-pin']
                            ];
                            db.query("INSERT INTO categories (name, color, icon_name) VALUES ?", [defaultCategories]);
                        }
                    });
                });

                // PROVINCES
                const createProvincesTable = `
                    CREATE TABLE IF NOT EXISTS provinces (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        geojson_data LONGTEXT
                    )
                `;
                db.query(createProvincesTable, (err) => {
                    if (err) return console.error("Error provinces table:", err.message);
                    db.query("SELECT COUNT(*) AS count FROM provinces", (err, results) => {
                        if (results && results[0].count === 0) {
                            db.query("INSERT INTO provinces (name) VALUES ('Sulawesi Selatan')");
                        }
                    });
                });

                // REGENCIES (Kabupaten/Kota)
                const createRegenciesTable = `
                    CREATE TABLE IF NOT EXISTS regencies (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        province_id INT,
                        name VARCHAR(255) NOT NULL,
                        geojson_data LONGTEXT,
                        FOREIGN KEY (province_id) REFERENCES provinces(id) ON DELETE CASCADE
                    )
                `;
                db.query(createRegenciesTable);

                // DISTRICTS (Kecamatan)
                const createDistrictsTable = `
                    CREATE TABLE IF NOT EXISTS districts (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        regency_id INT,
                        name VARCHAR(255) NOT NULL,
                        FOREIGN KEY (regency_id) REFERENCES regencies(id) ON DELETE CASCADE
                    )
                `;
                db.query(createDistrictsTable);

                // LOCATIONS
                const createLocationsTable = `
                    CREATE TABLE IF NOT EXISTS locations (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        lat DOUBLE NOT NULL,
                        lng DOUBLE NOT NULL,
                        category VARCHAR(100),
                        address TEXT,
                        country VARCHAR(100) DEFAULT 'Indonesia',
                        province VARCHAR(100),
                        city VARCHAR(100),
                        district VARCHAR(100),
                        operating_hours VARCHAR(255),
                        images JSON,
                        description TEXT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                `;
                db.query(createLocationsTable);
            };

            initDb();
            module.exports = db;
        });
    });
});

const pool = mysql.createPool(dbConfig);
module.exports = pool;
