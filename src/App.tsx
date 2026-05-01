import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { CartProvider } from './contexts/CartContext';
import { ConnectionProvider } from './contexts/ConnectionContext';
import { OrderProvider } from './contexts/OrderContext';
import { CartPage } from './pages/CartPage';
import { MenuPage } from './pages/MenuPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { SettingsPage } from './pages/SettingsPage';
import { SmartConnectionPage } from './pages/SmartConnectionPage';

export function App() {
  return (
    <ConnectionProvider>
      <CartProvider>
        <OrderProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<SmartConnectionPage />} />
              <Route path="/customer" element={<MenuPage />} />
              <Route path="/r/:restaurantId/o/:outletId" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/order/:orderId" element={<OrderTrackingPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </OrderProvider>
      </CartProvider>
    </ConnectionProvider>
  );
}
