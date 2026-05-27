// it handles all Redis interections for storing and returning driver licationdata.
const { createClient } = require('redis');

let client = null;

const initRedis = async () => {
  client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  client.on('error', (err) => console.error('[Redis] Error:', err.message));
  await client.connect();
  console.log('[Redis] Connected');
};

// Save driver location  — key: location:<deliveryId>
const saveLocation = async (deliveryId, lat, lng) => {
  const data = JSON.stringify({ lat, lng, updatedAt: new Date().toISOString() });
  await client.set(`location:${deliveryId}`, data, { EX: 3600 }); // expire in 1hr
};

// Get driver's last known location
const getLocation = async (deliveryId) => {
  const raw = await client.get(`location:${deliveryId}`);
  return raw ? JSON.parse(raw) : null;
};

// Store location history as a list (last 50 points)
const saveLocationHistory = async (deliveryId, lat, lng) => {
  const key   = `location:history:${deliveryId}`;
  const point = JSON.stringify({ lat, lng, time: Date.now() });
  await client.lPush(key, point);
  await client.lTrim(key, 0, 49);   // keep only last 50 points
  await client.expire(key, 3600);
};

const getLocationHistory = async (deliveryId) => {
  const key  = `location:history:${deliveryId}`;
  const list = await client.lRange(key, 0, -1);
  return list.map(item => JSON.parse(item));
};

module.exports = { initRedis, saveLocation, getLocation, saveLocationHistory, getLocationHistory };
