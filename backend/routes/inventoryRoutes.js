const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

// Inventory routes
router.post('/', inventoryController.upsertInventory);
router.get('/product/:productId', inventoryController.getProductInventory);
router.get('/darkstore/:darkStore', inventoryController.getDarkStoreInventory);
router.get('/check-availability', inventoryController.checkAvailability);

// Inventory operations
router.post('/reserve', inventoryController.reserveInventory);
router.post('/release', inventoryController.releaseReservation);
router.post('/fulfill', inventoryController.fulfillOrder);
router.post('/restock', inventoryController.restockInventory);

// Alerts and suggestions
router.get('/alerts/low-stock', inventoryController.getLowStockAlerts);
router.get('/suggestions/reorder', inventoryController.getReorderSuggestions);

module.exports = router;
