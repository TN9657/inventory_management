const { getConnection } = require('../config/database');
const { updateQuantityAfterBilling } = require('./materialListController');

const getAllBilling = async (req, res) => {
  try {
    const connection = getConnection();
    const [rows] = await connection.execute('SELECT * FROM billing ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBillingById = async (req, res) => {
  try {
    const connection = getConnection();
    const [billing] = await connection.execute('SELECT * FROM billing WHERE id = ?', [req.params.id]);
    
    const [items] = await connection.execute(`
      SELECT bi.*, mn.name as material_name 
      FROM billing_items bi 
      JOIN material_names mn ON bi.material_name_id = mn.id 
      WHERE bi.billing_id = ?
    `, [req.params.id]);
    
    res.json({ ...billing[0], items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createBilling = async (req, res) => {
  try {
    const { customer_name, date, items, paid_amount } = req.body;
    const connection = getConnection();
    
    await connection.beginTransaction();
    
    const total_amount = items.reduce((sum, item) => sum + parseFloat(item.total_amount), 0);
    const is_paid = paid_amount >= total_amount;
    
    const [billingResult] = await connection.execute(
      'INSERT INTO billing (customer_name, date, total_amount, paid_amount, is_paid) VALUES (?, ?, ?, ?, ?)',
      [customer_name, date, total_amount, paid_amount, is_paid]
    );
    
    const billingId = billingResult.insertId;
    
    for (const item of items) {
      await connection.execute(
        'INSERT INTO billing_items (billing_id, material_name_id, selling_price, quantity, unit, total_amount) VALUES (?, ?, ?, ?, ?, ?)',
        [billingId, item.material_name_id, item.selling_price, item.quantity, item.unit, item.total_amount]
      );
      
      // Update material list quantity
      await updateQuantityAfterBilling(connection, item.material_name_id, item.quantity);
    }
    
    await connection.commit();
    res.status(201).json({ id: billingId, message: 'Billing created successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  }
};

const updateBillingPayment = async (req, res) => {
  try {
    const { paid_amount } = req.body;
    const connection = getConnection();
    
    const [billing] = await connection.execute('SELECT total_amount FROM billing WHERE id = ?', [req.params.id]);
    const is_paid = paid_amount >= billing[0].total_amount;
    
    await connection.execute(
      'UPDATE billing SET paid_amount = ?, is_paid = ? WHERE id = ?',
      [paid_amount, is_paid, req.params.id]
    );
    
    res.json({ message: 'Payment updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllBilling,
  getBillingById,
  createBilling,
  updateBillingPayment
};