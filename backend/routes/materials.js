const express = require('express');
const router = express.Router();
const {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  deleteMaterial
} = require('../controllers/materialController');

router.get('/', getAllMaterials);
router.get('/:id', getMaterialById);
router.post('/', createMaterial);
router.delete('/:id', deleteMaterial);

module.exports = router;