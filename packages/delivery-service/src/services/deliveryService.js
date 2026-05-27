const axios = require('axios');
const { DELIVERY_STATUS } = require('@food-delivery/shared');

// In-memory store — swap with MongoDB in production
const deliveries = [];

// ── Mock driver pool (in production → fetch from DB) ─────────────────
const availableDrivers = [
  { id: 'DRV001', name: 'Ravi Kumar',  phone: '+91-9999900001', isAvailable: true },
  { id: 'DRV002', name: 'Amit Sharma', phone: '+91-9999900002', isAvailable: true },
  { id: 'DRV003', name: 'Pooja Singh', phone: '+91-9999900003', isAvailable: true },
];

// ── Find a free driver ────────────────────────────────────────────────
const assignDriver = () => {
  const driver = availableDrivers.find(d => d.isAvailable);
  if (driver) driver.isAvailable = false;
  return driver || null;
};

const freeDriver = (driverId) => {
  const driver = availableDrivers.find(d => d.id === driverId);
  if (driver) driver.isAvailable = true;
};

// ── Create a new delivery record ──────────────────────────────────────
const createDelivery = (orderId, customerId, restaurantAddress, deliveryAddress) => {
  const driver = assignDriver();
  const delivery = {
    id:                `del_${Date.now()}`,
    orderId,
    customerId,
    driverId:          driver ? driver.id   : null,
    driverName:        driver ? driver.name : 'Unassigned',
    driverPhone:       driver ? driver.phone : null,
    restaurantAddress,
    deliveryAddress,
    status:            driver ? DELIVERY_STATUS.ASSIGNED : DELIVERY_STATUS.PENDING,
    estimatedMinutes:  30,
    createdAt:         new Date().toISOString(),
    updatedAt:         new Date().toISOString(),
  };
  deliveries.push(delivery);
  return delivery;
};

// ── Get delivery by orderId ───────────────────────────────────────────
const getDeliveryByOrderId = (orderId) =>
  deliveries.find(d => d.orderId === orderId) || null;

const getDeliveryById = (id) =>
  deliveries.find(d => d.id === id) || null;

// ── Update delivery status ────────────────────────────────────────────
const updateStatus = async (deliveryId, newStatus) => {
  const delivery = getDeliveryById(deliveryId);
  if (!delivery) return null;

  delivery.status    = newStatus;
  delivery.updatedAt = new Date().toISOString();

  if (newStatus === DELIVERY_STATUS.DELIVERED && delivery.driverId) {
    freeDriver(delivery.driverId);
  }

  return delivery;
};

// ── Push GPS update to location-service ───────────────────────────────
const pushLocationUpdate = async (deliveryId, lat, lng) => {
  const locationServiceUrl = process.env.LOCATION_SERVICE_URL || 'http://localhost:3004';
  try {
    await axios.post(`${locationServiceUrl}/api/location/update`, { deliveryId, lat, lng });
  } catch (err) {
    console.error('[Delivery] Failed to push location update:', err.message);
  }
};

module.exports = {
  createDelivery,
  getDeliveryByOrderId,
  getDeliveryById,
  updateStatus,
  pushLocationUpdate,
};
