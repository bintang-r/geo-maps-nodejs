const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'maps_db'
};

const categories = ['Alam', 'Budaya', 'Kuliner', 'Religi', 'Edukasi', 'Keluarga'];
const cities = [
    { name: 'Kota Medan', latMin: 3.5, latMax: 3.7, lngMin: 98.6, lngMax: 98.75 },
    { name: 'Kabupaten Karo', latMin: 3.0, latMax: 3.3, lngMin: 98.3, lngMax: 98.6 },
    { name: 'Kabupaten Samosir', latMin: 2.5, latMax: 2.7, lngMin: 98.6, lngMax: 98.9 },
    { name: 'Kabupaten Langkat', latMin: 3.4, latMax: 3.8, lngMin: 98.0, lngMax: 98.5 },
    { name: 'Kabupaten Deli Serdang', latMin: 3.3, latMax: 3.5, lngMin: 98.7, lngMax: 99.0 },
    { name: 'Kota Pematang Siantar', latMin: 2.9, latMax: 3.0, lngMin: 99.0, lngMax: 99.1 }
];

const adjectives = ['Indah', 'Asri', 'Megah', 'Sejuk', 'Pesona', 'Lestari', 'Eksotis', 'Nusantara', 'Baru', 'Classic'];
const nouns = ['Taman', 'Bukit', 'Lembah', 'Pantai', 'Museum', 'Kampung', 'Pasar', 'Puncak', 'Danau', 'Air Terjun'];

function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

function generateLocation() {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    
    const lat = randomRange(city.latMin, city.latMax);
    const lng = randomRange(city.lngMin, city.lngMax);
    
    return {
        name: `Wisata ${noun} ${adj} ${Math.floor(Math.random() * 1000)}`,
        lat: lat.toFixed(5),
        lng: lng.toFixed(5),
        category: category,
        address: `Jl. Wisata No. ${Math.floor(Math.random() * 100)}, ${city.name}`,
        province: 'Sumatera Utara',
        city: city.name,
        district: 'Kecamatan ' + adj,
        operating_hours: '08:00 - 17:00',
        images: JSON.stringify(['https://images.unsplash.com/photo-1549366021-9f761d450615?w=800']),
        rating: randomRange(3.5, 5.0).toFixed(1),
        description: `Destinasi wisata ${category.toLowerCase()} yang menawarkan pengalaman tak terlupakan di ${city.name}. Cocok untuk dikunjungi bersama teman maupun keluarga tercinta.`
    };
}

async function seedMoreLocations() {
    console.log('Connecting to DB...');
    const db = await mysql.createConnection(dbConfig);
    
    console.log('Generating 120 locations...');
    const locations = [];
    for (let i = 0; i < 120; i++) {
        locations.push(generateLocation());
    }

    let count = 0;
    for (const loc of locations) {
        try {
            await db.query(
                `INSERT INTO locations (name, lat, lng, category, address, province, city, district, operating_hours, images, rating, description) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [loc.name, loc.lat, loc.lng, loc.category, loc.address, loc.province, loc.city, loc.district, loc.operating_hours, loc.images, loc.rating, loc.description]
            );
            count++;
        } catch (e) {
            console.error(e);
        }
    }
    
    console.log(`Successfully added ${count} locations!`);
    await db.end();
}

seedMoreLocations();
