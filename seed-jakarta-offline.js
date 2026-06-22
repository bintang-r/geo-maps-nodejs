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

const campuses = [
  { name: 'Universitas Indonesia (Salemba)', city: 'Kota Jakarta Pusat', district: 'Senen', lat: -6.1949, lng: 106.8489, addr: 'Jl. Salemba Raya No. 4, Jakarta Pusat' },
  { name: 'Universitas Negeri Jakarta (UNJ)', city: 'Kota Jakarta Timur', district: 'Pulo Gadung', lat: -6.1947, lng: 106.8833, addr: 'Jl. Rawamangun Muka, Pulo Gadung, Jakarta Timur' },
  { name: 'Universitas Trisakti', city: 'Kota Jakarta Barat', district: 'Grogol Petamburan', lat: -6.1672, lng: 106.7901, addr: 'Jl. Kyai Tapa No. 1, Grogol Petamburan, Jakarta Barat' },
  { name: 'Universitas Tarumanagara (UNTAR)', city: 'Kota Jakarta Barat', district: 'Grogol Petamburan', lat: -6.1685, lng: 106.7876, addr: 'Jl. Letjen S. Parman No. 1, Grogol Petamburan, Jakarta Barat' },
  { name: 'Universitas Bina Nusantara (BINUS)', city: 'Kota Jakarta Barat', district: 'Palmerah', lat: -6.2241, lng: 106.7826, addr: 'Jl. Raya Kebon Jeruk No. 27, Kebon Jeruk, Jakarta Barat' },
  { name: 'Universitas Katolik Atma Jaya', city: 'Kota Jakarta Selatan', district: 'Setiabudi', lat: -6.2189, lng: 106.8153, addr: 'Jl. Jenderal Sudirman No. 51, Setiabudi, Jakarta Selatan' },
  { name: 'Universitas Mercu Buana', city: 'Kota Jakarta Barat', district: 'Kembangan', lat: -6.2081, lng: 106.7351, addr: 'Jl. Meruya Selatan No. 1, Kembangan, Jakarta Barat' },
  { name: 'Universitas Muhammadiyah UHAMKA', city: 'Kota Jakarta Selatan', district: 'Kebayoran Baru', lat: -6.2374, lng: 106.8587, addr: 'Jl. Limau II, Kebayoran Baru, Jakarta Selatan' },
  { name: 'Universitas Pancasila', city: 'Kota Jakarta Selatan', district: 'Jagakarsa', lat: -6.3402, lng: 106.8327, addr: 'Jl. Srengseng Sawah, Jagakarsa, Jakarta Selatan' },
  { name: 'Universitas Gunadarma', city: 'Kota Jakarta Pusat', district: 'Senen', lat: -6.1774, lng: 106.8184, addr: 'Jl. Kenari No. 13, Jakarta Pusat' },
  { name: 'Universitas Nasional (UNAS)', city: 'Kota Jakarta Selatan', district: 'Pasar Minggu', lat: -6.2829, lng: 106.8378, addr: 'Jl. Sawo Manila, Pasar Minggu, Jakarta Selatan' },
  { name: 'Universitas Esa Unggul', city: 'Kota Jakarta Barat', district: 'Kebon Jeruk', lat: -6.1904, lng: 106.7762, addr: 'Jl. Arjuna Utara No. 9, Kebon Jeruk, Jakarta Barat' },
  { name: 'Universitas Kristen Indonesia (UKI)', city: 'Kota Jakarta Timur', district: 'Kramat Jati', lat: -6.2572, lng: 106.8689, addr: 'Jl. Mayjen Sutoyo No. 2, Cawang, Jakarta Timur' },
  { name: 'Universitas Jayabaya', city: 'Kota Jakarta Timur', district: 'Pulo Gadung', lat: -6.1856, lng: 106.8791, addr: 'Jl. Pulomas Selatan, Pulogadung, Jakarta Timur' },
  { name: 'Universitas Budi Luhur', city: 'Kota Jakarta Selatan', district: 'Pesanggrahan', lat: -6.2346, lng: 106.7458, addr: 'Jl. Ciledug Raya, Pesanggrahan, Jakarta Selatan' },
  { name: 'Universitas Borobudur', city: 'Kota Jakarta Timur', district: 'Duren Sawit', lat: -6.2427, lng: 106.9038, addr: 'Jl. Raya Kalimalang No. 1, Duren Sawit, Jakarta Timur' },
  { name: 'Universitas Indraprasta PGRI', city: 'Kota Jakarta Selatan', district: 'Jagakarsa', lat: -6.3031, lng: 106.8703, addr: 'Jl. Nangka No. 58, Jagakarsa, Jakarta Selatan' },
  { name: 'Universitas Pertamina', city: 'Kota Jakarta Selatan', district: 'Kebayoran Lama', lat: -6.2238, lng: 106.7972, addr: 'Jl. Teuku Nyak Arief, Kebayoran Lama, Jakarta Selatan' },
  { name: 'Universitas Bakrie', city: 'Kota Jakarta Selatan', district: 'Setiabudi', lat: -6.2198, lng: 106.8322, addr: 'Kawasan Rasuna Epicentrum, Kuningan, Jakarta Selatan' },
  { name: 'Universitas Paramadina', city: 'Kota Jakarta Selatan', district: 'Mampang Prapatan', lat: -6.2435, lng: 106.8325, addr: 'Jl. Gatot Subroto No. 97, Mampang Prapatan, Jakarta Selatan' }
];

console.log("Seeding Jakarta universities (offline with districts)...");

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }

  // Clear previous Jakarta universities
  db.query("DELETE FROM locations WHERE province = 'DKI Jakarta' OR province = 'Dki Jakarta'", (err, result) => {
    if (err) {
      console.error("Failed to delete old locations:", err.message);
      db.end();
      process.exit(1);
    }
    
    console.log("Cleared old Jakarta university data.");

    // Inspect schema
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

      // Insert into database including district
      const insertQuery = `
        INSERT INTO locations (name, lat, lng, category, address, country, province, city, district, ${imageColName}) 
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
          'Dki Jakarta', // exact title-case seeded name
          c.city, // e.g. "Kota Jakarta Selatan" to match the regencies table
          c.district, // e.g. "Senen", "Setiabudi" to match the district properties in geojson
          '[]' // empty image array JSON
        ];
      });

      db.query(insertQuery, [values], (err, result) => {
        if (err) {
          console.error("Error inserting locations:", err.message);
        } else {
          console.log(`Successfully seeded ${result.affectedRows} Jakarta universities with districts into the database!`);
        }
        db.end();
        process.exit(0);
      });
    });
  });
});
