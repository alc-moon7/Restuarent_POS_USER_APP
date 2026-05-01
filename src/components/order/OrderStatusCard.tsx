import { formatDistanceToNow } from 'date-fns';

import type { Order } from '../../types';
import { formatMoney } from '../../utils/money';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';

export function OrderStatusCard({ order }: { order: Order }) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-pos-muted">Order</p>
          <h1 className="mt-1 text-2xl font-black text-pos-slate">
            {order.orderNo}
          </h1>
          {order.updatedAt ? (
            <p className="mt-1 text-sm font-semibold text-pos-muted">
              Updated {formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true })}
            </p>
          ) : null}
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="mt-5 rounded-2xl bg-pos-background p-4">
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id ?? item.menuItemId} className="flex justify-between gap-4">
              <span className="text-sm font-bold text-pos-slate">
                {item.qty}x {item.name}
              </span>
              <span className="text-sm font-black text-pos-primary">
                {formatMoney(item.lineTotal ?? item.price * item.qty)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-pos-line pt-4">
          <div className="flex justify-between text-lg font-black text-pos-slate">
            <span>Total</span>
            <span>{formatMoney(order.total)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
