'use client';
import { useState }     from 'react';
import { useSelector }  from 'react-redux';
import useNotifications from '../../hooks/useNotifications';

const TYPE_ICONS = {
  ORDER_PLACED:     '🛍️',
  ORDER_ASSIGNED:   '🧑‍🍳',
  ORDER_PICKED_UP:  '📦',
  ORDER_ON_THE_WAY: '🛵',
  ORDER_DELIVERED:  '✅',
  PAYMENT_FAILED:   '❌',
};

const NotificationBell = ({ userId }) => {
  const [open] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markRead } = useNotifications(userId);

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
        <span className="text-lg">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-orange-500 font-medium">{unreadCount} new</span>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors
                    ${!n.isRead ? 'bg-orange-50/60' : ''}`}>
                  <div className="flex gap-3 items-start">
                    <span className="text-lg mt-0.5">{TYPE_ICONS[n.type] || '📢'}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${!n.isRead ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                        {n.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default NotificationBell;
