const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { generalLimiter, strictLimiter } = require('../middleware/rateLimiter');

// Inventory routes with rate limiting
router.post('/', strictLimiter, inventoryController.upsertInventory);
router.get('/product/:productId', generalLimiter, inventoryController.getProductInventory);
router.get('/darkstore/:darkStore', generalLimiter, inventoryController.getDarkStoreInventory);
router.get('/check-availability', generalLimiter, inventoryController.checkAvailability);

// Inventory operations
router.post('/reserve', strictLimiter, inventoryController.reserveInventory);
router.post('/release', strictLimiter, inventoryController.releaseReservation);
router.post('/fulfill', strictLimiter, inventoryController.fulfillOrder);
router.post('/restock', strictLimiter, inventoryController.restockInventory);

// Alerts and suggestions
router.get('/alerts/low-stock', generalLimiter, inventoryController.getLowStockAlerts);
router.get('/suggestions/reorder', generalLimiter, inventoryController.getReorderSuggestions);

module.exports = router;
