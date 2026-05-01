import type { ReactNode } from 'react';

import { Card } from './Card';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  message: string;
  action?: ReactNode;
};

export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 rounded-3xl bg-pos-primary/10 p-4 text-pos-primary">
        {icon}
      </div>
      <h2 className="text-xl font-black text-pos-slate">{title}</h2>
      <p className="mt-2 max-w-md text-sm font-medium leading-6 text-pos-muted">
        {message}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </Card>
  );
}
