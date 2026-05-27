// it is the main router for delivery Service, it defines all the REST endpoints related to delivery management and driver location updates.

const router = require('express').Router();
const {
  assignDelivery,
  getByOrder,
  getById,
  changeStatus,
  updateDriverLocation,
} = require('../controllers/deliveryController');

// POST /api/delivery/assign             → create & assign delivery
// GET  /api/delivery/order/:orderId     → get delivery by order ID
// GET  /api/delivery/:id                → get delivery by delivery ID
// PUT  /api/delivery/:id/status         → update delivery status
// POST /api/delivery/:id/location       → push driver GPS via REST

router.post('/assign',              assignDelivery);
router.get('/order/:orderId',       getByOrder);
router.get('/:id',                  getById);
router.put('/:id/status',           changeStatus);
router.post('/:id/location',        updateDriverLocation);

module.exports = router;
