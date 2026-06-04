import DeliveryTracker    from '../features/delivery/DeliveryTracker';
import NotificationBell  from '../features/notifications/NotificationBell';

// Demo page — replace with real order ID from auth/order context
export default function Home() {
  const DEMO_ORDER_ID = 'ORD001';
  const DEMO_USER_ID  = 'USR001';

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛵</span>
          <span className="font-bold text-gray-900">FoodRush</span>
        </div>
        <NotificationBell userId={DEMO_USER_ID} />
      </nav>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Track Your Order</h1>
          <p className="text-sm text-gray-500 mt-1">Order #{DEMO_ORDER_ID}</p>
        </div>
        <DeliveryTracker orderId={DEMO_ORDER_ID} />
      </div>
    </main>
  );
}
