const { getConnection } = require('../config/database');

const getAllMaterialNames = async (req, res) => {
  try {
    const connection = getConnection();
    const [rows] = await connection.execute('SELECT * FROM material_names ORDER BY name');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createMaterialName = async (req, res) => {
  try {
    const { name } = req.body;
    const connection = getConnection();
    const [result] = await connection.execute(
      'INSERT INTO material_names (name) VALUES (?)',
      [name]
    );
    res.status(201).json({ id: result.insertId, message: 'Material name created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMaterialName = async (req, res) => {
  try {
    const connection = getConnection();
    await connection.execute('DELETE FROM material_names WHERE id = ?', [req.params.id]);
    res.json({ message: 'Material name deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllMaterialNames,
  createMaterialName,
  deleteMaterialName
};