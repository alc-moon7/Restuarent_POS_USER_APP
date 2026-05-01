import { CheckCircle2 } from 'lucide-react';

import type { OrderStatus } from '../../types';
import { cn } from '../../utils/cn';

const steps: Array<{ status: OrderStatus; label: string }> = [
  { status: 'pending', label: 'Pending' },
  { status: 'accepted', label: 'Accepted' },
  { status: 'preparing', label: 'Preparing' },
  { status: 'ready', label: 'Ready' },
  { status: 'served', label: 'Served' },
];

const priority: Record<OrderStatus, number> = {
  pending: 0,
  accepted: 1,
  preparing: 2,
  ready: 3,
  served: 4,
  cancelled: -1,
};

export function OrderStepper({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="rounded-2xl bg-pos-danger/10 p-4 text-sm font-black text-pos-danger">
        Order cancelled
      </div>
    );
  }
  const current = priority[status];
  return (
    <div className="grid gap-3 sm:grid-cols-5">
      {steps.map((step, index) => {
        const complete = index <= current;
        return (
          <div
            key={step.status}
            className={cn(
              'rounded-2xl border p-3',
              complete
                ? 'border-pos-primary/25 bg-pos-primary/10 text-pos-primary'
                : 'border-pos-line bg-pos-background text-pos-muted',
            )}
          >
            <CheckCircle2 size={18} />
            <p className="mt-2 text-xs font-black">{step.label}</p>
          </div>
        );
      })}
    </div>
  );
}
