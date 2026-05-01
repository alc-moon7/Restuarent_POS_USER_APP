import { ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useCart } from '../../contexts/CartContext';
import { formatMoney } from '../../utils/money';
import { Button } from '../ui/Button';

export function StickyCartBar() {
  const cart = useCart();
  const navigate = useNavigate();
  if (cart.count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-pos-line bg-white/90 px-4 py-3 shadow-[0_-16px_40px_rgba(23,33,38,0.1)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pos-primary/10 text-pos-primary">
          <ShoppingBag size={21} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-pos-slate">
            {cart.count} item{cart.count === 1 ? '' : 's'}
          </p>
          <p className="text-xs font-bold text-pos-muted">{formatMoney(cart.total)}</p>
        </div>
        <Button className="px-5" onClick={() => navigate('/cart')}>
          View Cart
        </Button>
      </div>
    </div>
  );
}
