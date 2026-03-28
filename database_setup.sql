-- Create database
CREATE DATABASE IF NOT EXISTS inventory_management;
USE inventory_management;

-- 1. Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    gst VARCHAR(15),
    address TEXT,
    email VARCHAR(255),
    phone VARCHAR(15),
    company_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Material names master table
CREATE TABLE IF NOT EXISTS material_names (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Materials purchase header table
CREATE TABLE IF NOT EXISTS materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    date DATE NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- 4. Material items (details of each purchase)
CREATE TABLE IF NOT EXISTS material_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    material_id INT NOT NULL,
    material_name_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit ENUM('kg', 'liters', 'packets', 'units') NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    cost_per_item DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE,
    FOREIGN KEY (material_name_id) REFERENCES material_names(id) ON DELETE CASCADE
);

-- 5. Material list (current inventory with pricing)
CREATE TABLE IF NOT EXISTS material_list (
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
);

-- 6. Billing header table
CREATE TABLE IF NOT EXISTS billing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Billing items (details of each bill)
CREATE TABLE IF NOT EXISTS billing_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    billing_id INT NOT NULL,
    material_name_id INT NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit ENUM('kg', 'liters', 'packets', 'units') NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (billing_id) REFERENCES billing(id) ON DELETE CASCADE,
    FOREIGN KEY (material_name_id) REFERENCES material_names(id) ON DELETE CASCADE
);

-- Insert sample data for testing

-- Sample suppliers
INSERT INTO suppliers (name, gst, address, email, phone, company_name) VALUES
('Rajesh Kumar', '27ABCDE1234F1Z5', '123 Market Street, Mumbai', 'rajesh@email.com', '9876543210', 'Kumar Traders'),
('Priya Sharma', '29FGHIJ5678K2L6', '456 Business Park, Delhi', 'priya@email.com', '9876543211', 'Sharma Enterprises'),
('Amit Patel', '24MNOPQ9012R3S7', '789 Industrial Area, Ahmedabad', 'amit@email.com', '9876543212', 'Patel Supplies');

-- Sample material names
INSERT INTO material_names (name) VALUES
('Rice'),
('Wheat Flour'),
('Sugar'),
('Cooking Oil'),
('Dal (Lentils)'),
('Tea Leaves'),
('Salt'),
('Biscuits'),
('Soap'),
('Detergent');

-- Sample material purchases
INSERT INTO materials (supplier_id, date, tax, total_cost) VALUES
(1, '2024-01-15', 5.00, 15000.00),
(2, '2024-01-16', 12.00, 8500.00),
(3, '2024-01-17', 18.00, 12000.00);

-- Sample material items
INSERT INTO material_items (material_id, material_name_id, quantity, unit, cost, cost_per_item) VALUES
(1, 1, 100.00, 'kg', 5000.00, 50.00),
(1, 2, 50.00, 'kg', 2500.00, 50.00),
(1, 3, 25.00, 'kg', 2000.00, 80.00),
(1, 4, 20.00, 'liters', 3000.00, 150.00),
(1, 5, 30.00, 'kg', 2500.00, 83.33),
(2, 6, 10.00, 'kg', 1500.00, 150.00),
(2, 7, 50.00, 'packets', 500.00, 10.00),
(2, 8, 100.00, 'packets', 2000.00, 20.00),
(2, 9, 50.00, 'units', 1500.00, 30.00),
(2, 10, 20.00, 'kg', 3000.00, 150.00);

-- Sample material list (inventory)
INSERT INTO material_list (material_name_id, cost_price, sell_price, total_quantity, unit, total_cost_price, total_selling_price, total_profit_price) VALUES
(1, 50.00, 60.00, 100.00, 'kg', 5000.00, 6000.00, 1000.00),
(2, 50.00, 55.00, 50.00, 'kg', 2500.00, 2750.00, 250.00),
(3, 80.00, 90.00, 25.00, 'kg', 2000.00, 2250.00, 250.00),
(4, 150.00, 170.00, 20.00, 'liters', 3000.00, 3400.00, 400.00),
(5, 83.33, 95.00, 30.00, 'kg', 2500.00, 2850.00, 350.00),
(6, 150.00, 180.00, 10.00, 'kg', 1500.00, 1800.00, 300.00),
(7, 10.00, 12.00, 50.00, 'packets', 500.00, 600.00, 100.00),
(8, 20.00, 25.00, 100.00, 'packets', 2000.00, 2500.00, 500.00),
(9, 30.00, 35.00, 50.00, 'units', 1500.00, 1750.00, 250.00),
(10, 150.00, 170.00, 20.00, 'kg', 3000.00, 3400.00, 400.00);

-- Sample billing records
INSERT INTO billing (customer_name, date, total_amount, paid_amount, is_paid) VALUES
('Ramesh Gupta', '2024-01-18', 1200.00, 1200.00, TRUE),
('Sunita Devi', '2024-01-19', 850.00, 500.00, FALSE),
('Mohan Singh', '2024-01-20', 2100.00, 2100.00, TRUE);

-- Sample billing items
INSERT INTO billing_items (billing_id, material_name_id, selling_price, quantity, unit, total_amount) VALUES
(1, 1, 60.00, 10.00, 'kg', 600.00),
(1, 3, 90.00, 5.00, 'kg', 450.00),
(1, 7, 12.00, 12.50, 'packets', 150.00),
(2, 2, 55.00, 10.00, 'kg', 550.00),
(2, 8, 25.00, 12.00, 'packets', 300.00),
(3, 4, 170.00, 5.00, 'liters', 850.00),
(3, 5, 95.00, 10.00, 'kg', 950.00),
(3, 9, 35.00, 8.57, 'units', 300.00);

-- Create indexes for better performance
CREATE INDEX idx_materials_supplier ON materials(supplier_id);
CREATE INDEX idx_materials_date ON materials(date);
CREATE INDEX idx_material_items_material ON material_items(material_id);
CREATE INDEX idx_material_items_name ON material_items(material_name_id);
CREATE INDEX idx_billing_date ON billing(date);
CREATE INDEX idx_billing_items_billing ON billing_items(billing_id);
CREATE INDEX idx_billing_items_material ON billing_items(material_name_id);