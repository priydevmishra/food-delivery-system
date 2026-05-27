// Why We Use Socket.IO in Location Service
/*
1.Real-Time Location Updates: Socket.io allows the location service to push real time gps updates
2.Live Delivery Tracking: Customers can trach their delivery in real time without refreshing the page.
3.Bidirectional Communication
4.Low Latency Communication
*/

const { saveLocation, saveLocationHistory } = require('../services/redisService');

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    //  Driver joins their delivery room 
    // Driver app emits: join_delivery_room with { deliveryId }
    socket.on('join_delivery_room', ({ deliveryId }) => {
      if (!deliveryId) return;
      socket.join(`delivery:${deliveryId}`);
      console.log(`[Socket.io] ${socket.id} joined room: delivery:${deliveryId}`);
    });

    //  Customer joins to track their order 
    // Customer app emits: track_order with { deliveryId }
    socket.on('track_order', ({ deliveryId }) => {
      if (!deliveryId) return;
      socket.join(`delivery:${deliveryId}`);
      console.log(`[Socket.io] Customer ${socket.id} tracking: delivery:${deliveryId}`);
    });

    // Driver sends live GPS location update
    // Driver app emits: location_update with { deliveryId, lat, lng }
    socket.on('location_update', async ({ deliveryId, lat, lng }) => {
      if (!deliveryId || lat === undefined || lng === undefined) return;

      try {
        await saveLocation(deliveryId, lat, lng);
        await saveLocationHistory(deliveryId, lat, lng);

        // Broadcast to everyone tracking this delivery (customers + restaurant)
        io.to(`delivery:${deliveryId}`).emit('driver_location', {
          deliveryId,
          lat,
          lng,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[Socket.io] Location save error:', err.message);
      }
    });

    // Driver leaves (delivery done or disconnected) 
    socket.on('leave_delivery_room', ({ deliveryId }) => {
      socket.leave(`delivery:${deliveryId}`);
      console.log(`[Socket.io] ${socket.id} left room: delivery:${deliveryId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initSocket };
