const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/', addressController.getAddresses);
router.post('/', addressController.addAddress);
router.put('/:addressId', addressController.updateAddress);
router.delete('/:addressId', addressController.deleteAddress);
router.put('/:addressId/default', addressController.setDefaultAddress);

module.exports = router;
