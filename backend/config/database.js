const mysql = require('mysql2/promise');
const { initializeDatabase } = require('../setup-database');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
};

let connection;

const connectDB = async () => {
  try {
    // Initialize database and tables first
    await initializeDatabase();
    
    // Then connect to the database
    connection = await mysql.createConnection(dbConfig);
    console.log('MySQL Connected to inventory_management database');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

const getConnection = () => connection;

module.exports = { connectDB, getConnection };