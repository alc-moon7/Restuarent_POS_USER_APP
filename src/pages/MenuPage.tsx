import { AnimatePresence } from 'framer-motion';
import { Utensils } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { CategoryChips } from '../components/menu/CategoryChips';
import { MenuHeader } from '../components/menu/MenuHeader';
import { MenuItemCard } from '../components/menu/MenuItemCard';
import { StickyCartBar } from '../components/menu/StickyCartBar';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorView } from '../components/ui/ErrorView';
import { LoadingView } from '../components/ui/LoadingView';
import { useCart } from '../contexts/CartContext';
import { useConnection } from '../contexts/ConnectionContext';
import type { MenuItem } from '../types';

export function MenuPage() {
  const { state, apiClient, resolve } = useConnection();
  const cart = useCart();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (state.status === 'idle' || state.status === 'error') {
      void resolve();
    }
  }, [resolve, state.status]);

  useEffect(() => {
    if (!apiClient) return;
    void loadMenu(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiClient]);

  const categories = useMemo(() => {
    const values = Array.from(new Set(menu.map((item) => item.category))).sort();
    return ['All', ...values];
  }, [menu]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return menu.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category;
      const matchesQuery =
        !normalized ||
        item.name.toLowerCase().includes(normalized) ||
        item.description.toLowerCase().includes(normalized) ||
        item.category.toLowerCase().includes(normalized) ||
        item.tags?.some((tag) => tag.toLowerCase().includes(normalized));
      return matchesCategory && matchesQuery;
    });
  }, [category, menu, query]);

  async function loadMenu(isRefresh: boolean) {
    if (!apiClient) return;
    setError('');
    setLoading(!isRefresh);
    setRefreshing(isRefresh);
    const result = await apiClient.getMenu();
    if (result.ok) {
      setMenu(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
    setRefreshing(false);
  }

  if (state.status === 'resolving' || (!apiClient && !error)) {
    return <LoadingView message="Finding restaurant menu..." />;
  }

  return (
    <main className="min-h-screen bg-pos-background px-4 pb-28 pt-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <MenuHeader
          query={query}
          onQueryChange={setQuery}
          onRefresh={() => void loadMenu(true)}
          refreshing={refreshing}
        />

        {error ? (
          <ErrorView
            message={error}
            action={
              <Button onClick={() => void resolve()}>Retry connection</Button>
            }
          />
        ) : loading ? (
          <LoadingView message="Loading menu..." />
        ) : menu.length === 0 ? (
          <EmptyState
            icon={<Utensils size={34} />}
            title="Menu is empty"
            message="The restaurant has not published menu items yet."
            action={<Button onClick={() => void loadMenu(true)}>Refresh</Button>}
          />
        ) : (
          <>
            <CategoryChips
              categories={categories}
              selected={category}
              onSelect={setCategory}
            />
            {filtered.length === 0 ? (
              <EmptyState
                icon={<Utensils size={34} />}
                title="No dishes found"
                message="Try another search term or category."
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {filtered.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAdd={cart.addItem}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>
      <StickyCartBar />
    </main>
  );
}
