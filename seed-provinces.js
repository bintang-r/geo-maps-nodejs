const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

async function seedProvinces() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'geo_grafis'
    });

    const geojsonPath = path.join(__dirname, '../data/Provinsi/38 Provinsi Indonesia - Provinsi.json');
    console.log(`Reading GeoJSON from ${geojsonPath}...`);
    
    const geojsonData = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));

    const features = geojsonData.features;

    console.log(`Found ${features.length} provinces in the GeoJSON.`);

    for (const feature of features) {
        // Fix for title case formatting
        let provName = feature.properties.PROVINSI;
        
        // Ensure consistent casing: e.g. "Sulawesi Selatan"
        provName = provName.split(' ').map(word => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');

        // Convert the feature back to a FeatureCollection for standard leafelt consumption
        const featureGeojson = {
            type: "FeatureCollection",
            features: [feature]
        };

        const geojsonString = JSON.stringify(featureGeojson);

        // Check if province exists
        const [rows] = await db.execute('SELECT id FROM provinces WHERE name = ?', [provName]);
        
        if (rows.length > 0) {
            // Update
            await db.execute('UPDATE provinces SET geojson_data = ? WHERE id = ?', [geojsonString, rows[0].id]);
            console.log(`Updated province: ${provName}`);
        } else {
            // Insert
            await db.execute('INSERT INTO provinces (name, geojson_data) VALUES (?, ?)', [provName, geojsonString]);
            console.log(`Inserted new province: ${provName}`);
        }
    }

    console.log("Seeding provinces complete!");
    db.end();
}

seedProvinces().catch(console.error);
