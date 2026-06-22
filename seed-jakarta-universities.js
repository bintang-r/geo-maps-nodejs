const https = require('https');
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'geo_grafis',
  port: process.env.DB_PORT || 3306
});

const query = `
  [out:json][timeout:30];
  (
    node["amenity"="university"](-6.38,106.67,-6.08,106.98);
    way["amenity"="university"](-6.38,106.67,-6.08,106.98);
    relation["amenity"="university"](-6.38,106.67,-6.08,106.98);
  );
  out center;
`;

const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query.trim());

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
    'Accept': 'application/json'
  }
};

console.log("Fetching Jakarta universities from Overpass API (GET)...");

https.get(url, options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (!data.elements || data.elements.length === 0) {
        console.error("No elements found in Overpass API response.");
        console.log("Response was:", body);
        process.exit(1);
      }

      const list = data.elements
        .map(el => {
          const name = el.tags.name || el.tags['name:en'] || '';
          const lat = el.lat || (el.center && el.center.lat);
          const lng = el.lon || (el.center && el.center.lon);
          const addr = el.tags['addr:street'] || el.tags.address || 'DKI Jakarta';
          return { name, lat, lng, addr };
        })
        .filter(c => c.lat && c.lng && c.name.trim().length > 3);

      // Deduplicate by name
      const uniqueMap = new Map();
      list.forEach(c => uniqueMap.set(c.name.toLowerCase(), c));
      const campuses = Array.from(uniqueMap.values());

      console.log(`Found ${campuses.length} unique universities in Jakarta from Overpass API.`);

      db.connect((err) => {
        if (err) {
          console.error("Database connection failed:", err.message);
          process.exit(1);
        }

        // Describe table to check schema
        db.query('DESCRIBE locations', (err, cols) => {
          if (err) {
            console.error("Failed to describe locations table:", err.message);
            db.end();
            process.exit(1);
          }

          const hasImageCol = cols.some(c => c.Field === 'image');
          const hasImagesCol = cols.some(c => c.Field === 'images');
          
          let imageColName = 'images';
          if (hasImageCol && !hasImagesCol) {
            imageColName = 'image';
          }

          console.log(`Using locations table image column name: "${imageColName}"`);

          const insertQuery = `
            INSERT INTO locations (name, lat, lng, category, address, country, province, city, ${imageColName}) 
            VALUES ?
          `;

          const values = campuses.map(c => {
            const isState = c.name.toLowerCase().includes('negeri') || 
                            c.name.toLowerCase().includes('indonesia') || 
                            c.name.toLowerCase().includes('nasional');
            const category = isState ? 'Perguruan Tinggi Negeri' : 'Perguruan Tinggi Swasta';
            
            return [
              c.name,
              c.lat,
              c.lng,
              category,
              c.addr,
              'Indonesia',
              'DKI Jakarta',
              'Jakarta',
              '[]' // empty image array JSON
            ];
          });

          db.query(insertQuery, [values], (err, result) => {
            if (err) {
              console.error("Error inserting locations:", err.message);
            } else {
              console.log(`Successfully seeded ${result.affectedRows} Jakarta universities into the locations table!`);
            }
            db.end();
            process.exit(0);
          });
        });
      });

    } catch (e) {
      console.error("Error parsing Overpass response:", e.message);
      console.log("Response body was:", body);
      process.exit(1);
    }
  });
}).on('error', (e) => {
  console.error("HTTP request error:", e.message);
  process.exit(1);
});
