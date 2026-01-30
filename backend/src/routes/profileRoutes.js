const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// All routes are protected
router.use(protect);

// Profile routes
router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.post('/upload-picture', upload.single('image'), profileController.uploadProfilePicture);
router.delete('/picture', profileController.deleteProfilePicture);
router.put('/password', profileController.updatePassword);
router.delete('/', profileController.deleteAccount);

// Delivery partner specific routes
router.put('/vehicle-info', authorize('delivery_partner'), profileController.updateVehicleInfo);
router.put('/availability', authorize('delivery_partner'), profileController.toggleAvailability);

module.exports = router;
