import { CheckCircle2, Clock3, CookingPot, PackageCheck, XCircle } from 'lucide-react';

import type { OrderStatus } from '../../types';
import { Badge } from './Badge';

export function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = {
    pending: { label: 'Pending', tone: 'warning' as const, icon: <Clock3 size={13} /> },
    accepted: { label: 'Accepted', tone: 'primary' as const, icon: <CheckCircle2 size={13} /> },
    preparing: { label: 'Preparing', tone: 'info' as const, icon: <CookingPot size={13} /> },
    ready: { label: 'Ready', tone: 'success' as const, icon: <PackageCheck size={13} /> },
    served: { label: 'Served', tone: 'success' as const, icon: <CheckCircle2 size={13} /> },
    cancelled: { label: 'Cancelled', tone: 'danger' as const, icon: <XCircle size={13} /> },
  }[status];

  return (
    <Badge tone={meta.tone} icon={meta.icon}>
      {meta.label}
    </Badge>
  );
}
