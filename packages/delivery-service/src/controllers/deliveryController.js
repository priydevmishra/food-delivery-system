const {
  createDelivery,
  getDeliveryByOrderId,
  getDeliveryById,
  updateStatus,
  pushLocationUpdate,
} = require('../services/deliveryService');
const { DELIVERY_STATUS } = require('@food-delivery/shared');

// POST /api/delivery/assign
// Called manually or by order-service webhook
const assignDelivery = (req, res) => {
  const { orderId, customerId, restaurantAddress, deliveryAddress } = req.body;
  if (!orderId || !customerId)
    return res.status(400).json({ success: false, message: 'orderId and customerId required' });

  const delivery = createDelivery(orderId, customerId, restaurantAddress, deliveryAddress);
  res.status(201).json({ success: true, data: delivery });
};

// GET /api/delivery/order/:orderId
// Customer tracks their order's delivery
const getByOrder = (req, res) => {
  const delivery = getDeliveryByOrderId(req.params.orderId);
  if (!delivery)
    return res.status(404).json({ success: false, message: 'Delivery not found for this order' });
  res.json({ success: true, data: delivery });
};

// GET /api/delivery/:id
const getById = (req, res) => {
  const delivery = getDeliveryById(req.params.id);
  if (!delivery)
    return res.status(404).json({ success: false, message: 'Delivery not found' });
  res.json({ success: true, data: delivery });
};

// PUT /api/delivery/:id/status
// Driver app updates delivery status
const changeStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = Object.values(DELIVERY_STATUS);

  if (!status || !validStatuses.includes(status))
    return res.status(400).json({ success: false, message: `status must be one of: ${validStatuses.join(', ')}` });

  const delivery = await updateStatus(req.params.id, status);
  if (!delivery)
    return res.status(404).json({ success: false, message: 'Delivery not found' });

  res.json({ success: true, data: delivery });
};

// POST /api/delivery/:id/location
// Driver pushes GPS position via REST (alternative to socket.io)
const updateDriverLocation = async (req, res) => {
  const { lat, lng } = req.body;
  if (lat === undefined || lng === undefined)
    return res.status(400).json({ success: false, message: 'lat and lng required' });

  await pushLocationUpdate(req.params.id, lat, lng);
  res.json({ success: true, message: 'Location forwarded to location-service' });
};

module.exports = { assignDelivery, getByOrder, getById, changeStatus, updateDriverLocation };
