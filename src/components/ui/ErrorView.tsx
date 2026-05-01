import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

import { Card } from './Card';

export function ErrorView({
  title = 'Something went wrong',
  message,
  action,
}: {
  title?: string;
  message: string;
  action?: ReactNode;
}) {
  return (
    <Card className="p-6">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pos-danger/10 text-pos-danger">
          <AlertTriangle size={22} />
        </div>
        <div>
          <h2 className="text-lg font-black text-pos-slate">{title}</h2>
          <p className="mt-1 text-sm font-medium leading-6 text-pos-muted">
            {message}
          </p>
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </Card>
  );
}
