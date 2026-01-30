const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

// Configure multer for memory storage (CSV files)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Upload routes
router.post('/products', upload.single('file'), uploadController.uploadProductsCSV);
router.post('/inventory', upload.single('file'), uploadController.uploadInventoryCSV);

// Template download routes
router.get('/templates/products', uploadController.downloadProductTemplate);
router.get('/templates/inventory', uploadController.downloadInventoryTemplate);

module.exports = router;
