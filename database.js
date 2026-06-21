const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
});

connection.connect((err) => {
  if (err) {
      console.error('Error connecting to MySQL', err.message);
      return;
  }
  console.log('Connected to the MySQL server.');
  
  // Create database if not exists
  const dbName = process.env.DB_NAME || 'geo_grafis';
  connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err) => {
    if (err) {
        console.error('Error creating database', err.message);
        return;
    }
    
    // Switch to database
    connection.query(`USE ${dbName}`, (err) => {
      if (err) {
          console.error('Error switching database', err.message);
          return;
      }

      // Initialize schema
      const createTableQuery = `
          CREATE TABLE IF NOT EXISTS locations (
              id INT AUTO_INCREMENT PRIMARY KEY,
              name VARCHAR(255) NOT NULL,
              lat DOUBLE NOT NULL,
              lng DOUBLE NOT NULL,
              category VARCHAR(100),
              address TEXT,
              country VARCHAR(100),
              province VARCHAR(100),
              city VARCHAR(100),
              district VARCHAR(100)
          )
      `;
      connection.query(createTableQuery, (err) => {
          if (err) {
              console.error('Error creating table', err.message);
          } else {
              console.log('Locations table ready.');
          }
      });
    });
  });
});

module.exports = connection;
