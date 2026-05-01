import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import { loadCart, saveCart } from '../services/storage';
import type { CartItem, MenuItem } from '../types';

type CartAction =
  | { type: 'add'; item: MenuItem }
  | { type: 'increase'; id: string }
  | { type: 'decrease'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'clear' };

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: MenuItem) => void;
  increase: (id: string) => void;
  decrease: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, undefined, loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const total = items.reduce(
      (sum, item) => sum + item.menuItem.price * item.qty,
      0,
    );
    return {
      items,
      count,
      total,
      addItem: (item) => dispatch({ type: 'add', item }),
      increase: (id) => dispatch({ type: 'increase', id }),
      decrease: (id) => dispatch({ type: 'decrease', id }),
      remove: (id) => dispatch({ type: 'remove', id }),
      clear: () => dispatch({ type: 'clear' }),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider.');
  return value;
}

function reducer(items: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      if (!action.item.isAvailable) return items;
      const existing = items.find((item) => item.menuItem.id === action.item.id);
      if (existing) {
        return items.map((item) =>
          item.menuItem.id === action.item.id
            ? { ...item, qty: item.qty + 1 }
            : item,
        );
      }
      return [...items, { menuItem: action.item, qty: 1 }];
    }
    case 'increase':
      return items.map((item) =>
        item.menuItem.id === action.id ? { ...item, qty: item.qty + 1 } : item,
      );
    case 'decrease':
      return items
        .map((item) =>
          item.menuItem.id === action.id ? { ...item, qty: item.qty - 1 } : item,
        )
        .filter((item) => item.qty > 0);
    case 'remove':
      return items.filter((item) => item.menuItem.id !== action.id);
    case 'clear':
      return [];
  }
}
