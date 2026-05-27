require('dotenv').config();
const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const morgan         = require('morgan');
const deliveryRoutes = require('./routes/deliveryRoutes');
const { startKafkaConsumer } = require('./consumers/kafkaConsumer');

const app  = express();
const PORT = process.env.PORT || 3005;

//  Middleware it is used to enhance security, enable CORS
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes  
app.use('/api/delivery', deliveryRoutes);
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'delivery-service', port: PORT })
);

//  Start means: 1.start kafaka consumer to listen for new orders and assign delivery
              // 2.start express server to handle REST API .
const start = async () => {
  try {
    await startKafkaConsumer();
    app.listen(PORT, () =>
      console.log(`[Delivery Service] Running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('[Delivery Service] Startup failed:', err.message);
    process.exit(1);
  }
};

start();
