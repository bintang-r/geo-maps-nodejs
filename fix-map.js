const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'maps_db'
};

function toTitleCase(str) {
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

async function fixRegencies() {
    console.log('Connecting to DB...');
    const db = await mysql.createConnection(dbConfig);
    
    const [provinces] = await db.query('SELECT id, name FROM provinces');
    const provincesMap = {};
    provinces.forEach(p => { provincesMap[p.name.toLowerCase()] = p.id; });

    const dataDir = path.join(__dirname, '../data/indonesia-district-master');
    const folders = fs.readdirSync(dataDir).filter(f => fs.statSync(path.join(dataDir, f)).isDirectory());

    const tempDir = path.join(__dirname, 'temp_mapshaper');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    let processedCount = 0;

    for (const provFolder of folders) {
        const provPath = path.join(dataDir, provFolder);
        let provName = provFolder.replace(/^id\d+_/, '').replace(/_/g, ' ').toLowerCase();
        
        if (provName === 'daerah istimewa yogyakarta') provName = 'd.i. yogyakarta';
        if (provName === 'dki jakarta') provName = 'dki jakarta';
        if (provName === 'nanggroe aceh darussalam') provName = 'aceh';
        if (provName === 'bangka belitung') provName = 'kepulauan bangka belitung';
        
        let provId = provincesMap[provName];
        if (!provId) {
            const match = Object.keys(provincesMap).find(k => k.includes(provName) || provName.includes(k));
            if (match) provId = provincesMap[match];
            else continue;
        }

        // ONLY PROCESS SUMATERA UTARA FOR SPEED (to fix the user's issue quickly), can do all later if needed
        if (provName !== 'sumatera utara') continue;

        const regencyFolders = fs.readdirSync(provPath).filter(f => fs.statSync(path.join(provPath, f)).isDirectory());

        for (const regFolder of regencyFolders) {
            const regPath = path.join(provPath, regFolder);
            const geojsonFile = path.join(regPath, `${regFolder}.geojson`);
            
            if (fs.existsSync(geojsonFile)) {
                try {
                    let regencyName = regFolder.replace(/^id\d+_/, '').replace(/_/g, ' ');
                    regencyName = toTitleCase(regencyName);
                    
                    // We need the internal regency ID
                    const [regRows] = await db.query('SELECT id FROM regencies WHERE province_id = ? AND name LIKE ?', [provId, `%${regencyName}%`]);
                    if (regRows.length === 0) continue;
                    const regencyId = regRows[0].id;

                    const inPath = path.join(tempDir, `in_${regencyId}.json`);
                    const outPath = path.join(tempDir, `out_${regencyId}.json`);
                    
                    // Filter features that have district_code before dissolving, just to be safe
                    const rawGeojson = JSON.parse(fs.readFileSync(geojsonFile, 'utf8'));
                    rawGeojson.features = rawGeojson.features.filter(f => f.properties && f.properties.district_code);
                    fs.writeFileSync(inPath, JSON.stringify(rawGeojson));

                    console.log(`Running mapshaper for ${regencyName}...`);
                    // Use mapshaper to dissolve by district_code and keep the district name property
                    execSync(`npx mapshaper -i "${inPath}" -dissolve district_code copy-fields=district,regency -o "${outPath}" format=geojson`, { stdio: 'inherit' });

                    if (fs.existsSync(outPath)) {
                        const outData = fs.readFileSync(outPath, 'utf8');
                        await db.query('UPDATE regencies SET geojson_data = ? WHERE id = ?', [outData, regencyId]);
                        console.log(`✅ Updated ${regencyName} in DB.`);
                        processedCount++;
                    }
                } catch (e) {
                    console.error(`Error processing ${regFolder}:`, e.message);
                }
            }
        }
    }

    console.log(`Finished fixing ${processedCount} regencies in Sumatera Utara.`);
    
    // We should also update the provinces.regencies_geojson_data for SUMUT!
    console.log("Updating provinces.regencies_geojson_data for SUMUT...");
    const [regencies] = await db.query('SELECT name, geojson_data FROM regencies WHERE province_id = ?', [provincesMap['sumatera utara']]);
    
    // For provinces.regencies_geojson_data, it needs to be just the regency boundaries (dissolved further)
    // We can just use mapshaper again!
    const allDistricts = [];
    for (const r of regencies) {
        if(r.geojson_data) {
            const parsed = JSON.parse(r.geojson_data);
            allDistricts.push(...parsed.features);
        }
    }
    const sumutGeo = { type: 'FeatureCollection', features: allDistricts };
    const provIn = path.join(tempDir, `prov_in.json`);
    const provOut = path.join(tempDir, `prov_out.json`);
    fs.writeFileSync(provIn, JSON.stringify(sumutGeo));
    
    console.log(`Running mapshaper for SUMUT Province...`);
    execSync(`npx mapshaper -i "${provIn}" -dissolve regency copy-fields=regency -o "${provOut}" format=geojson`, { stdio: 'inherit' });
    
    if (fs.existsSync(provOut)) {
        const provData = fs.readFileSync(provOut, 'utf8');
        await db.query('UPDATE provinces SET regencies_geojson_data = ? WHERE id = ?', [provData, provincesMap['sumatera utara']]);
        console.log(`✅ Updated SUMUT Province boundary in DB.`);
    }

    await db.end();
}

fixRegencies();
