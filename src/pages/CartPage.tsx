import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { CartItemRow } from '../components/cart/CartItemRow';
import { CheckoutForm, type CheckoutFormValues } from '../components/cart/CheckoutForm';
import { OrderSummary } from '../components/cart/OrderSummary';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorView } from '../components/ui/ErrorView';
import { useCart } from '../contexts/CartContext';
import { useConnection } from '../contexts/ConnectionContext';
import { useOrder } from '../contexts/OrderContext';

export function CartPage() {
  const cart = useCart();
  const { apiClient, resolve } = useConnection();
  const { setLastOrder } = useOrder();
  const navigate = useNavigate();
  const [values, setValues] = useState<CheckoutFormValues>({
    customerName: '',
    tableNo: '',
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submitOrder() {
    if (submitting || cart.count === 0) return;
    if (!apiClient) {
      setError('Restaurant server is unavailable.');
      await resolve();
      return;
    }
    setSubmitting(true);
    setError('');
    const result = await apiClient.createOrder({
      customerName: values.customerName.trim(),
      tableNo: values.tableNo.trim(),
      note: values.note.trim(),
      items: cart.items.map((item) => ({
        menuItemId: item.menuItem.id,
        name: item.menuItem.name,
        qty: item.qty,
        price: item.menuItem.price,
      })),
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setLastOrder(result.data);
    cart.clear();
    navigate(`/order/${result.data.id}`);
  }

  return (
    <main className="min-h-screen bg-pos-background px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Link
              to="/customer"
              className="mb-3 inline-flex items-center gap-2 text-sm font-extrabold text-pos-muted hover:text-pos-primary"
            >
              <ArrowLeft size={16} />
              Back to menu
            </Link>
            <h1 className="text-3xl font-black text-pos-slate">Cart</h1>
          </div>
        </div>

        {cart.count === 0 ? (
          <EmptyState
            icon={<ShoppingBag size={34} />}
            title="Your cart is empty"
            message="Add a few dishes from the menu before placing an order."
            action={<Button onClick={() => navigate('/customer')}>Open Menu</Button>}
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
            <div className="space-y-3">
              {cart.items.map((item) => (
                <CartItemRow key={item.menuItem.id} item={item} />
              ))}
              {error ? <ErrorView message={error} /> : null}
            </div>
            <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <OrderSummary total={cart.total} count={cart.count} />
              <CheckoutForm
                values={values}
                onChange={setValues}
                submitting={submitting}
                disabled={cart.count === 0}
                onSubmit={submitOrder}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
