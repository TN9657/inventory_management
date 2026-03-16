const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const initializeDatabase = async () => {
  let connection;
  
  try {
    // First connect without database to create it
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} created or already exists`);
    
    await connection.end();

    // Reconnect with database selected
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT
    });

    // Create tables
    const tables = [
      // Suppliers table
      `CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        gst VARCHAR(15),
        address TEXT,
        email VARCHAR(255),
        phone VARCHAR(15),
        company_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Material names table
      `CREATE TABLE IF NOT EXISTS material_names (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Materials table
      `CREATE TABLE IF NOT EXISTS materials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        supplier_id INT NOT NULL,
        date DATE NOT NULL,
        tax DECIMAL(10,2) DEFAULT 0,
        total_cost DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
      )`,

      // Material items table
      `CREATE TABLE IF NOT EXISTS material_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        material_id INT NOT NULL,
        material_name_id INT NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit ENUM('kg', 'liters', 'packets', 'units') NOT NULL,
        cost DECIMAL(10,2) NOT NULL,
        cost_per_item DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
        FOREIGN KEY (material_name_id) REFERENCES material_names(id) ON DELETE CASCADE
      )`,

      // Material list table
      `CREATE TABLE IF NOT EXISTS material_list (
        id INT AUTO_INCREMENT PRIMARY KEY,
        material_name_id INT NOT NULL,
        cost_price DECIMAL(10,2) NOT NULL,
        sell_price DECIMAL(10,2) DEFAULT 0,
        total_quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
        unit ENUM('kg', 'liters', 'packets', 'units') NOT NULL,
        total_cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        total_selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        total_profit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (material_name_id) REFERENCES material_names(id) ON DELETE CASCADE,
        UNIQUE KEY unique_material (material_name_id)
      )`,

      // Billing table
      `CREATE TABLE IF NOT EXISTS billing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        is_paid BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Billing items table
      `CREATE TABLE IF NOT EXISTS billing_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        billing_id INT NOT NULL,
        material_name_id INT NOT NULL,
        selling_price DECIMAL(10,2) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        unit ENUM('kg', 'liters', 'packets', 'units') NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (billing_id) REFERENCES billing(id) ON DELETE CASCADE,
        FOREIGN KEY (material_name_id) REFERENCES material_names(id) ON DELETE CASCADE
      )`
    ];

    // Execute table creation queries
    for (const table of tables) {
      await connection.query(table);
    }
    console.log('All tables created successfully');

    // Insert sample data
    await insertSampleData(connection);

    console.log('Database initialization completed successfully!');

  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

const insertSampleData = async (connection) => {
  try {
    // Check if data already exists
    const [suppliers] = await connection.query('SELECT COUNT(*) as count FROM suppliers');
    if (suppliers[0].count > 0) {
      console.log('Sample data already exists, skipping insertion');
      return;
    }

    // Insert sample suppliers
    await connection.query(`
      INSERT INTO suppliers (name, gst, address, email, phone, company_name) VALUES
      ('Rajesh Kumar', '27ABCDE1234F1Z5', '123 Market Street, Mumbai', 'rajesh@email.com', '9876543210', 'Kumar Traders'),
      ('Priya Sharma', '29FGHIJ5678K2L6', '456 Business Park, Delhi', 'priya@email.com', '9876543211', 'Sharma Enterprises'),
      ('Amit Patel', '24MNOPQ9012R3S7', '789 Industrial Area, Ahmedabad', 'amit@email.com', '9876543212', 'Patel Supplies')
    `);

    // Insert sample material names
    await connection.query(`
      INSERT INTO material_names (name) VALUES
      ('Rice'), ('Wheat Flour'), ('Sugar'), ('Cooking Oil'), ('Dal (Lentils)'),
      ('Tea Leaves'), ('Salt'), ('Biscuits'), ('Soap'), ('Detergent')
    `);

    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
};

// Run if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };