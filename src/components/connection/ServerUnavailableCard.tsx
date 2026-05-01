import { WifiOff } from 'lucide-react';

import { Button } from '../ui/Button';
import { ErrorView } from '../ui/ErrorView';

export function ServerUnavailableCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <ErrorView
      title="Restaurant server is unavailable"
      message={message}
      action={
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={onRetry} icon={<WifiOff size={18} />}>
            Retry
          </Button>
          <p className="text-sm font-semibold leading-6 text-pos-muted">
            Connect to the restaurant WiFi and scan the QR again.
          </p>
        </div>
      }
    />
  );
}
