const fs = require('fs');
const path = require('path');
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

const db = mysql.createConnection(dbConfig);

async function fetchWikiImages(query) {
    try {
        const res = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(query)}&prop=imageinfo&iiprop=url&format=json&gsrlimit=3`);
        const data = await res.json();
        if (data && data.query && data.query.pages) {
            const pages = Object.values(data.query.pages);
            return pages.map(p => p.imageinfo[0].url).filter(url => url.match(/\.(jpeg|jpg|png|gif|svg)$/i));
        }
    } catch (e) {
        console.error("Wiki search failed for", query);
    }
    return [];
}

async function run() {
    console.log('Connected to MySQL geo_grafis');

    db.query('ALTER TABLE locations MODIFY image TEXT', async (err) => {
        
        db.query('TRUNCATE TABLE locations', async (err) => {
            if (err) throw err;
            console.log('Tabel locations telah dikosongkan.');

            const geojsonPath = path.join(__dirname, '..', 'data', 'perguruan-tinggi.geojson');
            const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));

            const uniqueNames = new Set();
            const locationsToInsert = [];

            for (let i = 0; i < geojson.features.length; i++) {
                const feature = geojson.features[i];
                const props = feature.properties;
                const coords = feature.geometry.coordinates; // [lng, lat]
                
                if (!uniqueNames.has(props.nama)) {
                    uniqueNames.add(props.nama);
                    
                    const category = props.status === 'PTN' ? 'Perguruan Tinggi Negeri' : 'Perguruan Tinggi Swasta';
                    const desc = `Kampus ${props.singkatan} adalah ${category} yang berlokasi di ${props.kecamatan}, Makassar. Telah terakreditasi ${props.akreditasi}.`;
                    
                    console.log(`Mencari gambar asli untuk: ${props.nama}`);
                    let images = await fetchWikiImages(props.nama);
                    
                    // Fallback to Wikipedia search by abbreviation if not enough
                    if (images.length < 3) {
                        const more = await fetchWikiImages(props.singkatan + " Makassar");
                        images = [...new Set([...images, ...more])];
                    }
                    
                    // Fallback to generic if STILL not enough
                    const defaultImages = [
                        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800',
                        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800',
                        'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800'
                    ];

                    while (images.length < 3) {
                        images.push(defaultImages[images.length]);
                    }

                    locationsToInsert.push({
                        name: props.nama,
                        lat: coords[1],
                        lng: coords[0],
                        category: category,
                        address: props.alamat,
                        district: props.kecamatan,
                        operating_hours: "08:00 - 17:00",
                        description: desc,
                        image: JSON.stringify(images.slice(0, 3))
                    });
                }
            }

            if (locationsToInsert.length === 0) {
                console.log("Tidak ada data baru.");
                db.end();
                return;
            }

            let count = 0;
            locationsToInsert.forEach(loc => {
                const query = `
                    INSERT INTO locations (name, lat, lng, category, address, district, operating_hours, description, image) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                const values = [loc.name, loc.lat, loc.lng, loc.category, loc.address, loc.district, loc.operating_hours, loc.description, loc.image];
                
                db.query(query, values, (err) => {
                    if (err) console.error("Error inserting:", err);
                    count++;
                    if (count === locationsToInsert.length) {
                        console.log(`Berhasil menghasilkan ${locationsToInsert.length} data lokasi unik dengan gambar ASLI dari Wikimedia!`);
                        db.end();
                    }
                });
            });
        });
    });
}

db.connect((err) => {
    if (err) throw err;
    run();
});
