// it index.js file of notification service, it sets up the Express server, defines routes, and starts the RabbitMQ consumer to listen for messages from the delivery service. It also includes a health check endpoint for monitoring the service status.

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');
const notificationRoutes  = require('./routes/notificationRoutes');
const { startConsumer }   = require('./consumers/rabbitmqConsumer');

const app  = express();
const PORT = process.env.PORT || 3003;

//  Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes 
app.use('/api/notifications', notificationRoutes);
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'notification-service', port: PORT })
);

// Start
const start = async () => {
  try {
    await startConsumer();           // start RabbitMQ consumer
    app.listen(PORT, () =>
      console.log(`[Notification Service] Running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('[Notification Service] Startup failed:', err.message);
    process.exit(1);
  }
};

start();
