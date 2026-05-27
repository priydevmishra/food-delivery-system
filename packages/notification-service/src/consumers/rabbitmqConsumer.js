// why we use RabbitMQ in notification service
/*
1. Decoupling: RabbitMQ allows the delivery service to send notifications without needing to know how the notification service processes them. This decoupling makes it easier to maintain and scale each service independently.

2. Reliability: RabbitMQ ensures that messages are delivered even if the notification service is temporarily down. It can retry sending messages and can persist them until they are successfully processed.

3. Asynchronous Communication: The delivery service can publish notifications to RabbitMQ and continue its work without waiting for the notification service to process them. This improves performance and responsiveness.

*/

const amqp = require('amqplib');
const { RABBITMQ_QUEUES } = require('@food-delivery/shared');
const { sendEmail, saveNotification } = require('../services/notificationService');

let connection = null;
let channel    = null;

const startConsumer = async () => {
  const url  = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
  connection = await amqp.connect(url);
  channel    = await connection.createChannel();

  await channel.assertQueue(RABBITMQ_QUEUES.NOTIFICATION, { durable: true });
  channel.prefetch(1);

  console.log(`[RabbitMQ] Waiting on queue: ${RABBITMQ_QUEUES.NOTIFICATION}`);

  channel.consume(RABBITMQ_QUEUES.NOTIFICATION, async (msg) => {
    if (!msg) return;
    try {
      // Expected payload: { userId, email, type, data }
      const payload = JSON.parse(msg.content.toString());
      console.log('[RabbitMQ] Message received:', payload.type);

      saveNotification(payload.userId, payload.type, payload.data || {});

      if (payload.email) {
        await sendEmail(payload.email, payload.type, payload.data || {});
      }

      channel.ack(msg);
    } catch (err) {
      console.error('[RabbitMQ] Handler error:', err.message);
      channel.nack(msg, false, false); // reject, move to dead-letter
    }
  });
};

// Use this to publish from other places (e.g. delivery-service calling notification)
const publishNotification = async (payload) => {
  if (!channel) throw new Error('RabbitMQ channel not initialised');
  channel.sendToQueue(
    RABBITMQ_QUEUES.NOTIFICATION,
    Buffer.from(JSON.stringify(payload)),
    { persistent: true }
  );
  console.log('[RabbitMQ] Published:', payload.type);
};

module.exports = { startConsumer, publishNotification };
