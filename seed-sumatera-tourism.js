const db = require('./database');

// ===========================================================
// Data Wisata Default - Sumatera Utara
// ===========================================================
const locations = [
  // === ALAM ===
  {
    name: 'Danau Toba',
    lat: 2.6715, lng: 98.8351,
    category: 'Alam',
    address: 'Kabupaten Toba Samosir, Sumatera Utara',
    province: 'Sumatera Utara', city: 'Kabupaten Toba Samosir',
    operating_hours: '24 Jam',
    images: JSON.stringify(['https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800', 'https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800']),
    rating: 4.9,
    description: 'Danau vulkanik terbesar di dunia dengan luas sekitar 1.130 km². Di tengahnya terdapat Pulau Samosir, pusat kebudayaan Batak. Menawarkan pemandangan spektakuler, udara segar, dan kekayaan budaya yang tiada duanya.'
  },
  {
    name: 'Pulau Samosir',
    lat: 2.5672, lng: 98.8382,
    category: 'Alam',
    address: 'Pulau Samosir, Sumatera Utara',
    province: 'Sumatera Utara', city: 'Kabupaten Samosir',
    operating_hours: '24 Jam',
    images: JSON.stringify(['https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800']),
    rating: 4.8,
    description: 'Pulau vulkanik di tengah Danau Toba yang merupakan pusat kebudayaan Batak Toba. Terdapat desa tradisional, makam raja Batak, tenun Ulos, dan pemandangan danau yang memukau dari berbagai sisi.'
  },
  {
    name: 'Air Terjun Sipiso-piso',
    lat: 3.1073, lng: 98.4857,
    category: 'Alam',
    address: 'Kec. Merek, Kabupaten Karo, Sumatera Utara',
    province: 'Sumatera Utara', city: 'Kabupaten Karo',
    operating_hours: '08:00 - 18:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=800']),
    rating: 4.7,
    description: 'Air terjun setinggi 120 meter yang merupakan salah satu tertinggi di Indonesia. Lokasinya berada di tepi Danau Toba dengan pemandangan yang luar biasa indah. Tersedia jalur trekking menuju bawah air terjun.'
  },
  {
    name: 'Bukit Lawang',
    lat: 3.5538, lng: 98.1239,
    category: 'Alam',
    address: 'Kec. Bohorok, Kab. Langkat, Sumatera Utara',
    province: 'Sumatera Utara', city: 'Kabupaten Langkat',
    operating_hours: '08:00 - 17:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1549366021-9f761d450615?w=800']),
    rating: 4.8,
    description: 'Pintu masuk menuju Taman Nasional Gunung Leuser, salah satu kawasan ekosistem paling kaya di bumi. Terkenal dengan pusat rehabilitasi orangutan Sumatera. Tersedia wisata arung jeram dan jungle trekking.'
  },

  // === PANTAI ===
  {
    name: 'Pantai Barat Sibolga',
    lat: 1.7456, lng: 98.7745,
    category: 'Pantai',
    address: 'Kota Sibolga, Sumatera Utara',
    province: 'Sumatera Utara', city: 'Kota Sibolga',
    operating_hours: '24 Jam',
    images: JSON.stringify(['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800']),
    rating: 4.4,
    description: 'Pantai dengan pasir putih dan air laut yang jernih di kota pelabuhan Sibolga. Menjadi tempat favorit warga lokal untuk bersantai dan menikmati sunset yang indah sambil menikmati seafood segar.'
  },
  {
    name: 'Pantai Cermin',
    lat: 3.5412, lng: 98.9283,
    category: 'Pantai',
    address: 'Kec. Pantai Cermin, Kab. Serdang Bedagai, Sumatera Utara',
    province: 'Sumatera Utara', city: 'Kabupaten Serdang Bedagai',
    operating_hours: '08:00 - 18:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800']),
    rating: 4.3,
    description: 'Pantai populer dekat Medan dengan air yang tenang dan jernih bagaikan cermin. Tersedia berbagai wahana air, restoran seafood, dan penginapan. Cocok untuk piknik keluarga dan berenang.'
  },
  {
    name: 'Pantai Lagundri - Nias',
    lat: 0.5463, lng: 97.8071,
    category: 'Pantai',
    address: 'Nias Selatan, Sumatera Utara',
    province: 'Sumatera Utara', city: 'Kabupaten Nias Selatan',
    operating_hours: '24 Jam',
    images: JSON.stringify(['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800']),
    rating: 4.7,
    description: 'Pantai surfing kelas dunia dengan ombak bertipe Right-Hander yang konsisten dan sempurna. Dikenal di kalangan peselancar internasional sejak 1970-an. Setiap tahun menjadi tuan rumah kompetisi surfing internasional.'
  },

  // === KULINER ===
  {
    name: 'Pasar Merah Medan',
    lat: 3.5878, lng: 98.6804,
    category: 'Kuliner',
    address: 'Jl. HM Joni, Kec. Medan Kota, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '07:00 - 22:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800']),
    rating: 4.6,
    description: 'Surga kuliner Kota Medan yang legendaris. Di sini Anda bisa menikmati berbagai sajian khas Medan: Bika Ambon, Lontong Medan, Soto Medan, Nasi Goreng Seafood, hingga Kwetiau Medan yang terkenal lezat.'
  },
  {
    name: 'Mie Aceh Titi Bobrok',
    lat: 3.5901, lng: 98.6856,
    category: 'Kuliner',
    address: 'Jl. Sei Deli No.12, Medan Sunggal, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '11:00 - 22:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800']),
    rating: 4.7,
    description: 'Warung mie Aceh paling legendaris di Medan, berdiri sejak 1970. Terkenal dengan kuah kaldu yang kaya rempah, pilihan mi goreng atau mi rebus dengan topping daging sapi, udang, atau cumi. Selalu ramai pengunjung.'
  },
  {
    name: 'Soto Kesawan',
    lat: 3.5856, lng: 98.6780,
    category: 'Kuliner',
    address: 'Jl. Kesawan, Medan Barat, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '07:00 - 15:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800']),
    rating: 4.5,
    description: 'Soto Medan khas dengan kuah santan kuning yang gurih dan kaya rempah. Berlokasi di kawasan bersejarah Kesawan, menjadikannya tempat yang tepat untuk menikmati sarapan pagi sambil merasakan atmosfer Medan tempo dulu.'
  },
  {
    name: 'Warung Seafood Parapat',
    lat: 2.6640, lng: 98.9445,
    category: 'Kuliner',
    address: 'Jl. Sisingamangaraja, Parapat, Kab. Simalungun',
    province: 'Sumatera Utara', city: 'Kabupaten Simalungun',
    operating_hours: '10:00 - 21:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800']),
    rating: 4.4,
    description: 'Deretan warung makan seafood segar di tepi Danau Toba. Menawarkan ikan mas arsik (ikan khas Batak dimasak dengan bumbu rempah), ikan naniura, dan udang danau. Menikmati makan siang dengan view Danau Toba yang langsung membuat pengalaman tak terlupakan.'
  },

  // === SEJARAH ===
  {
    name: 'Istana Maimun',
    lat: 3.5752, lng: 98.6864,
    category: 'Sejarah',
    address: 'Jl. Brigjen Katamso No.66, Sei Mati, Medan Maimun, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '08:00 - 17:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800']),
    rating: 4.7,
    description: 'Istana Kesultanan Deli yang dibangun pada 1888, merupakan ikon Kota Medan. Bangunan bergaya arsitektur Islam, Melayu, dan Eropa ini masih ditempati keluarga Sultan Deli. Terdapat koleksi perabotan kerajaan, senjata tradisional, dan foto-foto bersejarah.'
  },
  {
    name: 'Museum Batak TB Silalahi Center',
    lat: 2.6842, lng: 98.8579,
    category: 'Sejarah',
    address: 'Desa Pagar Batu, Kec. Balige, Kab. Toba Samosir',
    province: 'Sumatera Utara', city: 'Kabupaten Toba Samosir',
    operating_hours: '09:00 - 17:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800']),
    rating: 4.6,
    description: 'Museum terlengkap tentang budaya Batak di tepi Danau Toba. Menyimpan ribuan koleksi artefak, pakaian adat, alat musik, senjata, dan dokumen sejarah suku Batak. Menjadi pusat pelestarian dan edukasi budaya Batak terkemuka di Sumatera Utara.'
  },
  {
    name: 'Kota Lama Kesawan',
    lat: 3.5854, lng: 98.6773,
    category: 'Sejarah',
    address: 'Jl. Kesawan, Medan Barat, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '24 Jam',
    images: JSON.stringify(['https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800']),
    rating: 4.5,
    description: 'Kawasan bersejarah kolonial Belanda di jantung Kota Medan. Dihiasi deretan bangunan tua bergaya Art Deco dan Eropa dari abad ke-19. Menjadi destinasi wisata sejarah sekaligus lokasi foto yang sangat populer, terutama di malam hari.'
  },

  // === RELIGI ===
  {
    name: 'Masjid Raya Al-Mashun Medan',
    lat: 3.5854, lng: 98.7009,
    category: 'Religi',
    address: 'Jl. Sisingamangaraja, Mesjid, Medan Kota, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '05:00 - 22:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800']),
    rating: 4.8,
    description: 'Masjid megah peninggalan Kesultanan Deli yang dibangun pada 1906. Dikenal sebagai "Masjid Raya Medan", merupakan salah satu masjid tertua dan terindah di Indonesia dengan arsitektur perpaduan Timur Tengah, India Mughal, dan Spanyol. Mampu menampung 1.500 jamaah.'
  },
  {
    name: 'Vihara Gunung Timur',
    lat: 3.5761, lng: 98.7061,
    category: 'Religi',
    address: 'Jl. Hang Tuah, Medan Timur, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '07:00 - 21:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800']),
    rating: 4.5,
    description: 'Vihara Tionghoa terbesar di Sumatera dan salah satu yang terbesar di Asia Tenggara. Dibangun pada 1962 dengan arsitektur khas Tiongkok yang megah dan berwarna-warni. Menjadi pusat keagamaan sekaligus wisata budaya yang penting di Medan.'
  },
  {
    name: 'Gereja HKBP Pearaja Tarutung',
    lat: 1.9949, lng: 98.9702,
    category: 'Religi',
    address: 'Pearaja, Tarutung, Kabupaten Tapanuli Utara',
    province: 'Sumatera Utara', city: 'Kabupaten Tapanuli Utara',
    operating_hours: '07:00 - 17:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1548625149-720754981e4e?w=800']),
    rating: 4.7,
    description: 'Pusat Gereja HKBP (Huria Kristen Batak Protestan) yang berdiri sejak abad ke-19. Kompleks gereja bersejarah yang menjadi jantung kekristenan suku Batak. Di sini terdapat museum sejarah penyebaran injil di Tanah Batak dan makam para misionaris.'
  },

  // === HIBURAN ===
  {
    name: 'Medan Zoo (Kebun Binatang Simalingkar)',
    lat: 3.5041, lng: 98.6317,
    category: 'Hiburan',
    address: 'Jl. Bunga Raya, Simalingkar, Medan Tuntungan, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '09:00 - 17:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1607435097405-db48f377bff6?w=800']),
    rating: 4.1,
    description: 'Kebun binatang terbesar di Sumatera Utara dengan koleksi satwa asli Sumatera termasuk harimau Sumatera, orangutan, gajah, tapir, dan berbagai spesies burung langka. Dilengkapi area bermain anak dan fasilitas edukasi satwa liar.'
  },
  {
    name: 'Funland Deli Park',
    lat: 3.5947, lng: 98.7200,
    category: 'Hiburan',
    address: 'Jl. Gatot Subroto, Sei Putih Bar., Medan Petisah, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '10:00 - 22:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800']),
    rating: 4.2,
    description: 'Taman hiburan dan rekreasi keluarga terbesar di Medan. Tersedia berbagai wahana seru untuk semua usia, dari roller coaster mini, bianglala, hingga wahana air. Cocok untuk liburan keluarga dan acara ulang tahun anak-anak.'
  },
  {
    name: 'Taman Teladan Medan',
    lat: 3.5780, lng: 98.6919,
    category: 'Hiburan',
    address: 'Jl. Teladan, Teladan Timur, Medan Kota, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '06:00 - 22:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800']),
    rating: 4.3,
    description: 'Taman kota yang rindang dan asri di pusat Kota Medan. Menjadi tempat favorit warga untuk olahraga pagi, bersantai sore, dan berwisata malam. Dilengkapi jogging track, playground anak, area kuliner, dan sering menjadi venue acara budaya.'
  },

  // === PUSAT PERBELANJAAN ===
  {
    name: 'Sun Plaza',
    lat: 3.5828, lng: 98.6757,
    category: 'Pusat Perbelanjaan',
    address: 'Jl. KH Zainul Arifin No.7, Petisah Tengah, Medan Petisah, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '10:00 - 22:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800']),
    rating: 4.6,
    description: 'Mall premium dan terbesar di Kota Medan. Hadir dengan lebih dari 300 tenant merek lokal dan internasional, bioskop CGV, food court modern, supermarket, dan berbagai gerai fashion ternama. Menjadi pusat gaya hidup terkemuka di Sumatera Utara.'
  },
  {
    name: 'Hermes Place Polonia',
    lat: 3.5973, lng: 98.6761,
    category: 'Pusat Perbelanjaan',
    address: 'Jl. Listrik No.10, Petisah Hulu, Medan Baru, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '10:00 - 22:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1542621334-a254cf47733d?w=800']),
    rating: 4.4,
    description: 'Pusat perbelanjaan modern dengan konsep one-stop shopping di lokasi strategis Medan. Dilengkapi tenant fashion, restoran, kafe, bioskop, dan supermarket. Interior yang elegan dan nyaman menjadikannya pilihan favorit keluarga Medan.'
  },
  {
    name: 'Pasar Berastagi',
    lat: 3.1933, lng: 98.5111,
    category: 'Pusat Perbelanjaan',
    address: 'Jl. Veteran, Berastagi, Kabupaten Karo, Sumatera Utara',
    province: 'Sumatera Utara', city: 'Kabupaten Karo',
    operating_hours: '06:00 - 18:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800']),
    rating: 4.5,
    description: 'Pasar wisata di kaki Gunung Sinabung yang terkenal dengan produk pertanian segar khas dataran tinggi Karo. Tersedia aneka buah-buahan seperti markisa, jeruk, stroberi, serta sayuran segar. Harga terjangkau dan menjadi oleh-oleh favorit wisatawan.'
  }
];

const comments = [
  { location_name: 'Danau Toba', user_name: 'Rizky Pratama', text: 'Salah satu tempat paling indah yang pernah saya kunjungi di Indonesia. Udara segar dan pemandangan yang luar biasa!', rating: 5 },
  { location_name: 'Danau Toba', user_name: 'Maya Sari', text: 'Wajib dikunjungi setidaknya sekali seumur hidup. Bawa jaket ya, lumayan dingin di malam hari.', rating: 5 },
  { location_name: 'Istana Maimun', user_name: 'Ahmad Fauzi', text: 'Bangunan yang sangat bersejarah dan indah. Pemandunya ramah dan banyak cerita menarik tentang Kesultanan Deli.', rating: 5 },
  { location_name: 'Bukit Lawang', user_name: 'Sarah Dewi', text: 'Pengalaman melihat orangutan liar di habitatnya adalah pengalaman yang tak ternilai!', rating: 5 },
  { location_name: 'Air Terjun Sipiso-piso', user_name: 'Budi Santoso', text: 'Air terjunnya spektakuler! Perlu sedikit fisik untuk turun ke bawah, tapi sepadan banget.', rating: 4 },
  { location_name: 'Mie Aceh Titi Bobrok', user_name: 'Rina Harahap', text: 'Mie Aceh terenak di Medan! Rempahnya pas, porsinya besar, dan harganya sangat terjangkau.', rating: 5 },
  { location_name: 'Masjid Raya Al-Mashun Medan', user_name: 'Fadhil Rahman', text: 'Masjid yang sangat megah dan penuh sejarah. Arsitekturnya memukau, campuran gaya Timur Tengah dan Eropa.', rating: 5 },
  { location_name: 'Pasar Berastagi', user_name: 'Lina Br Ginting', text: 'Buah-buahannya segar dan murah. Jangan lupa beli markisa dan jeruk Berastagi, dijamin ketagihan!', rating: 4 },
  { location_name: 'Sun Plaza', user_name: 'Dimas Purnomo', text: 'Mall terlengkap di Medan. Nyaman, bersih, dan tenant-nya banyak pilihan.', rating: 4 },
  { location_name: 'Pantai Lagundri - Nias', user_name: 'Andre Surfer', text: 'World class surf spot! Ombaknya sempurna untuk surfing, terutama saat pagi hari. Recommended!', rating: 5 },
];

console.log('🚀 Smart Wisata Sumut - Memulai proses seeding data...');

setTimeout(() => {
  db.query('DELETE FROM comments', (err) => {
    if (err) console.error('Error clearing comments:', err.message);
    
    db.query('DELETE FROM locations', (err) => {
      if (err) { console.error('Error clearing locations:', err.message); return; }
      
      db.query('ALTER TABLE locations AUTO_INCREMENT = 1', () => {
        db.query('ALTER TABLE comments AUTO_INCREMENT = 1', () => {
          
          let count = 0;
          
          locations.forEach((loc) => {
            const q = `INSERT INTO locations 
              (name, lat, lng, category, address, province, city, operating_hours, images, rating, description) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const v = [loc.name, loc.lat, loc.lng, loc.category, loc.address, loc.province, loc.city, loc.operating_hours, loc.images, loc.rating, loc.description];
            
            db.query(q, v, (err) => {
              if (err) console.error(`Error inserting [${loc.name}]:`, err.message);
              else console.log(`  ✅ ${loc.category.padEnd(20)} → ${loc.name}`);
              
              count++;
              if (count === locations.length) {
                console.log(`\n✅ Berhasil memasukkan ${locations.length} lokasi wisata.`);
                seedComments();
              }
            });
          });
        });
      });
    });
  });
}, 2500);

const seedComments = () => {
  let cCount = 0;
  
  comments.forEach((c) => {
    db.query('SELECT id FROM locations WHERE name = ?', [c.location_name], (err, rows) => {
      if (err || rows.length === 0) { cCount++; return; }
      
      const locId = rows[0].id;
      db.query(
        'INSERT INTO comments (location_id, user_name, text, rating) VALUES (?, ?, ?, ?)',
        [locId, c.user_name, c.text, c.rating],
        (err) => {
          if (err) console.error(`Error inserting comment:`, err.message);
          cCount++;
          if (cCount === comments.length) {
            console.log(`✅ Berhasil memasukkan ${comments.length} komentar.`);
            updateRatings();
          }
        }
      );
    });
  });
};

const updateRatings = () => {
  db.query('SELECT id FROM locations', (err, rows) => {
    if (err) { console.log('\n✅ Seeding selesai!'); process.exit(0); return; }
    
    let processed = 0;
    if (rows.length === 0) { process.exit(0); return; }
    
    rows.forEach((row) => {
      db.query('SELECT AVG(rating) as avg_r FROM comments WHERE location_id = ?', [row.id], (err, res) => {
        if (!err && res[0].avg_r) {
          db.query('UPDATE locations SET rating = ? WHERE id = ?', [res[0].avg_r.toFixed(1), row.id]);
        }
        processed++;
        if (processed === rows.length) {
          console.log('\n🎉 Seeding Smart Wisata Sumut SELESAI!');
          process.exit(0);
        }
      });
    });
  });
};
