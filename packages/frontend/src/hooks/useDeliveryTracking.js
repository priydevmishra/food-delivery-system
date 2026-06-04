'use client';
import { useEffect, useRef } from 'react';
import { useDispatch }       from 'react-redux';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket';
import { liveLocationReceived, stopTracking }         from '../store/slices/locationSlice';
import { setDriverLocation }                          from '../store/slices/deliverySlice';

/**
 * useDeliveryTracking(deliveryId)
 *
 * - Connects to location-service via Socket.io
 * - Joins the delivery room
 * - Listens for driver_location events
 * - Updates Redux: locationSlice + deliverySlice
 * - Cleans up on unmount or when deliveryId changes
 */
const useDeliveryTracking = (deliveryId) => {
  const dispatch    = useDispatch();
  const socketRef   = useRef(null);

  useEffect(() => {
    if (!deliveryId) return;

    const socket = connectSocket();
    socketRef.current = socket;

    // Join the room for this delivery
    socket.emit('track_order', { deliveryId });

    // Listen for real-time driver location
    const handleLocation = (data) => {
      dispatch(liveLocationReceived(data));
      dispatch(setDriverLocation(data));
    };

    socket.on('driver_location', handleLocation);

    // Cleanup — leave room and remove listener
    return () => {
      socket.off('driver_location', handleLocation);
      socket.emit('leave_delivery_room', { deliveryId });
      dispatch(stopTracking());
    };
  }, [deliveryId, dispatch]);

  // Call this to manually disconnect (e.g. after delivery is complete)
  const stopTracking_ = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave_delivery_room', { deliveryId });
      disconnectSocket();
    }
    dispatch(stopTracking());
  };

  return { stopTracking: stopTracking_ };
};

export default useDeliveryTracking;
