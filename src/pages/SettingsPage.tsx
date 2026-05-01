import { ArrowLeft, PlugZap, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { useCart } from '../contexts/CartContext';
import { useConnection } from '../contexts/ConnectionContext';
import { useOrder } from '../contexts/OrderContext';
import { clearSavedConnection } from '../services/storage';

export function SettingsPage() {
  const { state, apiClient, updateSettings, resolve } = useConnection();
  const cart = useCart();
  const order = useOrder();
  const [cloudApiUrl, setCloudApiUrl] = useState(state.cloudApiUrl);
  const [restaurantId, setRestaurantId] = useState(state.restaurantId);
  const [outletId, setOutletId] = useState(state.outletId);
  const [testMessage, setTestMessage] = useState('');
  const [testing, setTesting] = useState(false);

  async function save() {
    updateSettings({ cloudApiUrl, restaurantId, outletId });
    await resolve();
  }

  async function testConnection() {
    setTesting(true);
    setTestMessage('');
    const result = apiClient ? await apiClient.checkHealth() : null;
    setTesting(false);
    setTestMessage(result?.ok ? 'Connection is healthy.' : 'Connection failed.');
  }

  return (
    <main className="min-h-screen bg-pos-background px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <Link
          to="/customer"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-pos-muted hover:text-pos-primary"
        >
          <ArrowLeft size={16} />
          Back to menu
        </Link>
        <div>
          <h1 className="text-3xl font-black text-pos-slate">Settings</h1>
          <p className="mt-2 text-sm font-semibold text-pos-muted">
            Advanced connection controls for staff troubleshooting.
          </p>
        </div>
        <Card className="space-y-4 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Current mode" value={state.mode} />
            <Info
              label="Active API URL"
              value={state.serverInfo?.baseUrl ?? 'Unavailable'}
            />
          </div>
          <Input
            value={cloudApiUrl}
            onChange={(event) => setCloudApiUrl(event.target.value)}
            placeholder="Cloud API URL"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              value={restaurantId}
              onChange={(event) => setRestaurantId(event.target.value)}
              placeholder="Restaurant ID"
            />
            <Input
              value={outletId}
              onChange={(event) => setOutletId(event.target.value)}
              placeholder="Outlet ID"
            />
          </div>
          <Info label="Last order ID" value={order.lastOrder?.id ?? 'None'} />
          <div className="flex flex-wrap gap-3">
            <Button onClick={save}>Save & reconnect</Button>
            <Button
              variant="secondary"
              onClick={testConnection}
              loading={testing}
              icon={<PlugZap size={17} />}
            >
              Test Connection
            </Button>
            <Button variant="secondary" onClick={cart.clear} icon={<Trash2 size={17} />}>
              Clear Cart
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                clearSavedConnection();
                order.clearLastOrder();
                setTestMessage('Saved connection cleared.');
              }}
            >
              Clear Saved Connection
            </Button>
          </div>
          {testMessage ? (
            <p className="text-sm font-black text-pos-primary">{testMessage}</p>
          ) : null}
        </Card>
      </div>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-pos-line bg-pos-background px-4 py-3">
      <p className="text-xs font-extrabold uppercase tracking-wide text-pos-muted">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-black text-pos-slate">{value}</p>
    </div>
  );
}
