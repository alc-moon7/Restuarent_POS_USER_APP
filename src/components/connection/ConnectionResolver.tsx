import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';

import type { ConnectionAttempt } from '../../types';

export function ConnectionResolver({ attempts }: { attempts: ConnectionAttempt[] }) {
  return (
    <div className="space-y-3">
      {attempts.map((attempt) => (
        <div
          key={attempt.label}
          className="flex items-center gap-3 rounded-2xl border border-pos-line bg-pos-background px-4 py-3"
        >
          {attempt.status === 'running' ? (
            <Loader2 className="animate-spin text-pos-primary" size={18} />
          ) : attempt.status === 'success' ? (
            <CheckCircle2 className="text-pos-success" size={18} />
          ) : attempt.status === 'failed' ? (
            <XCircle className="text-pos-danger" size={18} />
          ) : (
            <Circle className="text-pos-muted" size={18} />
          )}
          <span className="text-sm font-bold text-pos-slate">{attempt.label}</span>
        </div>
      ))}
    </div>
  );
}
