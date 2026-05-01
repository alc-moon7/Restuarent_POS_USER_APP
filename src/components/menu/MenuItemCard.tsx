import { motion } from 'framer-motion';
import { Clock3, Plus, Utensils } from 'lucide-react';

import type { MenuItem } from '../../types';
import { formatMoney } from '../../utils/money';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export function MenuItemCard({
  item,
  onAdd,
}: {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
    >
      <Card className="flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[1.55] overflow-hidden bg-pos-primary/10">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-pos-primary">
              <Utensils size={42} />
            </div>
          )}
          <div className="absolute left-3 top-3">
            <Badge tone={item.isAvailable ? 'success' : 'danger'}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </Badge>
          </div>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="line-clamp-2 text-lg font-black text-pos-slate">
                {item.name}
              </h2>
              <p className="mt-1 text-xs font-extrabold uppercase tracking-wide text-pos-primary">
                {item.category}
              </p>
            </div>
            <p className="shrink-0 text-lg font-black text-pos-primary">
              {formatMoney(item.price)}
            </p>
          </div>
          <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-pos-muted">
            {item.description || 'Prepared fresh by the kitchen.'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {item.preparationTimeMinutes ? (
              <Badge tone="muted" icon={<Clock3 size={13} />}>
                {item.preparationTimeMinutes} min
              </Badge>
            ) : null}
            {item.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} tone="muted">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="mt-auto pt-5">
            <Button
              className="w-full"
              disabled={!item.isAvailable}
              onClick={() => onAdd(item)}
              icon={<Plus size={18} />}
            >
              Add
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
