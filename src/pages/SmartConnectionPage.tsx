import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ConnectionResolver } from '../components/connection/ConnectionResolver';
import { ConnectionBadge } from '../components/connection/ConnectionBadge';
import { ServerUnavailableCard } from '../components/connection/ServerUnavailableCard';
import { Card } from '../components/ui/Card';
import { useConnection } from '../contexts/ConnectionContext';

export function SmartConnectionPage() {
  const { state, resolve } = useConnection();
  const navigate = useNavigate();

  useEffect(() => {
    void resolve();
  }, [resolve]);

  useEffect(() => {
    if (state.status !== 'ready') return;
    if (state.mode === 'cloud') {
      navigate(`/r/${state.restaurantId}/o/${state.outletId}`, { replace: true });
      return;
    }
    navigate('/customer', { replace: true });
  }, [navigate, state.mode, state.outletId, state.restaurantId, state.status]);

  return (
    <main className="min-h-screen bg-pos-background px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <Card className="p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-pos-primary text-white shadow-lift">
                <ShoppingBag size={25} />
              </div>
              <ConnectionBadge mode={state.mode} />
            </div>
            <h1 className="text-3xl font-black text-pos-slate">
              Finding restaurant menu...
            </h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-pos-muted">
              We are checking the restaurant WiFi server first, then online menu
              if needed.
            </p>
            <div className="mt-6">
              <ConnectionResolver attempts={state.attempts} />
            </div>
          </Card>
          {state.status === 'error' ? (
            <div className="mt-5">
              <ServerUnavailableCard
                message={
                  state.blockedMixedContent
                    ? 'For offline ordering, please connect to restaurant WiFi and scan the local QR again.'
                    : state.error ??
                      'Restaurant server is unavailable. Please connect to restaurant WiFi and scan the QR again.'
                }
                onRetry={() => void resolve()}
              />
            </div>
          ) : null}
        </motion.div>
      </div>
    </main>
  );
}
