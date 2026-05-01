import { RefreshCw, Search } from 'lucide-react';

import { useConnection } from '../../contexts/ConnectionContext';
import { envConfig } from '../../services/storage';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ConnectionBadge } from '../connection/ConnectionBadge';

export function MenuHeader({
  query,
  onQueryChange,
  onRefresh,
  refreshing,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const { state } = useConnection();
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <ConnectionBadge mode={state.mode} />
            <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-pos-muted">
              {state.serverInfo?.outletName || state.outletId}
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-normal text-pos-slate sm:text-4xl">
            {state.serverInfo?.restaurantName || envConfig.appName}
          </h1>
          <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-pos-muted">
            Freshly prepared dishes, sent straight to the kitchen.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={onRefresh}
          loading={refreshing}
          icon={<RefreshCw size={17} />}
        >
          Refresh
        </Button>
      </div>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-pos-muted"
          size={18}
        />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="pl-11"
          placeholder="Search dishes, categories, tags"
        />
      </div>
    </div>
  );
}
