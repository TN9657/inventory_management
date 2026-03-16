const { getConnection } = require('../config/database');

const getAllMaterials = async (req, res) => {
  try {
    const connection = getConnection();
    const [rows] = await connection.execute(`
      SELECT m.*, s.name as supplier_name 
      FROM materials m 
      JOIN suppliers s ON m.supplier_id = s.id 
      ORDER BY m.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMaterialById = async (req, res) => {
  try {
    const connection = getConnection();
    const [material] = await connection.execute(`
      SELECT m.*, s.name as supplier_name 
      FROM materials m 
      JOIN suppliers s ON m.supplier_id = s.id 
      WHERE m.id = ?
    `, [req.params.id]);
    
    const [items] = await connection.execute(`
      SELECT mi.*, mn.name as material_name 
      FROM material_items mi 
      JOIN material_names mn ON mi.material_name_id = mn.id 
      WHERE mi.material_id = ?
    `, [req.params.id]);
    
    res.json({ ...material[0], items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createMaterial = async (req, res) => {
  try {
    const { supplier_id, date, tax, items } = req.body;
    const connection = getConnection();
    
    await connection.beginTransaction();
    
    const total_cost = items.reduce((sum, item) => sum + parseFloat(item.cost), 0);
    
    const [materialResult] = await connection.execute(
      'INSERT INTO materials (supplier_id, date, tax, total_cost) VALUES (?, ?, ?, ?)',
      [supplier_id, date, tax, total_cost]
    );
    
    const materialId = materialResult.insertId;
    
    for (const item of items) {
      const cost_per_item = item.cost / item.quantity;
        
      await connection.execute(
        'INSERT INTO material_items (material_id, material_name_id, quantity, unit, cost, cost_per_item) VALUES (?, ?, ?, ?, ?, ?)',
        [materialId, item.material_name_id, item.quantity, item.unit, item.cost, cost_per_item]
      );
      
      // Update material list with only new quantity
      await updateMaterialList(connection, item.material_name_id, item.quantity, cost_per_item, item.unit);
    }
    
    await connection.commit();
    res.status(201).json({ id: materialId, message: 'Material created successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  }
};

const updateMaterialList = async (connection, materialNameId, newQuantity, newCostPerItem, unit) => {
  const [existing] = await connection.execute(
    'SELECT * FROM material_list WHERE material_name_id = ?',
    [materialNameId]
  );
  
  if (existing.length > 0) {
    // Update existing record by adding new quantity
    const currentQuantity = parseFloat(existing[0].total_quantity || 0);
    const currentCostPrice = parseFloat(existing[0].cost_price || 0);
    const sellPrice = parseFloat(existing[0].sell_price || 0);
    
    // Calculate weighted average cost price
    const totalCurrentCost = currentQuantity * currentCostPrice;
    const newTotalCost = newQuantity * newCostPerItem;
    const finalQuantity = currentQuantity + newQuantity;
    const weightedAvgCost = finalQuantity > 0 ? (totalCurrentCost + newTotalCost) / finalQuantity : 0;
    
    await connection.execute(`
      UPDATE material_list 
      SET cost_price = ?, 
          total_quantity = ?,
          total_cost_price = ? * ?,
          total_selling_price = ? * ?,
          total_profit_price = (? * ?) - (? * ?)
      WHERE material_name_id = ?
    `, [
      weightedAvgCost,
      finalQuantity,
      finalQuantity, weightedAvgCost,
      finalQuantity, sellPrice,
      finalQuantity, sellPrice, finalQuantity, weightedAvgCost,
      materialNameId
    ]);
  } else {
    // Create new record
    await connection.execute(`
      INSERT INTO material_list (material_name_id, cost_price, sell_price, total_quantity, unit, total_cost_price, total_selling_price, total_profit_price)
      VALUES (?, ?, 0, ?, ?, ?, 0, 0)
    `, [materialNameId, newCostPerItem, newQuantity, unit, newQuantity * newCostPerItem]);
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const connection = getConnection();
    await connection.beginTransaction();
    
    await connection.execute('DELETE FROM material_items WHERE material_id = ?', [req.params.id]);
    await connection.execute('DELETE FROM materials WHERE id = ?', [req.params.id]);
    
    await connection.commit();
    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  deleteMaterial
};