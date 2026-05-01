import { formatMoney } from '../../utils/money';
import { Card } from '../ui/Card';

export function OrderSummary({ total, count }: { total: number; count: number }) {
  return (
    <Card className="p-5">
      <h2 className="text-lg font-black text-pos-slate">Order summary</h2>
      <div className="mt-4 space-y-3 text-sm font-bold">
        <div className="flex justify-between text-pos-muted">
          <span>Items</span>
          <span>{count}</span>
        </div>
        <div className="flex justify-between text-pos-muted">
          <span>Subtotal</span>
          <span>{formatMoney(total)}</span>
        </div>
        <div className="border-t border-pos-line pt-3">
          <div className="flex justify-between text-lg font-black text-pos-slate">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
