'use client';
import { useEffect }            from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDelivery }        from '../../store/slices/deliverySlice';
import useDeliveryTracking      from '../../hooks/useDeliveryTracking';

const STATUS_STEPS = ['PENDING', 'ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED'];

const STATUS_LABELS = {
  PENDING:    'Order Placed',
  ASSIGNED:   'Driver Assigned',
  PICKED_UP:  'Picked Up',
  ON_THE_WAY: 'On The Way',
  DELIVERED:  'Delivered',
};

const STATUS_ICONS = {
  PENDING:    '🕐',
  ASSIGNED:   '🧑‍🍳',
  PICKED_UP:  '📦',
  ON_THE_WAY: '🛵',
  DELIVERED:  '✅',
};

// Step indicator
const StatusBar = ({ currentStatus }) => {
  const currentIdx = STATUS_STEPS.indexOf(currentStatus);
  return (
    <div className="flex items-center justify-between w-full my-4">
      {STATUS_STEPS.map((step, idx) => {
        const done    = idx <= currentIdx;
        const current = idx === currentIdx;
        return (
          <div key={step} className="flex flex-col items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
              ${done ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'}
              ${current ? 'ring-4 ring-orange-200 scale-110' : ''}`}>
              {STATUS_ICONS[step]}
            </div>
            <span className={`text-xs mt-1 text-center leading-tight
              ${done ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
              {STATUS_LABELS[step]}
            </span>
            {/* Connecting line */}
            {idx < STATUS_STEPS.length - 1 && (
              <div className={`absolute h-0.5 w-full top-4 left-1/2 -z-10
                ${idx < currentIdx ? 'bg-orange-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

//  Driver info card
const DriverCard = ({ delivery }) => (
  <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl">
    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
      {delivery.driverName?.[0] || 'D'}
    </div>
    <div className="flex-1">
      <p className="font-semibold text-gray-800 text-sm">{delivery.driverName || 'Driver'}</p>
      <p className="text-xs text-gray-500">{delivery.driverPhone || 'Connecting...'}</p>
    </div>
    {delivery.driverPhone && (
      <a href={`tel:${delivery.driverPhone}`}
        className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm">
        📞
      </a>
    )}
  </div>
);

//  Live location display (replace with real map in production) 
const LiveLocation = ({ location }) => {
  if (!location) return null;
  return (
    <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs font-medium text-blue-700">Driver Location (Live)</span>
      </div>
      <p className="text-xs text-gray-500 font-mono">
        Lat: {location.lat?.toFixed(5)} &nbsp;|&nbsp; Lng: {location.lng?.toFixed(5)}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">
        Updated: {location.updatedAt ? new Date(location.updatedAt).toLocaleTimeString() : '—'}
      </p>
    </div>
  );
};

// Main component 
const DeliveryTracker = ({ orderId }) => {
  const dispatch  = useDispatch();
  const { current: delivery, loading, error } = useSelector((s) => s.delivery);
  const { current: location }                 = useSelector((s) => s.location);

  // Start socket tracking once we have a deliveryId
  useDeliveryTracking(delivery?.id);

  useEffect(() => {
    if (orderId) dispatch(fetchDelivery(orderId));
  }, [orderId, dispatch]);

  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent" />
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">{error}</div>
  );

  if (!delivery) return (
    <div className="p-4 text-center text-gray-400 text-sm">No delivery found for this order.</div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Delivery Tracking</h2>
        <span className={`text-xs px-2 py-1 rounded-full font-medium
          ${delivery.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
          {delivery.status}
        </span>
      </div>

      {/* Progress steps */}
      <StatusBar currentStatus={delivery.status} />

      {/* Driver info */}
      {delivery.driverId && <DriverCard delivery={delivery} />}

      {/* Live location */}
      <LiveLocation location={location} />

      {/* Addresses */}
      <div className="space-y-2 text-xs text-gray-500">
        {delivery.restaurantAddress && (
          <div className="flex gap-2">
            <span>🏪</span>
            <span>{delivery.restaurantAddress}</span>
          </div>
        )}
        {delivery.deliveryAddress && (
          <div className="flex gap-2">
            <span>📍</span>
            <span>{delivery.deliveryAddress}</span>
          </div>
        )}
        <div className="flex gap-2">
          <span>⏱</span>
          <span>Est. {delivery.estimatedMinutes} mins</span>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracker;
