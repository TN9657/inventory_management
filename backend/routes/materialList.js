const express = require('express');
const router = express.Router();
const {
  getAllMaterialList,
  updateMaterialListItem
} = require('../controllers/materialListController');

router.get('/', getAllMaterialList);
router.put('/:id', updateMaterialListItem);

module.exports = router;