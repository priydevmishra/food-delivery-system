const { saveLocation, getLocation, getLocationHistory } = require('../services/redisService');

// POST /api/location/update
// Called by delivery-service when driver updates position via REST
const updateLocation = async (req, res) => {
  const { deliveryId, lat, lng } = req.body;
  if (!deliveryId || lat === undefined || lng === undefined)
    return res.status(400).json({ success: false, message: 'deliveryId, lat, lng required' });

  try {
    await saveLocation(deliveryId, lat, lng);

    // Also broadcast via socket so connected clients get it in real-time
    const io = req.app.get('io');
    io.to(`delivery:${deliveryId}`).emit('driver_location', {
      deliveryId, lat, lng,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, message: 'Location updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/location/:deliveryId
// Get last known location of a driver
const getCurrentLocation = async (req, res) => {
  const { deliveryId } = req.params;
  try {
    const location = await getLocation(deliveryId);
    if (!location)
      return res.status(404).json({ success: false, message: 'No location found for this delivery' });
    res.json({ success: true, data: { deliveryId, ...location } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/location/:deliveryId/history
// Get last 50 GPS points
const getHistory = async (req, res) => {
  const { deliveryId } = req.params;
  try {
    const history = await getLocationHistory(deliveryId);
    res.json({ success: true, data: history, count: history.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { updateLocation, getCurrentLocation, getHistory };
