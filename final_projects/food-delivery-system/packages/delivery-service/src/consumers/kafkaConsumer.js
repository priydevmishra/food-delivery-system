const { Kafka } = require('kafkajs');
const { KAFKA_TOPICS, NOTIFICATION_TYPES } = require('@food-delivery/shared');
const { createDelivery } = require('../services/deliveryService');

// Lazy-load RabbitMQ publisher to notify customer
let publishNotification;
const getPublisher = async () => {
  if (!publishNotification) {
    const amqp = require('amqplib');
    const { RABBITMQ_QUEUES } = require('@food-delivery/shared');
    const url  = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    const conn = await amqp.connect(url);
    const ch   = await conn.createChannel();
    await ch.assertQueue(RABBITMQ_QUEUES.NOTIFICATION, { durable: true });
    publishNotification = (payload) =>
      ch.sendToQueue(RABBITMQ_QUEUES.NOTIFICATION, Buffer.from(JSON.stringify(payload)), { persistent: true });
  }
  return publishNotification;
};

const kafka = new Kafka({
  clientId: 'delivery-service',
  brokers:  [(process.env.KAFKA_BROKER || 'localhost:9092')],
});

const consumer = kafka.consumer({ groupId: 'delivery-group' });

const startKafkaConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: KAFKA_TOPICS.ORDER_CONFIRMED, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          console.log(`[Kafka] Received on ${topic}:`, payload.orderId);

          // Auto-create delivery record when order is confirmed
          const delivery = createDelivery(
            payload.orderId,
            payload.customerId,
            payload.restaurantAddress,
            payload.deliveryAddress
          );

          console.log(`[Kafka] Delivery created: ${delivery.id} — Driver: ${delivery.driverName}`);

          // Notify customer via RabbitMQ → notification-service
          // why not push to kafaka? because we want to decouple notification logic and avoid tight coupling b/w services.
          
          const publish = await getPublisher();
          publish({
            userId:  payload.customerId,
            email:   payload.customerEmail,
            type:    NOTIFICATION_TYPES.ORDER_ASSIGNED,
            data: {
              orderId:    payload.orderId,
              deliveryId: delivery.id,
              driverName: delivery.driverName,
            },
          });
        } catch (err) {
          console.error('[Kafka] Message handling error:', err.message);
        }
      },
    });

    console.log(`[Kafka] Consumer listening on: ${KAFKA_TOPICS.ORDER_CONFIRMED}`);
  } catch (err) {
    console.warn('[Kafka] Could not connect — running without Kafka (dev mode):', err.message);
  }
};

module.exports = { startKafkaConsumer };
