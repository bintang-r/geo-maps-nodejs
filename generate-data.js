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

const sampleData = [
    {
        name: "Universitas Hasanuddin (Unhas)",
        lat: -5.1328,
        lng: 119.4878,
        category: "Perguruan Tinggi Negeri",
        address: "Jl. Perintis Kemerdekaan KM.10, Makassar",
        district: "Tamalanrea",
        operating_hours: "08:00 - 16:00",
        description: "Universitas negeri terbesar di Indonesia Timur dengan kampus yang asri dan danau yang indah.",
        image: "[]"
    },
    {
        name: "Universitas Negeri Makassar (UNM)",
        lat: -5.1685,
        lng: 119.4312,
        category: "Perguruan Tinggi Negeri",
        address: "Jl. A. P. Pettarani, Makassar",
        district: "Rappocini",
        operating_hours: "08:00 - 16:00",
        description: "Eks IKIP Ujung Pandang, kampus unggulan pencetak tenaga pendidik.",
        image: "[]"
    },
    {
        name: "Universitas Muslim Indonesia (UMI)",
        lat: -5.1384,
        lng: 119.4475,
        category: "Perguruan Tinggi Swasta",
        address: "Jl. Urip Sumoharjo, Makassar",
        district: "Panakkukang",
        operating_hours: "08:00 - 17:00",
        description: "Universitas swasta tertua dan terbesar di kawasan Timur Indonesia.",
        image: "[]"
    },
    {
        name: "Pantai Losari",
        lat: -5.1448,
        lng: 119.4076,
        category: "Wisata",
        address: "Jl. Penghibur, Makassar",
        district: "Ujung Pandang",
        operating_hours: "24 Jam",
        description: "Ikon kota Makassar, terkenal dengan pemandangan matahari terbenam (sunset) dan pisang epe.",
        image: "[]"
    },
    {
        name: "Fort Rotterdam",
        lat: -5.1332,
        lng: 119.4057,
        category: "Wisata",
        address: "Jl. Ujung Pandang, Makassar",
        district: "Ujung Pandang",
        operating_hours: "08:00 - 18:00",
        description: "Benteng bersejarah peninggalan Kerajaan Gowa-Tallo yang menyimpan banyak artefak masa lalu.",
        image: "[]"
    },
    {
        name: "Trans Studio Mall Makassar",
        lat: -5.1581,
        lng: 119.3908,
        category: "Pusat Perbelanjaan",
        address: "Kawasan Terpadu Trans Studio, Jl. Metro Tanjung Bunga, Makassar",
        district: "Tamalate",
        operating_hours: "10:00 - 22:00",
        description: "Mall terbesar dan pusat hiburan modern di pesisir Makassar.",
        image: "[]"
    },
    {
        name: "Mall Panakkukang",
        lat: -5.1554,
        lng: 119.4452,
        category: "Pusat Perbelanjaan",
        address: "Jl. Boulevard, Makassar",
        district: "Panakkukang",
        operating_hours: "10:00 - 22:00",
        description: "Pusat perbelanjaan paling padat dan sibuk di tengah kota Makassar.",
        image: "[]"
    },
    {
        name: "RSUP Dr. Wahidin Sudirohusodo",
        lat: -5.1350,
        lng: 119.4891,
        category: "Rumah Sakit",
        address: "Jl. Perintis Kemerdekaan KM.11, Makassar",
        district: "Tamalanrea",
        operating_hours: "24 Jam",
        description: "Rumah Sakit rujukan utama untuk kawasan Indonesia Timur.",
        image: "[]"
    },
    {
        name: "Masjid Raya Makassar",
        lat: -5.1325,
        lng: 119.4187,
        category: "Lainnya",
        address: "Jl. Masjid Raya, Bontoala, Makassar",
        district: "Bontoala",
        operating_hours: "24 Jam",
        description: "Masjid bersejarah yang sangat megah di jantung kota Makassar.",
        image: "[]"
    },
    {
        name: "Nipah Mall",
        lat: -5.1378,
        lng: 119.4526,
        category: "Pusat Perbelanjaan",
        address: "Jl. Urip Sumoharjo, Makassar",
        district: "Panakkukang",
        operating_hours: "10:00 - 22:00",
        description: "Pusat perbelanjaan dengan konsep ramah lingkungan (green building).",
        image: "[]"
    }
];

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL geo_grafis');

    // Kosongkan tabel agar data tidak kembar
    db.query('TRUNCATE TABLE locations', (err) => {
        if (err) throw err;
        console.log('Tabel locations telah dikosongkan.');

        let count = 0;
        sampleData.forEach(loc => {
            const query = `
                INSERT INTO locations (name, lat, lng, category, address, district, operating_hours, description, image) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const values = [loc.name, loc.lat, loc.lng, loc.category, loc.address, loc.district, loc.operating_hours, loc.description, loc.image];
            
            db.query(query, values, (err) => {
                if (err) console.error("Error inserting:", err);
                count++;
                if (count === sampleData.length) {
                    console.log(`Berhasil menghasilkan ${sampleData.length} data lokasi yang unik!`);
                    db.end();
                }
            });
        });
    });
});
