const mysql = require('mysql2/promise');
const turf = require('@turf/turf');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'geo_grafis'
};

async function processRegencies() {
    console.log('Connecting to database...');
    const db = await mysql.createConnection(dbConfig);
    
    console.log('Fetching all regencies...');
    const [regencies] = await db.query('SELECT id, name, geojson_data FROM regencies');
    console.log(`Found ${regencies.length} regencies to process.`);

    let processedCount = 0;

    for (const regency of regencies) {
        if (!regency.geojson_data) continue;
        
        try {
            let geojsonData = JSON.parse(regency.geojson_data);
            
            if (geojsonData.features && geojsonData.features.length > 0) {
                // Check if they are already districts (to avoid re-dissolving)
                // If the number of features matches the unique number of district_codes, it's already districts
                const uniqueDistricts = new Set(geojsonData.features.map(f => f.properties.district_code).filter(Boolean));
                
                if (uniqueDistricts.size > 0 && geojsonData.features.length > uniqueDistricts.size) {
                    geojsonData.features = geojsonData.features.filter(f => f.properties && f.properties.district_code);
                    
                    // Flatten MultiPolygons to Polygons for safe dissolving
                    const flatData = turf.flatten(geojsonData);
                    
                    const dissolved = turf.dissolve(flatData, { propertyName: 'district_code' });
                    
                    await db.query('UPDATE regencies SET geojson_data = ? WHERE id = ?', [JSON.stringify(dissolved), regency.id]);
                    processedCount++;
                    console.log(`Processed ${processedCount}: ${regency.name} (${geojsonData.features.length} villages -> ${dissolved.features.length} districts)`);
                } else {
                    console.log(`Skipped ${regency.name} (already dissolved or no district_code)`);
                }
            }
        } catch (e) {
            console.error(`Error processing regency ID ${regency.id} (${regency.name}):`, e.message);
        }
    }

    console.log('Finished processing all regencies.');
    await db.end();
    process.exit(0);
}

processRegencies();
