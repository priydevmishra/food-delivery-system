// why we need this file?
// this file contains all the shared constants and configurations that can be used across different services in the food delivery system. It helps to maintain consistency and avoid hardcoding values in multiple places. For example, it defines Kafka topics, RabbitMQ queues, delivery status, notification types, and service ports that can be imported and used by any service that needs them.
// This file can be imported in any service like this:
// const { KAFKA_TOPICS, DELIVERY_STATUS } = require('@food-delivery/shared');

// this common page is used to store shared constanta and configurations.

const KAFKA_TOPICS = {
  ORDER_CONFIRMED:       'order.confirmed',
  DELIVERY_ASSIGNED:     'delivery.assigned',
  DELIVERY_STATUS_UPDATE:'delivery.status_updated',
  DELIVERY_COMPLETED:    'delivery.completed',
};

const RABBITMQ_QUEUES = {
  NOTIFICATION: 'notification.queue',
};

const DELIVERY_STATUS = {
  PENDING:    'PENDING',
  ASSIGNED:   'ASSIGNED',
  PICKED_UP:  'PICKED_UP',
  ON_THE_WAY: 'ON_THE_WAY',
  DELIVERED:  'DELIVERED',
  FAILED:     'FAILED',
};

const NOTIFICATION_TYPES = {
  ORDER_PLACED:      'ORDER_PLACED',
  ORDER_ASSIGNED:    'ORDER_ASSIGNED',
  ORDER_PICKED_UP:   'ORDER_PICKED_UP',
  ORDER_ON_THE_WAY:  'ORDER_ON_THE_WAY',
  ORDER_DELIVERED:   'ORDER_DELIVERED',
  PAYMENT_FAILED:    'PAYMENT_FAILED',
};

const SERVICE_PORTS = {
  AUTH_SERVICE:         3000,
  ORDER_SERVICE:        3001,
  RESTAURANT_SERVICE:   3002,
  NOTIFICATION_SERVICE: 3003,
  LOCATION_SERVICE:     3004,
  DELIVERY_SERVICE:     3005,
  PAYMENT_SERVICE:      3006,
  FRONTEND:             4000,
};

module.exports = {
  KAFKA_TOPICS,
  RABBITMQ_QUEUES,
  DELIVERY_STATUS,
  NOTIFICATION_TYPES,
  SERVICE_PORTS,
};
