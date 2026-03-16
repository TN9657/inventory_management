const express = require('express');
const router = express.Router();
const {
  getAllBilling,
  getBillingById,
  createBilling,
  updateBillingPayment
} = require('../controllers/billingController');

router.get('/', getAllBilling);
router.get('/:id', getBillingById);
router.post('/', createBilling);
router.put('/:id/payment', updateBillingPayment);

module.exports = router;