const router = require('express').Router();
const { updateLocation, getCurrentLocation, getHistory } = require('../controllers/locationController');

// POST /api/location/update              → update driver GPS position
// GET  /api/location/:deliveryId         → get last known location
// GET  /api/location/:deliveryId/history → get last 50 GPS points

router.post('/update',                  updateLocation);
router.get('/:deliveryId',              getCurrentLocation);
router.get('/:deliveryId/history',      getHistory);

module.exports = router;
