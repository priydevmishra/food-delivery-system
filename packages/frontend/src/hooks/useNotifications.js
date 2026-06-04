'use client';
import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationRead } from '../store/slices/notificationSlice';

/**
 * useNotifications(userId)
 *
 * - Fetches notifications on mount
 * - Polls every 15 seconds for new ones
 * - Returns list, unread count, and markRead helper
 */
const useNotifications = (userId) => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.notifications);

  const loadNotifications = useCallback(() => {
    if (userId) dispatch(fetchNotifications(userId));
  }, [userId, dispatch]);

  // Initial load + polling every 15s
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markRead = (notificationId) => {
    dispatch(markNotificationRead(notificationId));
  };

  const unreadCount = list.filter(n => !n.isRead).length;

  return { notifications: list, unreadCount, loading, error, markRead, refresh: loadNotifications };
};

export default useNotifications;
