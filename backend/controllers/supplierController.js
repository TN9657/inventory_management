const { getConnection } = require('../config/database');

const getAllSuppliers = async (req, res) => {
  try {
    const connection = getConnection();
    const [rows] = await connection.execute('SELECT * FROM suppliers ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSupplierById = async (req, res) => {
  try {
    const connection = getConnection();
    const [rows] = await connection.execute('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createSupplier = async (req, res) => {
  try {
    const { name, gst, address, email, phone, company_name } = req.body;
    const connection = getConnection();
    const [result] = await connection.execute(
      'INSERT INTO suppliers (name, gst, address, email, phone, company_name) VALUES (?, ?, ?, ?, ?, ?)',
      [name, gst, address, email, phone, company_name]
    );
    res.status(201).json({ id: result.insertId, message: 'Supplier created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const { name, gst, address, email, phone, company_name } = req.body;
    const connection = getConnection();
    await connection.execute(
      'UPDATE suppliers SET name = ?, gst = ?, address = ?, email = ?, phone = ?, company_name = ? WHERE id = ?',
      [name, gst, address, email, phone, company_name, req.params.id]
    );
    res.json({ message: 'Supplier updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const connection = getConnection();
    await connection.execute('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};