// Notification routes
const router = require('express').Router();
const { getNotifications, markNotificationRead, sendDirect } = require('../controllers/notificationController');

// GET  /api/notifications/:userId       → get all notifications for a user
// PUT  /api/notifications/:id/read      → mark one as read
// POST /api/notifications/send          → manual send (for testing)

router.get('/:userId',   getNotifications);
router.put('/:id/read',  markNotificationRead);
router.post('/send',     sendDirect);

module.exports = router;
