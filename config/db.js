require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');

// Configure the connection pool
const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(process.env.DB_SSL_CA), // Path to the CA certificate
  },
  connectionLimit: 10, 
  queueLimit: 0,
};

// Create the connection pool
const pool = mysql.createPool(poolConfig);

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to Database!');
        connection.release();
    } catch (err) {
        console.error('Error connecting to Database', err);
    }
};

testConnection();

module.exports = pool;
