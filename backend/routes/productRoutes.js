const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { upload } = require('../config/s3');
const { generalLimiter, strictLimiter, searchLimiter } = require('../middleware/rateLimiter');

// Product routes with rate limiting
router.post('/', strictLimiter, upload.array('images', 5), productController.createProduct);
router.get('/', generalLimiter, productController.getProducts);
router.get('/search', searchLimiter, productController.searchProducts);
router.get('/:id', generalLimiter, productController.getProduct);
router.put('/:id', strictLimiter, upload.array('images', 5), productController.updateProduct);
router.delete('/:id', strictLimiter, productController.deleteProduct);

// Recommendation routes
router.get('/:id/recommendations', generalLimiter, productController.getRecommendations);
router.get('/:id/frequently-bought-together', generalLimiter, productController.getFrequentlyBoughtTogether);

module.exports = router;
