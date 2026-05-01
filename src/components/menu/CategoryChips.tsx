import { cn } from '../../utils/cn';

export function CategoryChips({
  categories,
  selected,
  onSelect,
}: {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={cn(
            'shrink-0 rounded-full border px-4 py-2 text-sm font-extrabold transition',
            selected === category
              ? 'border-pos-primary bg-pos-primary text-white shadow-lift'
              : 'border-pos-line bg-white text-pos-muted hover:border-pos-primary/40 hover:text-pos-primary',
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
