const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'maps_db'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
    console.log('Connected to database.');
    seedRegencies();
});

function toTitleCase(str) {
    return str.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

async function seedRegencies() {
    console.log('Starting regencies seeding process...');

    const provincesMap = {};
    // Get all provinces to map IDs
    try {
        const [rows] = await db.promise().query('SELECT id, name FROM provinces');
        rows.forEach(r => {
            // e.g. "SULAWESI SELATAN" -> 12
            provincesMap[r.name.toLowerCase()] = r.id;
        });
    } catch (e) {
        console.error('Error fetching provinces:', e);
        process.exit(1);
    }

    const dataDir = path.join(__dirname, '../data/indonesia-district-master');
    const folders = fs.readdirSync(dataDir).filter(f => fs.statSync(path.join(dataDir, f)).isDirectory());

    console.log(`Found ${folders.length} province folders.`);

    // Truncate existing regencies to start fresh
    await db.promise().query('TRUNCATE TABLE regencies');

    let totalInserted = 0;

    for (const provFolder of folders) {
        const provPath = path.join(dataDir, provFolder);
        // Extracts the province name from the folder name e.g. id73_sulawesi_selatan -> sulawesi selatan
        // Wait, the folder name might have underscores.
        let provName = provFolder.replace(/^id\d+_/, '').replace(/_/g, ' ').toLowerCase();
        
        // Manual mapping for some tricky ones (like D.I Yogyakarta vs Daerah Istimewa Yogyakarta)
        if (provName === 'daerah istimewa yogyakarta') provName = 'd.i. yogyakarta';
        if (provName === 'dki jakarta') provName = 'dki jakarta';
        if (provName === 'nanggroe aceh darussalam') provName = 'aceh'; // just in case
        if (provName === 'bangka belitung') provName = 'kepulauan bangka belitung';
        
        // Let's find province ID using a more flexible matching
        let provId = provincesMap[provName];
        if (!provId) {
            // try to match loosely
            const match = Object.keys(provincesMap).find(k => k.includes(provName) || provName.includes(k));
            if (match) {
                provId = provincesMap[match];
            } else {
                console.warn(`Warning: Could not map province folder "${provFolder}" to database province. Skipping...`);
                continue;
            }
        }

        const regencyFolders = fs.readdirSync(provPath).filter(f => fs.statSync(path.join(provPath, f)).isDirectory());

        for (const regFolder of regencyFolders) {
            const regPath = path.join(provPath, regFolder);
            // The combined regency geojson is expected to be named the same as its folder + .geojson
            // e.g. id7371_kota_makassar.geojson inside id7371_kota_makassar/
            const geojsonFile = path.join(regPath, `${regFolder}.geojson`);
            
            if (fs.existsSync(geojsonFile)) {
                try {
                    const geojsonRaw = fs.readFileSync(geojsonFile, 'utf8');
                    const geojsonData = JSON.parse(geojsonRaw);
                    
                    // Extract regency name from the first feature, or from the folder name
                    let regencyName = '';
                    if (geojsonData.features && geojsonData.features.length > 0 && geojsonData.features[0].properties.regency) {
                        regencyName = geojsonData.features[0].properties.regency;
                    } else {
                        // Extract from folder name e.g. id7371_kota_makassar -> KOTA MAKASSAR
                        regencyName = regFolder.replace(/^id\d+_/, '').replace(/_/g, ' ');
                    }

                    // Format nicely
                    regencyName = toTitleCase(regencyName).toUpperCase(); // usually we store regencies in upper or title case, let's use Title Case
                    regencyName = toTitleCase(regencyName);

                    // Insert to DB
                    await db.promise().query(
                        'INSERT INTO regencies (province_id, name, geojson_data) VALUES (?, ?, ?)',
                        [provId, regencyName, geojsonRaw]
                    );
                    
                    totalInserted++;
                    // console.log(`Inserted: ${regencyName}`);

                } catch (e) {
                    console.error(`Failed to process ${geojsonFile}:`, e.message);
                }
            } else {
                console.warn(`Warning: Expected geojson file not found at ${geojsonFile}`);
            }
        }
    }

    console.log(`\nSuccess! Seeded ${totalInserted} regencies to database.`);
    process.exit(0);
}
