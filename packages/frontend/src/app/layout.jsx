import './globals.css';
import Providers from './providers';

export const metadata = {
  title:       'Food Delivery',
  description: 'Real-time food delivery system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
