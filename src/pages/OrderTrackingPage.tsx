import { ArrowLeft, Radio } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { OrderStatusCard } from '../components/order/OrderStatusCard';
import { OrderStepper } from '../components/order/OrderStepper';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ErrorView } from '../components/ui/ErrorView';
import { LoadingView } from '../components/ui/LoadingView';
import { useConnection } from '../contexts/ConnectionContext';
import { useOrder } from '../contexts/OrderContext';
import { RealtimeClient } from '../services/websocketClient';
import type { Order } from '../types';

export function OrderTrackingPage() {
  const { orderId = '' } = useParams();
  const { apiClient, state, resolve } = useConnection();
  const { lastOrder, setLastOrder } = useOrder();
  const [order, setOrder] = useState<Order | null>(
    lastOrder?.id === orderId ? lastOrder : null,
  );
  const [loading, setLoading] = useState(!order);
  const [error, setError] = useState('');
  const [realtimeState, setRealtimeState] = useState<
    'connecting' | 'connected' | 'reconnecting' | 'closed'
  >('closed');

  useEffect(() => {
    if (!apiClient && state.status !== 'resolving') {
      void resolve();
    }
  }, [apiClient, resolve, state.status]);

  useEffect(() => {
    if (!apiClient || !orderId) return;
    void loadOrder();
    const poller = window.setInterval(() => void loadOrder(true), 10000);
    return () => window.clearInterval(poller);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiClient, orderId]);

  useEffect(() => {
    if (!apiClient || !orderId) return;
    const client = new RealtimeClient({
      url: apiClient.getWebSocketUrl(),
      onStateChange: setRealtimeState,
      onEvent: (event) => {
        if (event.type !== 'order_status_updated' && event.type !== 'order_created') {
          return;
        }
        const data = event.data;
        if (!data || typeof data !== 'object' || !('id' in data)) return;
        if (data.id !== orderId) return;
        const updated = data as Order;
        setOrder(updated);
        setLastOrder(updated);
      },
    });
    client.connect();
    return () => client.close();
  }, [apiClient, orderId, setLastOrder]);

  const realtimeBadge = useMemo(() => {
    if (realtimeState === 'connected') {
      return <Badge tone="success" icon={<Radio size={13} />}>Live</Badge>;
    }
    if (realtimeState === 'reconnecting' || realtimeState === 'connecting') {
      return <Badge tone="warning" icon={<Radio size={13} />}>Reconnecting</Badge>;
    }
    return <Badge tone="muted" icon={<Radio size={13} />}>Polling</Badge>;
  }, [realtimeState]);

  async function loadOrder(silent = false) {
    if (!apiClient || !orderId) return;
    if (!silent) setLoading(true);
    const result = await apiClient.getOrder(orderId);
    if (result.ok) {
      setOrder(result.data);
      setLastOrder(result.data);
      setError('');
    } else if (!silent) {
      setError(result.error);
    }
    if (!silent) setLoading(false);
  }

  if (loading && !order) return <LoadingView message="Loading order..." />;

  return (
    <main className="min-h-screen bg-pos-background px-4 py-6">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/customer"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-pos-muted hover:text-pos-primary"
          >
            <ArrowLeft size={16} />
            Back to menu
          </Link>
          {realtimeBadge}
        </div>
        {error && !order ? (
          <ErrorView
            message={error}
            action={<Button onClick={() => void loadOrder()}>Retry</Button>}
          />
        ) : order ? (
          <>
            {realtimeState === 'reconnecting' ? (
              <div className="rounded-2xl border border-pos-warning/20 bg-pos-warning/10 px-4 py-3 text-sm font-bold text-pos-warning">
                Reconnecting live updates. We are polling every 10 seconds.
              </div>
            ) : null}
            <OrderStatusCard order={order} />
            <OrderStepper status={order.status} />
          </>
        ) : (
          <ErrorView message="Order was not found yet." />
        )}
      </div>
    </main>
  );
}
