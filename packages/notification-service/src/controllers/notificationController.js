// Notification controllers
// it can be called by REST API or RabbitMQ consumer to create and manage notifications for users. It interacts with the notification service to save notifications and mark them as read.

const { getUserNotifications, markAsRead, saveNotification } = require('../services/notificationService');

// GET /api/notifications/:userId
const getNotifications = (req, res) => {
  const { userId } = req.params;
  const limit      = parseInt(req.query.limit) || 20;
  const data       = getUserNotifications(userId, limit);
  res.json({ success: true, data, count: data.length });
};

// PUT /api/notifications/:id/read
const markNotificationRead = (req, res) => {
  const notification = markAsRead(req.params.id);
  if (!notification)
    return res.status(404).json({ success: false, message: 'Notification not found' });
  res.json({ success: true, data: notification });
};

// POST /api/notifications/send  — manual / testing trigger
const sendDirect = (req, res) => {
  const { userId, type, data } = req.body;
  if (!userId || !type)
    return res.status(400).json({ success: false, message: 'userId and type required' });
  const notification = saveNotification(userId, type, data || {});
  res.status(201).json({ success: true, data: notification });
};

module.exports = { getNotifications, markNotificationRead, sendDirect };
