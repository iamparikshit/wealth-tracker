import { ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';

interface Props {
  category: ExpenseCategory;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'md' }: Props) {
  const meta = EXPENSE_CATEGORIES[category];
  if (!meta) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      {meta.icon} {meta.label}
    </span>
  );
}
