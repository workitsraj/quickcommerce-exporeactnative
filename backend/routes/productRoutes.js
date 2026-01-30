const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { upload } = require('../config/s3');

// Product routes
router.post('/', upload.array('images', 5), productController.createProduct);
router.get('/', productController.getProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProduct);
router.put('/:id', upload.array('images', 5), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

// Recommendation routes
router.get('/:id/recommendations', productController.getRecommendations);
router.get('/:id/frequently-bought-together', productController.getFrequentlyBoughtTogether);

module.exports = router;
