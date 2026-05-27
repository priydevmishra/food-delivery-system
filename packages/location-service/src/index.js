require('dotenv').config();
const express    = require('express');
const http       = require('http');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const { Server } = require('socket.io');

const locationRoutes = require('./routes/locationRoutes');
const { initRedis }  = require('./services/redisService');
const { initSocket } = require('./socket/socketHandler');

const app    = express();
const server = http.createServer(app);          // socket.io needs raw http server
const PORT   = process.env.PORT || 3004;

//  Socket.io in location services
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});
initSocket(io);                                  // attach all socket events

// Middleware 
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Pass io to routes so controllers can emit events
app.set('io', io);

//  Routes 
app.use('/api/location', locationRoutes);
app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'location-service', port: PORT })
);

//  Start 
const start = async () => {
  try {
    await initRedis();
    server.listen(PORT, () =>
      console.log(`[Location Service] Running on http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error('[Location Service] Startup failed:', err.message);
    process.exit(1);
  }
};

start();
