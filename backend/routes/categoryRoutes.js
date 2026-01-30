const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { generalLimiter, strictLimiter } = require('../middleware/rateLimiter');

// Category routes with rate limiting
router.post('/', strictLimiter, categoryController.createCategory);
router.get('/', generalLimiter, categoryController.getCategories);
router.get('/tree', generalLimiter, categoryController.getCategoryTree);
router.get('/:id', generalLimiter, categoryController.getCategory);
router.put('/:id', strictLimiter, categoryController.updateCategory);
router.delete('/:id', strictLimiter, categoryController.deleteCategory);

module.exports = router;
