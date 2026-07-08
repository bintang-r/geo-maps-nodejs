/**
 * migrate-and-seed.js
 * 1. Hapus semua data lama (kampus dll)
 * 2. Tambah kolom yang kurang ke tabel locations
 * 3. Seed 20 lokasi wisata Sumatera Utara
 * 4. Seed komentar sample
 */

const db = require('./database');

const wisataData = [
  // ─── ALAM ───────────────────────────────────────────────────────────────────
  {
    name: 'Danau Toba',
    lat: 2.6715, lng: 98.8351,
    category: 'Alam',
    address: 'Kabupaten Toba Samosir, Sumatera Utara',
    province: 'Sumatera Utara', city: 'Kabupaten Toba Samosir',
    operating_hours: '24 Jam',
    images: JSON.stringify(['https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800','https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=800']),
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
    description: 'Pulau vulkanik di tengah Danau Toba yang merupakan pusat kebudayaan Batak Toba. Terdapat desa tradisional, makam raja Batak, tenun Ulos, dan pemandangan danau yang memukau.'
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
    description: 'Air terjun setinggi 120 meter yang merupakan salah satu tertinggi di Indonesia. Lokasinya di tepi Danau Toba dengan pemandangan yang luar biasa indah. Tersedia jalur trekking menuju dasar air terjun.'
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
    description: 'Pintu masuk ke Taman Nasional Gunung Leuser, salah satu kawasan ekosistem paling kaya di bumi. Terkenal dengan pusat rehabilitasi orangutan Sumatera. Tersedia wisata arung jeram dan jungle trekking.'
  },
  {
    name: 'Bukit Gundaling Berastagi',
    lat: 3.1940, lng: 98.5114,
    category: 'Alam',
    address: 'Berastagi, Kabupaten Karo, Sumatera Utara',
    province: 'Sumatera Utara', city: 'Kabupaten Karo',
    operating_hours: '06:00 - 18:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800']),
    rating: 4.5,
    description: 'Bukit dengan pemandangan dua gunung berapi aktif: Gunung Sinabung dan Gunung Sibayak. Udara sejuk khas dataran tinggi Karo, cocok untuk bersantai dan menikmati sunset spektakuler.'
  },

  // ─── PANTAI ─────────────────────────────────────────────────────────────────
  {
    name: 'Pantai Lagundri Nias',
    lat: 0.5463, lng: 97.8071,
    category: 'Pantai',
    address: 'Lagundri, Nias Selatan, Sumatera Utara',
    province: 'Sumatera Utara', city: 'Kabupaten Nias Selatan',
    operating_hours: '24 Jam',
    images: JSON.stringify(['https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800']),
    rating: 4.7,
    description: 'Pantai surfing kelas dunia dengan ombak tipe Right-Hander yang konsisten. Dikenal di kalangan peselancar internasional sejak 1970-an. Setiap tahun menjadi tuan rumah kompetisi surfing internasional.'
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
    name: 'Pantai Bira Tanjung Balai',
    lat: 2.9667, lng: 99.8000,
    category: 'Pantai',
    address: 'Tanjung Balai, Sumatera Utara',
    province: 'Sumatera Utara', city: 'Kota Tanjung Balai',
    operating_hours: '24 Jam',
    images: JSON.stringify(['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800']),
    rating: 4.2,
    description: 'Pantai dengan view Selat Malaka yang tenang, kaya dengan aktivitas nelayan tradisional. Terkenal dengan seafood segar dan suasana tepi laut yang autentik. Menjadi pusat kegiatan nelayan lokal.'
  },

  // ─── KULINER ─────────────────────────────────────────────────────────────────
  {
    name: 'Pasar Kuliner Merdeka Medan',
    lat: 3.5878, lng: 98.6804,
    category: 'Kuliner',
    address: 'Jl. Merdeka, Medan Barat, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '07:00 - 23:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800']),
    rating: 4.6,
    description: 'Surga kuliner Kota Medan yang legendaris. Di sini Anda bisa menikmati Bika Ambon, Lontong Medan, Soto Medan berkuah santan, Nasi Goreng Seafood, hingga Kwetiau Medan yang terkenal lezat.'
  },
  {
    name: 'Warung Mie Aceh Titi Bobrok',
    lat: 3.5901, lng: 98.6856,
    category: 'Kuliner',
    address: 'Jl. Sei Deli No.12, Medan Sunggal, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '11:00 - 22:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800']),
    rating: 4.7,
    description: 'Warung mie Aceh paling legendaris di Medan, berdiri sejak 1970. Terkenal dengan kuah kaldu kaya rempah, pilihan mi goreng atau mi rebus dengan topping daging sapi, udang, atau cumi.'
  },
  {
    name: 'Seafood Parapat Danau Toba',
    lat: 2.6640, lng: 98.9445,
    category: 'Kuliner',
    address: 'Jl. Sisingamangaraja, Parapat, Kab. Simalungun',
    province: 'Sumatera Utara', city: 'Kabupaten Simalungun',
    operating_hours: '10:00 - 21:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800']),
    rating: 4.4,
    description: 'Deretan warung makan seafood segar di tepi Danau Toba. Menawarkan ikan mas arsik khas Batak, ikan naniura, dan udang danau. Menikmati makan dengan view langsung Danau Toba yang indah.'
  },

  // ─── SEJARAH ─────────────────────────────────────────────────────────────────
  {
    name: 'Istana Maimun',
    lat: 3.5752, lng: 98.6864,
    category: 'Sejarah',
    address: 'Jl. Brigjen Katamso No.66, Medan Maimun, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '08:00 - 17:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800']),
    rating: 4.7,
    description: 'Istana Kesultanan Deli yang dibangun pada 1888, ikon Kota Medan. Bergaya arsitektur Islam, Melayu, dan Eropa. Masih ditempati keluarga Sultan Deli. Terdapat koleksi perabotan kerajaan dan senjata tradisional.'
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
    description: 'Museum terlengkap tentang budaya Batak di tepi Danau Toba. Menyimpan ribuan koleksi artefak, pakaian adat, alat musik, senjata, dan dokumen sejarah suku Batak. Pusat pelestarian budaya Batak terkemuka.'
  },
  {
    name: 'Kawasan Kota Lama Kesawan',
    lat: 3.5854, lng: 98.6773,
    category: 'Sejarah',
    address: 'Jl. Kesawan, Medan Barat, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '24 Jam',
    images: JSON.stringify(['https://images.unsplash.com/photo-1568454537842-d933259bb258?w=800']),
    rating: 4.5,
    description: 'Kawasan bersejarah kolonial Belanda di jantung Kota Medan. Dihiasi deretan bangunan tua bergaya Art Deco dan Eropa dari abad ke-19. Destinasi wisata sejarah sekaligus spot foto yang sangat populer.'
  },

  // ─── RELIGI ──────────────────────────────────────────────────────────────────
  {
    name: 'Masjid Raya Al-Mashun Medan',
    lat: 3.5854, lng: 98.7009,
    category: 'Religi',
    address: 'Jl. Sisingamangaraja, Mesjid, Medan Kota, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '05:00 - 22:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800']),
    rating: 4.8,
    description: 'Masjid megah peninggalan Kesultanan Deli dibangun tahun 1906. Salah satu masjid tertua dan terindah di Indonesia dengan arsitektur perpaduan Timur Tengah, India Mughal, dan Spanyol. Menampung 1.500 jamaah.'
  },
  {
    name: 'Vihara Gunung Timur Medan',
    lat: 3.5761, lng: 98.7061,
    category: 'Religi',
    address: 'Jl. Hang Tuah, Medan Timur, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '07:00 - 21:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800']),
    rating: 4.5,
    description: 'Vihara Tionghoa terbesar di Sumatera dan salah satu yang terbesar di Asia Tenggara. Dibangun pada 1962 dengan arsitektur khas Tiongkok yang megah. Pusat keagamaan sekaligus wisata budaya penting di Medan.'
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
    description: 'Pusat Gereja HKBP (Huria Kristen Batak Protestan) berdiri sejak abad ke-19. Jantung kekristenan suku Batak. Terdapat museum sejarah penyebaran injil di Tanah Batak dan makam para misionaris.'
  },

  // ─── HIBURAN ─────────────────────────────────────────────────────────────────
  {
    name: 'Medan Zoo Simalingkar',
    lat: 3.5041, lng: 98.6317,
    category: 'Hiburan',
    address: 'Jl. Bunga Raya, Simalingkar, Medan Tuntungan, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '09:00 - 17:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1607435097405-db48f377bff6?w=800']),
    rating: 4.1,
    description: 'Kebun binatang terbesar di Sumatera Utara dengan koleksi satwa asli Sumatera: harimau Sumatera, orangutan, gajah, tapir, dan berbagai spesies burung langka. Dilengkapi area bermain anak dan edukasi satwa.'
  },
  {
    name: 'Taman Wisata Alam Lau Debuk-Debuk',
    lat: 3.2001, lng: 98.5200,
    category: 'Hiburan',
    address: 'Berastagi, Kabupaten Karo, Sumatera Utara',
    province: 'Sumatera Utara', city: 'Kabupaten Karo',
    operating_hours: '08:00 - 18:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800']),
    rating: 4.4,
    description: 'Pemandian air panas alami di kaki Gunung Sibayak dengan suhu air yang nyaman. Dikelilingi pepohonan hijau dan udara segar dataran tinggi Karo. Cocok untuk relaksasi keluarga sambil menikmati alam.'
  },

  // ─── PUSAT PERBELANJAAN ──────────────────────────────────────────────────────
  {
    name: 'Sun Plaza Medan',
    lat: 3.5828, lng: 98.6757,
    category: 'Pusat Perbelanjaan',
    address: 'Jl. KH Zainul Arifin No.7, Petisah Tengah, Medan Petisah, Kota Medan',
    province: 'Sumatera Utara', city: 'Kota Medan',
    operating_hours: '10:00 - 22:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800']),
    rating: 4.6,
    description: 'Mall premium dan terbesar di Kota Medan. Lebih dari 300 tenant merek lokal dan internasional, bioskop CGV, food court modern, supermarket, dan gerai fashion ternama. Pusat gaya hidup terkemuka di Sumut.'
  },
  {
    name: 'Pasar Buah Berastagi',
    lat: 3.1933, lng: 98.5111,
    category: 'Pusat Perbelanjaan',
    address: 'Jl. Veteran, Berastagi, Kabupaten Karo, Sumatera Utara',
    province: 'Sumatera Utara', city: 'Kabupaten Karo',
    operating_hours: '06:00 - 18:00',
    images: JSON.stringify(['https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800']),
    rating: 4.5,
    description: 'Pasar wisata di kaki Gunung Sinabung terkenal dengan produk pertanian segar khas dataran tinggi Karo. Aneka buah: markisa, jeruk, stroberi, dan sayuran segar langsung dari petani dengan harga terjangkau.'
  }
];

const commentsData = [
  { name: 'Danau Toba', user: 'Rizky Pratama', text: 'Salah satu tempat paling indah di Indonesia! Udara segar dan pemandangan luar biasa. Wajib datang!', rating: 5 },
  { name: 'Danau Toba', user: 'Maya Sari', text: 'Surga di Sumatera Utara. Bawa jaket karena lumayan dingin di malam hari. Sangat merekomendasikan!', rating: 5 },
  { name: 'Istana Maimun', user: 'Ahmad Fauzi', text: 'Bangunan bersejarah yang luar biasa indah. Pemandunya sangat ramah dan berpengetahuan tentang Kesultanan Deli.', rating: 5 },
  { name: 'Bukit Lawang', user: 'Sarah Dewi', text: 'Melihat orangutan liar di habitatnya adalah pengalaman yang tak terlupakan! Harus dicoba setidaknya sekali.', rating: 5 },
  { name: 'Air Terjun Sipiso-piso', user: 'Budi Santoso', text: 'Air terjunnya spektakuler! Perlu fisik yang cukup untuk turun ke bawah, tapi benar-benar sepadan.', rating: 4 },
  { name: 'Warung Mie Aceh Titi Bobrok', user: 'Rina Harahap', text: 'Mie Aceh terenak di Medan! Rempahnya pas, porsinya besar, harga sangat terjangkau. Selalu ramai.', rating: 5 },
  { name: 'Masjid Raya Al-Mashun Medan', user: 'Fadhil Rahman', text: 'Masjid megah dan penuh sejarah. Arsitekturnya memukau, perpaduan Timur Tengah dan Eropa yang unik.', rating: 5 },
  { name: 'Pasar Buah Berastagi', user: 'Lina Br Ginting', text: 'Buah-buahannya segar dan murah sekali! Jangan lupa beli markisa dan jeruk Berastagi, dijamin ketagihan!', rating: 4 },
  { name: 'Sun Plaza Medan', user: 'Dimas Purnomo', text: 'Mall terlengkap di Medan. Nyaman, bersih, tenant banyak pilihan. Cocok untuk belanja dan nongkrong.', rating: 4 },
  { name: 'Pantai Lagundri Nias', user: 'Andre Kusuma', text: 'World class surf spot! Ombaknya sempurna untuk surfing, terutama pagi hari. Sangat recommended!', rating: 5 },
  { name: 'Pulau Samosir', user: 'Hotma Siregar', text: 'Pulau yang memukau! Budaya Batak sangat kental di sini. Jangan lewatkan kunjungan ke desa tradisional.', rating: 5 },
  { name: 'Museum Batak TB Silalahi Center', user: 'Johanes Nababan', text: 'Museum terlengkap tentang Batak. Wajib dikunjungi untuk memahami kekayaan budaya leluhur Batak Toba.', rating: 5 },
];

console.log('╔══════════════════════════════════════════════╗');
console.log('║   Smart Wisata Sumut — Database Migration     ║');
console.log('╚══════════════════════════════════════════════╝\n');

const runMigration = () => {
  console.log('🔄 Langkah 1: Menambahkan kolom yang kurang (kompatibel semua versi MySQL)...\n');
  
  // Kolom yang harus ada: [nama, tipe, default]
  const requiredColumns = [
    ['operating_hours', 'VARCHAR(255)', null],
    ['images',          'LONGTEXT',    null],
    ['rating',          'DOUBLE',      '0'],
    ['description',     'TEXT',        null],
    ['province',        'VARCHAR(100)', null],
    ['city',            'VARCHAR(100)', null],
  ];

  // Cek kolom yang sudah ada
  db.query(`SHOW COLUMNS FROM locations`, (err, existingCols) => {
    if (err) {
      console.log('  ❌ Tidak bisa cek kolom:', err.message);
      // Kalau tabel belum ada, langsung seed saja
      clearAndSeed();
      return;
    }

    const existingNames = existingCols.map(c => c.Field.toLowerCase());
    const toAdd = requiredColumns.filter(([col]) => !existingNames.includes(col.toLowerCase()));

    if (toAdd.length === 0) {
      console.log('  ✅ Semua kolom sudah ada.\n');
      clearAndSeed();
      return;
    }

    let done = 0;
    toAdd.forEach(([colName, colType, colDefault]) => {
      const defClause = colDefault !== null ? ` DEFAULT ${colDefault}` : '';
      const alterSql = `ALTER TABLE locations ADD COLUMN ${colName} ${colType}${defClause}`;
      db.query(alterSql, (err) => {
        if (err) {
          console.log(`  ⚠️  Kolom ${colName}: ${err.message}`);
        } else {
          console.log(`  ✅ Kolom ditambahkan: ${colName} ${colType}`);
        }
        done++;
        if (done === toAdd.length) {
          console.log('\n  ✅ Schema siap.\n');
          clearAndSeed();
        }
      });
    });
  });
};

const clearAndSeed = () => {
  console.log('🗑️  Langkah 2: Menghapus data lama...\n');
  
  db.query('SET FOREIGN_KEY_CHECKS = 0', () => {
    db.query('TRUNCATE TABLE comments', () => {
      db.query('TRUNCATE TABLE locations', () => {
        db.query('SET FOREIGN_KEY_CHECKS = 1', () => {
          console.log('  ✅ Data lama dihapus.\n');
          seedLocations();
        });
      });
    });
  });
};

const seedLocations = () => {
  console.log('🌍 Langkah 3: Memasukkan data wisata Sumatera Utara...\n');
  
  let inserted = 0;
  let errors = 0;
  
  wisataData.forEach(loc => {
    const q = `INSERT INTO locations 
      (name, lat, lng, category, address, province, city, operating_hours, images, rating, description) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const v = [
      loc.name, loc.lat, loc.lng, loc.category, loc.address,
      loc.province, loc.city, loc.operating_hours, loc.images, loc.rating, loc.description
    ];
    
    db.query(q, v, (err) => {
      if (err) {
        console.log(`  ❌ [${loc.name}]: ${err.message}`);
        errors++;
      } else {
        const icon = { Alam: '🌿', Pantai: '🏖️', Kuliner: '🍽️', Sejarah: '🏛️', Religi: '🕌', Hiburan: '🎡', 'Pusat Perbelanjaan': '🛍️' };
        console.log(`  ${icon[loc.category] || '📍'} ${loc.category.padEnd(20)} → ${loc.name}`);
        inserted++;
      }
      
      if (inserted + errors === wisataData.length) {
        console.log(`\n  ✅ ${inserted} lokasi wisata berhasil dimasukkan.\n`);
        if (errors > 0) console.log(`  ⚠️  ${errors} gagal dimasukkan.\n`);
        seedComments();
      }
    });
  });
};

const seedComments = () => {
  console.log('💬 Langkah 4: Memasukkan komentar...\n');
  
  let done = 0;
  let success = 0;
  
  commentsData.forEach(c => {
    db.query('SELECT id FROM locations WHERE name = ?', [c.name], (err, rows) => {
      if (err || !rows || rows.length === 0) {
        done++;
        if (done === commentsData.length) finish(success);
        return;
      }
      
      db.query(
        'INSERT INTO comments (location_id, user_name, text, rating) VALUES (?, ?, ?, ?)',
        [rows[0].id, c.user, c.text, c.rating],
        (err) => {
          if (!err) {
            console.log(`  💬 ${c.name} ← ${c.user}`);
            success++;
          }
          done++;
          if (done === commentsData.length) finish(success);
        }
      );
    });
  });
};

const finish = (successComments) => {
  console.log(`\n  ✅ ${successComments} komentar berhasil dimasukkan.\n`);
  
  // Update rating dari average komentar
  db.query('SELECT id, name FROM locations', (err, locs) => {
    if (err || !locs) { finalize(); return; }
    
    let updated = 0;
    locs.forEach(loc => {
      db.query('SELECT AVG(rating) as avg FROM comments WHERE location_id = ?', [loc.id], (err, res) => {
        if (!err && res[0].avg) {
          db.query('UPDATE locations SET rating = ? WHERE id = ?', [parseFloat(res[0].avg).toFixed(1), loc.id]);
        }
        updated++;
        if (updated === locs.length) finalize();
      });
    });
  });
};

const finalize = () => {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  ✅ SEEDING SELESAI! Data wisata siap.       ║');
  console.log('╚══════════════════════════════════════════════╝\n');
  setTimeout(() => process.exit(0), 500);
};

// Jalankan setelah koneksi DB siap
setTimeout(runMigration, 3000);
