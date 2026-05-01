import { Minus, Plus, Trash2 } from 'lucide-react';

import { useCart } from '../../contexts/CartContext';
import type { CartItem } from '../../types';
import { formatMoney } from '../../utils/money';
import { Card } from '../ui/Card';

export function CartItemRow({ item }: { item: CartItem }) {
  const cart = useCart();
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-pos-primary/10">
          {item.menuItem.imageUrl ? (
            <img
              src={item.menuItem.imageUrl}
              alt={item.menuItem.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-2xl font-black text-pos-primary">
              {item.menuItem.name[0]}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-black text-pos-slate">{item.menuItem.name}</h3>
              <p className="mt-1 text-sm font-bold text-pos-muted">
                {formatMoney(item.menuItem.price)}
              </p>
            </div>
            <button
              onClick={() => cart.remove(item.menuItem.id)}
              className="rounded-xl p-2 text-pos-danger transition hover:bg-pos-danger/10"
              aria-label="Remove item"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-2xl border border-pos-line p-1">
              <button
                onClick={() => cart.decrease(item.menuItem.id)}
                className="rounded-xl bg-pos-background p-2 text-pos-slate"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center text-sm font-black text-pos-slate">
                {item.qty}
              </span>
              <button
                onClick={() => cart.increase(item.menuItem.id)}
                className="rounded-xl bg-pos-primary p-2 text-white"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
            <p className="font-black text-pos-primary">
              {formatMoney(item.menuItem.price * item.qty)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
