const { getConnection } = require('../config/database');

const getAllMaterialList = async (req, res) => {
  try {
    const connection = getConnection();
    const [rows] = await connection.execute(`
      SELECT ml.*, mn.name as material_name 
      FROM material_list ml 
      JOIN material_names mn ON ml.material_name_id = mn.id 
      ORDER BY mn.name
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateMaterialListItem = async (req, res) => {
  try {
    const { sell_price } = req.body;
    const connection = getConnection();
    
    await connection.execute(`
      UPDATE material_list 
      SET sell_price = ?, 
          total_selling_price = total_quantity * ?,
          total_profit_price = (total_quantity * ?) - total_cost_price
      WHERE id = ?
    `, [sell_price, sell_price, sell_price, req.params.id]);
    
    res.json({ message: 'Material list updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateQuantityAfterBilling = async (connection, materialNameId, quantity) => {
  await connection.execute(`
    UPDATE material_list 
    SET total_quantity = total_quantity - ?,
        total_selling_price = total_quantity * sell_price,
        total_cost_price = total_quantity * cost_price,
        total_profit_price = total_selling_price - total_cost_price
    WHERE material_name_id = ?
  `, [quantity, materialNameId]);
};

module.exports = {
  getAllMaterialList,
  updateMaterialListItem,
  updateQuantityAfterBilling
};