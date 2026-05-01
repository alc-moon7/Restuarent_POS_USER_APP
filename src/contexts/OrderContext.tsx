import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';

import { loadLastOrder, saveLastOrder } from '../services/storage';
import type { Order } from '../types';

type OrderAction =
  | { type: 'set'; order: Order }
  | { type: 'clear' };

type OrderContextValue = {
  lastOrder: Order | null;
  setLastOrder: (order: Order) => void;
  clearLastOrder: () => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [lastOrder, dispatch] = useReducer(reducer, undefined, loadLastOrder);

  const value = useMemo<OrderContextValue>(
    () => ({
      lastOrder,
      setLastOrder: (order) => {
        saveLastOrder(order);
        dispatch({ type: 'set', order });
      },
      clearLastOrder: () => {
        saveLastOrder(null);
        dispatch({ type: 'clear' });
      },
    }),
    [lastOrder],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const value = useContext(OrderContext);
  if (!value) throw new Error('useOrder must be used inside OrderProvider.');
  return value;
}

function reducer(lastOrder: Order | null, action: OrderAction) {
  switch (action.type) {
    case 'set':
      return action.order;
    case 'clear':
      return null;
    default:
      return lastOrder;
  }
}
