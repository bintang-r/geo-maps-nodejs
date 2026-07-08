const mysql = require('mysql2');
const turf = require('@turf/turf');
require('dotenv').config({ path: 'c:/laragon/www/geo-grafis-pemetaan/maps-backend/.env' });

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'maps_db'
});

db.connect(async err => {
    if (err) throw err;
    console.log('Connected to DB');
    
    // Get all locations
    const [locations] = await db.promise().query('SELECT id, lat, lng FROM locations WHERE district IS NULL');
    console.log(`Found ${locations.length} locations without district.`);
    if (locations.length === 0) return process.exit(0);

    // Get all regency geojson
    const [regencies] = await db.promise().query('SELECT name, geojson_data FROM regencies');
    console.log(`Loaded ${regencies.length} regencies.`);

    let updatedCount = 0;

    for (const loc of locations) {
        const pt = turf.point([parseFloat(loc.lng), parseFloat(loc.lat)]);
        let foundDistrict = null;
        
        for (const reg of regencies) {
            if (!reg.geojson_data) continue;
            try {
                const geo = JSON.parse(reg.geojson_data);
                if (geo && geo.features) {
                    for (const feature of geo.features) {
                        if (turf.booleanPointInPolygon(pt, feature)) {
                            foundDistrict = feature.properties.district || feature.properties.kecamatan || feature.properties.name;
                            break;
                        }
                    }
                }
            } catch(e) {}
            if (foundDistrict) break;
        }

        if (foundDistrict) {
            await db.promise().query('UPDATE locations SET district = ? WHERE id = ?', [foundDistrict, loc.id]);
            updatedCount++;
        }
    }

    console.log(`Updated ${updatedCount} locations with their district name.`);
    process.exit(0);
});
