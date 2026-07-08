const mysql = require('mysql2');
const turf = require('@turf/turf');
require('dotenv').config({ path: '.env' });

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'maps_db'
});

db.connect(async err => {
    if (err) throw err;
    console.log('Connected to DB');
    
    // Add new column if not exists
    try {
        await db.promise().query('ALTER TABLE provinces ADD COLUMN regencies_geojson_data LONGTEXT');
        console.log('Added regencies_geojson_data column to provinces table');
    } catch(e) {
        if (!e.message.includes('Duplicate column name')) {
            throw e;
        }
    }

    const [provinces] = await db.promise().query('SELECT id, name FROM provinces');

    for (const prov of provinces) {
        console.log(`Processing province: ${prov.name}`);
        const [regencies] = await db.promise().query('SELECT name, geojson_data FROM regencies WHERE province_id = ?', [prov.id]);
        
        const allDissolvedFeatures = [];
        
        for (const r of regencies) {
            try {
                const geo = JSON.parse(r.geojson_data);
                geo.features.forEach(f => f.properties.clean_regency = r.name);
                
                const flat = turf.flatten(geo);
                // Simplify before dissolving to speed it up and reduce output size!
                const simplified = turf.simplify(flat, { tolerance: 0.005, highQuality: false });
                
                const d = turf.dissolve(simplified, { propertyName: 'clean_regency' });
                
                d.features.forEach(f => {
                    f.properties = { regency: r.name };
                });
                
                allDissolvedFeatures.push(...d.features);
                process.stdout.write('.');
            } catch(e) {
                console.error(`\nFailed for regency ${r.name}: ${e.message}`);
                // fallback to simplified districts if dissolve fails
                try {
                    const geo = JSON.parse(r.geojson_data);
                    const flat = turf.flatten(geo);
                    const simplified = turf.simplify(flat, { tolerance: 0.005, highQuality: false });
                    simplified.features.forEach(f => { f.properties = { regency: r.name }; });
                    allDissolvedFeatures.push(...simplified.features);
                } catch (e2) {}
            }
        }
        
        console.log(`\nFinished processing ${regencies.length} regencies for ${prov.name}. Total features: ${allDissolvedFeatures.length}`);
        
        const finalGeo = { type: 'FeatureCollection', features: allDissolvedFeatures };
        
        await db.promise().query('UPDATE provinces SET regencies_geojson_data = ? WHERE id = ?', [JSON.stringify(finalGeo), prov.id]);
        console.log(`Saved to DB for ${prov.name}`);
    }

    process.exit(0);
});
