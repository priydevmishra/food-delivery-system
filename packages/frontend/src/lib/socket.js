import { io } from 'socket.io-client';

const LOCATION_SERVICE_URL = process.env.NEXT_PUBLIC_LOCATION_SERVICE_URL || 'http://localhost:3004';

let socket = null;

// Call this once — returns the same socket instance every time
export const getSocket = () => {
  if (!socket) {
    socket = io(LOCATION_SERVICE_URL, {
      autoConnect:    false,   // connect manually when tracking starts
      reconnection:   true,
      reconnectionAttempts: 5,
      reconnectionDelay:    1000,
    });

    socket.on('connect',    ()  => console.log('[Socket.io] Connected:', socket.id));
    socket.on('disconnect', ()  => console.log('[Socket.io] Disconnected'));
    socket.on('connect_error', (err) => console.error('[Socket.io] Connection error:', err.message));
  }
  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};
