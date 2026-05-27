const nodemailer = require('nodemailer');
const { NOTIFICATION_TYPES } = require('@food-delivery/shared');

// In-memory store — swap with MongoDB in production
const notifications = [];

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// notification service handles all notification related logic.
const getTemplate = (type, data) => {
  const map = {
    [NOTIFICATION_TYPES.ORDER_PLACED]:     { subject: 'Order Placed!',   body: `Your order #${data.orderId} has been placed.` },
    [NOTIFICATION_TYPES.ORDER_ASSIGNED]:   { subject: 'Driver Assigned!', body: `Driver assigned to order #${data.orderId}.` },
    [NOTIFICATION_TYPES.ORDER_PICKED_UP]:  { subject: 'Order Picked Up!', body: `Order #${data.orderId} picked up — on the way!` },
    [NOTIFICATION_TYPES.ORDER_ON_THE_WAY]: { subject: 'On The Way!',      body: `Order #${data.orderId} is heading to you.` },
    [NOTIFICATION_TYPES.ORDER_DELIVERED]:  { subject: 'Delivered!',        body: `Order #${data.orderId} delivered. Enjoy your meal!` },
    [NOTIFICATION_TYPES.PAYMENT_FAILED]:   { subject: 'Payment Failed',   body: `Payment for order #${data.orderId} failed. Please retry.` },
  };
  return map[type] || { subject: 'Update', body: JSON.stringify(data) };
};

//send email to user using nodemailer.
const sendEmail = async (to, type, data) => {
  const { subject, body } = getTemplate(type, data);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[Email Mock] To: ${to} | Subject: ${subject}`);
    return { success: true, mock: true };
  }
  await transporter.sendMail({ from: process.env.SMTP_USER, to, subject, text: body });
  return { success: true };
};

// save notifcation to in-memory store, in production this should be saved to a database and can be queried by user.
const saveNotification = (userId, type, data) => {
  const n = {
    id:        `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    userId,
    type,
    data,
    message:   getTemplate(type, data).body,
    isRead:    false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(n);
  return n;
};

const getUserNotifications = (userId, limit = 20) =>
  notifications.filter(n => n.userId === userId).slice(0, limit);

const markAsRead = (id) => {
  const n = notifications.find(n => n.id === id);
  if (n) n.isRead = true;
  return n || null;
};

module.exports = { sendEmail, saveNotification, getUserNotifications, markAsRead };
