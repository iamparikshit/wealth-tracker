import { useState, useMemo } from 'react';
import { Trash2, Search, Filter, X, CreditCard as Edit2 } from 'lucide-react';
import { Expense, ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LIST, PAYMENT_SOURCES } from '../constants';
import { formatCurrency, formatDate } from '../utils';
import { CategoryBadge } from './CategoryBadge';

interface Props {
  expenses: Expense[];
  onDelete: (id: string) => Promise<void>;
  onEdit: (expense: Expense) => void;
}

export function ExpenseList({ expenses, onDelete, onEdit }: Props) {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<ExpenseCategory | 'all'>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    let list = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (filterCat !== 'all') list = list.filter((e) => e.category === filterCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          EXPENSE_CATEGORIES[e.category]?.label.toLowerCase().includes(q)
      );
    }
    return list;
  }, [expenses, filterCat, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, Expense[]> = {};
    for (const e of filtered) {
      if (!groups[e.date]) groups[e.date] = [];
      groups[e.date].push(e);
    }
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [filtered]);

  async function handleDelete(id: string) {
    setDeleting(true);
    try {
      await onDelete(id);
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col pb-28 pt-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-slate-400 text-sm mt-0.5">{expenses.length} total expenses</p>
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            filterCat !== 'all' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Filter size={16} />
        </button>
      </div>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search expenses..."
          className="w-full bg-slate-800 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-600"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
            <X size={14} />
          </button>
        )}
      </div>

      {showFilter && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
          <button
            onClick={() => setFilterCat('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterCat === 'all' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
            }`}
          >
            All
          </button>
          {EXPENSE_CATEGORY_LIST.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterCat === cat ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {EXPENSE_CATEGORIES[cat].icon} {EXPENSE_CATEGORIES[cat].label.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mb-4">💸</div>
          <p className="text-white font-semibold">No expenses found</p>
          <p className="text-slate-500 text-sm mt-1">
            {search || filterCat !== 'all' ? 'Try changing your filters' : 'Start adding expenses to see them here'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(([date, items]) => {
            const dayTotal = items.reduce((s, e) => s + Number(e.amount), 0);
            return (
              <div key={date}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-400 text-xs font-medium">{formatDate(date)}</span>
                  <span className="text-slate-400 text-xs font-medium">{formatCurrency(dayTotal)}</span>
                </div>
                <div className="flex flex-col gap-2">
                  {items.map((e) => {
                    const meta = EXPENSE_CATEGORIES[e.category];
                    return (
                      <div
                        key={e.id}
                        className="bg-slate-800/60 rounded-xl px-4 py-3 flex items-center gap-3 group"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                          style={{ backgroundColor: meta.bg }}
                        >
                          {meta.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">
                            {e.description || meta.label}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <CategoryBadge category={e.category} size="sm" />
                            {e.payment_source && (
                              <span className="text-slate-500 text-xs flex items-center gap-0.5">
                                {PAYMENT_SOURCES[e.payment_source]?.icon} {PAYMENT_SOURCES[e.payment_source]?.label}
                                {e.bank_account && <span className="text-slate-600">({e.bank_account})</span>}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            -{formatCurrency(Number(e.amount))}
                          </span>
                          {deleteConfirm === e.id ? (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleDelete(e.id)}
                                disabled={deleting}
                                className="text-red-400 hover:text-red-300 transition-colors px-2 py-1 text-xs bg-red-400/10 rounded"
                              >
                                {deleting ? '...' : 'Delete'}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-slate-400 hover:text-slate-300 transition-colors px-2 py-1 text-xs bg-slate-700 rounded"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onEdit(e)}
                                className="text-slate-500 hover:text-blue-400 transition-colors p-1"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(e.id)}
                                className="text-slate-500 hover:text-red-400 transition-colors p-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
