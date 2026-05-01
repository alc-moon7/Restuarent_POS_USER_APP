import { Cloud, Router, WifiOff } from 'lucide-react';

import type { ServerMode } from '../../types';
import { Badge } from '../ui/Badge';

export function ConnectionBadge({ mode }: { mode: ServerMode }) {
  if (mode === 'local') {
    return <Badge tone="success" icon={<Router size={13} />}>Local WiFi</Badge>;
  }
  if (mode === 'cloud') {
    return <Badge tone="info" icon={<Cloud size={13} />}>Online</Badge>;
  }
  return <Badge tone="danger" icon={<WifiOff size={13} />}>Offline</Badge>;
}
