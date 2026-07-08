const db = require('./database');

const sumateraTourismData = [
    {
        name: 'Danau Toba',
        lat: 2.6715,
        lng: 98.8351,
        category: 'Alam',
        address: 'Danau Toba, Sumatera Utara, Indonesia',
        province: 'Sumatera Utara',
        city: 'Kabupaten Toba Samosir',
        operating_hours: '24 Jam',
        images: JSON.stringify(['https://upload.wikimedia.org/wikipedia/commons/b/bd/Lake_Toba_from_the_hills_above_Parapat.jpg']),
        rating: 4.8,
        description: 'Danau vulkanik terbesar di dunia yang terletak di Sumatera Utara. Menawarkan pemandangan menakjubkan dan udara sejuk.'
    },
    {
        name: 'Jam Gadang',
        lat: -0.3045,
        lng: 100.3693,
        category: 'Sejarah',
        address: 'Bukittinggi, Sumatera Barat, Indonesia',
        province: 'Sumatera Barat',
        city: 'Bukittinggi',
        operating_hours: '24 Jam',
        images: JSON.stringify(['https://upload.wikimedia.org/wikipedia/commons/0/05/Jam_Gadang_in_2019.jpg']),
        rating: 4.7,
        description: 'Menara jam ikonik di pusat kota Bukittinggi yang dibangun pada era kolonial Belanda.'
    },
    {
        name: 'Masjid Raya Baiturrahman',
        lat: 5.5536,
        lng: 95.3170,
        category: 'Religi',
        address: 'Jl. Moh. Jam No.1, Kp. Baru, Kec. Baiturrahman, Kota Banda Aceh, Aceh',
        province: 'Aceh',
        city: 'Banda Aceh',
        operating_hours: '04:00 - 22:00',
        images: JSON.stringify(['https://upload.wikimedia.org/wikipedia/commons/e/e9/Masjid_Raya_Baiturrahman_Banda_Aceh_01.jpg']),
        rating: 4.9,
        description: 'Masjid peninggalan Kesultanan Aceh yang merupakan simbol agama, budaya, semangat, dan perjuangan rakyat Aceh.'
    },
    {
        name: 'Sate Padang Mak Syukur',
        lat: -0.4632,
        lng: 100.4014,
        category: 'Kuliner',
        address: 'Sutan Syahrir No.250, Silaing Bawah, Kec. Padang Panjang Bar., Kota Padang Panjang, Sumatera Barat',
        province: 'Sumatera Barat',
        city: 'Padang Panjang',
        operating_hours: '09:00 - 21:00',
        images: JSON.stringify(['https://upload.wikimedia.org/wikipedia/commons/6/69/Sate_Padang.jpg']),
        rating: 4.6,
        description: 'Sate padang legendaris dengan bumbu kental yang khas dan lezat, berdiri sejak 1941.'
    },
    {
        name: 'Pantai Sorake',
        lat: 0.5516,
        lng: 97.8021,
        category: 'Pantai',
        address: 'Nias Selatan, Sumatera Utara, Indonesia',
        province: 'Sumatera Utara',
        city: 'Nias Selatan',
        operating_hours: '24 Jam',
        images: JSON.stringify(['https://upload.wikimedia.org/wikipedia/commons/6/64/Sorake_beach%2C_Nias_island.jpg']),
        rating: 4.5,
        description: 'Pantai yang terkenal di kalangan peselancar internasional karena ombaknya yang tinggi dan menantang.'
    },
    {
        name: 'Sun Plaza',
        lat: 3.5828,
        lng: 98.6757,
        category: 'Pusat Perbelanjaan',
        address: 'Jl. KH. Zainul Arifin No.7, Madras Hulu, Medan Polonia, Kota Medan',
        province: 'Sumatera Utara',
        city: 'Medan',
        operating_hours: '10:00 - 22:00',
        images: JSON.stringify(['https://upload.wikimedia.org/wikipedia/id/8/87/Sun_Plaza.jpg']),
        rating: 4.5,
        description: 'Pusat perbelanjaan mewah dan terbesar di kota Medan dengan berbagai fasilitas dan merek ternama.'
    },
    {
        name: 'Trans Studio Mall Cibubur',
        lat: -6.3769,
        lng: 106.9015,
        category: 'Hiburan',
        address: 'Jl. Alternatif Cibubur No.230, Harjamukti, Kec. Cimanggis, Kota Depok, Jawa Barat',
        province: 'Jawa Barat',
        city: 'Depok',
        operating_hours: '10:00 - 22:00',
        images: JSON.stringify([]),
        rating: 4.4,
        description: 'Taman hiburan indoor.'
    }
];

const commentsData = [
    { location_id: 1, user_name: 'Budi', text: 'Pemandangan sangat indah dan menyejukkan hati.', rating: 5 },
    { location_id: 2, user_name: 'Siti', text: 'Ikon sejarah yang wajib dikunjungi jika ke Bukittinggi.', rating: 4 },
    { location_id: 3, user_name: 'Ahmad', text: 'Masjid yang sangat megah dan penuh nilai sejarah.', rating: 5 },
    { location_id: 4, user_name: 'Rudi', text: 'Rasanya mantap! Bumbunya beda dari yang lain.', rating: 5 },
];

console.log("Seeding Sumatera tourism data...");

setTimeout(() => {
    // Clear existing locations first for clean slate in development
    db.query('DELETE FROM locations', (err) => {
        if(err) console.error("Error clearing locations:", err);
        else {
            db.query('ALTER TABLE locations AUTO_INCREMENT = 1');
            
            let insertedLocations = 0;
            sumateraTourismData.forEach(loc => {
                const query = `INSERT INTO locations (name, lat, lng, category, address, province, city, operating_hours, images, rating, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const values = [loc.name, loc.lat, loc.lng, loc.category, loc.address, loc.province, loc.city, loc.operating_hours, loc.images, loc.rating, loc.description];
                
                db.query(query, values, (err) => {
                    if (err) console.error("Error inserting location:", err);
                    else {
                        insertedLocations++;
                        if (insertedLocations === sumateraTourismData.length) {
                            console.log("Tourism locations seeded successfully!");
                            // Insert Comments
                            db.query('DELETE FROM comments', (err) => {
                                if(!err) {
                                    db.query('ALTER TABLE comments AUTO_INCREMENT = 1');
                                    if(commentsData.length === 0) process.exit(0);
                                    let insertedComments = 0;
                                    commentsData.forEach(comment => {
                                        const cQuery = `INSERT INTO comments (location_id, user_name, text, rating) VALUES (?, ?, ?, ?)`;
                                        db.query(cQuery, [comment.location_id, comment.user_name, comment.text, comment.rating], (err) => {
                                            if (err) console.error("Error inserting comment:", err);
                                            insertedComments++;
                                            if (insertedComments === commentsData.length) {
                                                console.log("Comments seeded successfully!");
                                                process.exit(0);
                                            }
                                        });
                                    });
                                }
                            });
                        }
                    }
                });
            });
        }
    });
}, 2000); // Wait for db init
