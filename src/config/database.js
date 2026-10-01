const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Mengecek koneksi database
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database berhasil terhubung!");
    connection.release();
  } catch (error) {
    console.error("Database gagal terhubung:", error.message);
    throw error;
  }
};

module.exports = { pool, testConnection };
