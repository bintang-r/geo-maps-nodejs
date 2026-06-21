const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

const dataPath = path.resolve(__dirname, '../data/perguruan-tinggi.geojson');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'geo_grafis'
});

function seedData() {
    db.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL for seeding', err.message);
            // It might take a moment for the DB to be created by server.js/database.js
            console.log('Make sure to run server.js first so the database is created.');
            process.exit(1);
        }

        fs.readFile(dataPath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading geojson file:', err);
                return;
            }

            try {
                const geojson = JSON.parse(data);
                const features = geojson.features;

                console.log(`Found ${features.length} features to seed.`);

                const query = `
                    INSERT INTO locations (name, lat, lng, category, address, country, province, city, district) 
                    VALUES ?
                `;

                const values = features.map(feature => {
                    const props = feature.properties;
                    const coords = feature.geometry.coordinates; // [lng, lat]
                    
                    return [
                        props.nama,
                        coords[1], // lat
                        coords[0], // lng
                        props.status === 'PTN' ? 'Perguruan Tinggi Negeri' : 'Perguruan Tinggi Swasta',
                        props.alamat,
                        'Indonesia',
                        'Sulawesi Selatan',
                        'Makassar',
                        props.kecamatan
                    ];
                });

                db.query(query, [values], (err, result) => {
                    if (err) {
                        console.error('Error inserting rows:', err);
                    } else {
                        console.log(`Successfully seeded ${result.affectedRows} locations.`);
                    }
                    db.end();
                    process.exit(0);
                });

            } catch (e) {
                console.error('Error parsing JSON:', e);
                db.end();
            }
        });
    });
}

// Give a slight delay just in case this runs immediately after database creation
setTimeout(() => {
    seedData();
}, 2000);
