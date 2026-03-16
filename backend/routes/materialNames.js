const express = require('express');
const router = express.Router();
const {
  getAllMaterialNames,
  createMaterialName,
  deleteMaterialName
} = require('../controllers/materialNameController');

router.get('/', getAllMaterialNames);
router.post('/', createMaterialName);
router.delete('/:id', deleteMaterialName);

module.exports = router;