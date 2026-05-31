import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Settings, LogOut, Wallet } from 'lucide-react';
import { Expense, Budget, Tab } from '../types';
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LIST } from '../constants';
import { formatCurrency, formatMonthYear, getDaysInMonth } from '../utils';
import { CategoryBadge } from './CategoryBadge';

interface Props {
  expenses: Expense[];
  budgets: Budget[];
  onSetBudget: (category: string, limit: number) => Promise<void>;
  onNavigate: (tab: Tab) => void;
  getMonthExpenses: (y: number, m: number) => Expense[];
  totalAssets: number;
  onSignOut: () => void;
}

export function Dashboard({ expenses, budgets, onSetBudget, onNavigate, getMonthExpenses, totalAssets, onSignOut }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetCategory, setBudgetCategory] = useState<string>('food');
  const [budgetInput, setBudgetInput] = useState('');

  const monthExpenses = useMemo(() => getMonthExpenses(year, month), [getMonthExpenses, year, month]);
  const total = useMemo(() => monthExpenses.reduce((s, e) => s + Number(e.amount), 0), [monthExpenses]);

  const prevMonthTotal = useMemo(() => {
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    return getMonthExpenses(py, pm).reduce((s, e) => s + Number(e.amount), 0);
  }, [getMonthExpenses, year, month]);

  const diff = prevMonthTotal > 0 ? ((total - prevMonthTotal) / prevMonthTotal) * 100 : 0;
  const daysInMonth = getDaysInMonth(year, month);
  const dayOfMonth = year === now.getFullYear() && month === now.getMonth() ? now.getDate() : daysInMonth;
  const avgPerDay = dayOfMonth > 0 ? total / dayOfMonth : 0;

  const monthlyBudget = useMemo(() => {
    return budgets.reduce((s, b) => s + Number(b.monthly_limit), 0);
  }, [budgets]);

  const budgetPct = monthlyBudget > 0 ? Math.min((total / monthlyBudget) * 100, 100) : 0;

  const topCategories = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of monthExpenses) {
      totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
    }
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [monthExpenses]);

  const recentExpenses = useMemo(
    () => [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
    [expenses]
  );

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
    if (isCurrentMonth) return;
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  async function saveBudget() {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      await onSetBudget(budgetCategory, val);
    }
    setShowBudgetModal(false);
    setBudgetInput('');
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  return (
    <div className="flex flex-col gap-4 pb-28 px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-slate-400 text-sm mt-0.5">Your financial summary</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setBudgetCategory('food'); setShowBudgetModal(true); }}
            className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={onSignOut}
            className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Month Picker */}
      <div className="flex items-center justify-between bg-slate-800/60 rounded-2xl px-4 py-3">
        <button onClick={prevMonth} className="text-slate-400 hover:text-white transition-colors p-1">
          <ChevronLeft size={18} />
        </button>
        <span className="text-white font-semibold">{formatMonthYear(year, month)}</span>
        <button
          onClick={nextMonth}
          className={`transition-colors p-1 ${isCurrentMonth ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
          disabled={isCurrentMonth}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Total Assets Card */}
      <button
        onClick={() => onNavigate('assets')}
        className="rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 p-5 shadow-xl shadow-blue-500/20 text-left"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium flex items-center gap-1.5">
              <Wallet size={14} /> Total Assets
            </p>
            <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalAssets)}</p>
          </div>
          <ChevronRight className="text-blue-200" size={20} />
        </div>
      </button>

      {/* Expenses Card */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 shadow-xl shadow-emerald-500/20">
        <p className="text-emerald-100 text-sm font-medium">Total Expenses</p>
        <p className="text-3xl font-bold text-white mt-1">{formatCurrency(total)}</p>
        <div className="flex items-center gap-2 mt-2">
          {diff !== 0 ? (
            <>
              {diff < 0 ? (
                <TrendingDown size={14} className="text-emerald-200" />
              ) : (
                <TrendingUp size={14} className="text-red-200" />
              )}
              <span className={`text-sm font-medium ${diff < 0 ? 'text-emerald-200' : 'text-red-200'}`}>
                {Math.abs(diff).toFixed(1)}% vs last month
              </span>
            </>
          ) : (
            <span className="text-emerald-200 text-sm">No data from last month</span>
          )}
        </div>
        {monthlyBudget > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-emerald-100 mb-1.5">
              <span>Budget usage</span>
              <span>{formatCurrency(monthlyBudget)}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  budgetPct >= 90 ? 'bg-red-300' : budgetPct >= 70 ? 'bg-yellow-300' : 'bg-white'
                }`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            <p className="text-emerald-100 text-xs mt-1.5">{budgetPct.toFixed(0)}% used</p>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/60 rounded-2xl p-4">
          <p className="text-slate-400 text-xs font-medium">Daily Average</p>
          <p className="text-white font-bold text-xl mt-1">{formatCurrency(avgPerDay)}</p>
        </div>
        <div className="bg-slate-800/60 rounded-2xl p-4">
          <p className="text-slate-400 text-xs font-medium">Transactions</p>
          <p className="text-white font-bold text-xl mt-1">{monthExpenses.length}</p>
        </div>
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div className="bg-slate-800/60 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Top Categories</h3>
            <button onClick={() => onNavigate('analytics')} className="text-emerald-400 text-xs font-medium">
              View all
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {topCategories.map(([cat, amt]) => {
              const meta = EXPENSE_CATEGORIES[cat as keyof typeof EXPENSE_CATEGORIES];
              const pct = total > 0 ? (amt / total) * 100 : 0;
              return (
                <div key={cat}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{meta.icon}</span>
                      <span className="text-slate-300 text-sm">{meta.label}</span>
                    </div>
                    <span className="text-white font-semibold text-sm">{formatCurrency(amt)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: meta.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {recentExpenses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Recent</h3>
            <button onClick={() => onNavigate('expenses')} className="text-emerald-400 text-xs font-medium">
              See all
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {recentExpenses.map((e) => {
              const meta = EXPENSE_CATEGORIES[e.category as keyof typeof EXPENSE_CATEGORIES];
              return (
                <div key={e.id} className="bg-slate-800/60 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: meta.bg }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{e.description || meta.label}</p>
                    <CategoryBadge category={e.category} size="sm" />
                  </div>
                  <span className="text-white font-semibold text-sm flex-shrink-0">
                    -{formatCurrency(Number(e.amount))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-slate-900 rounded-t-3xl w-full p-6 pb-10">
            <h2 className="text-white text-lg font-bold mb-4">Set Category Budget</h2>
            <label className="text-slate-400 text-sm mb-1 block">Category</label>
            <select
              value={budgetCategory}
              onChange={(e) => setBudgetCategory(e.target.value)}
              className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 mb-4"
            >
              {EXPENSE_CATEGORY_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  {EXPENSE_CATEGORIES[cat].icon} {EXPENSE_CATEGORIES[cat].label}
                </option>
              ))}
            </select>
            <label className="text-slate-400 text-sm mb-1 block">Monthly Limit</label>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                className="w-full bg-slate-800 text-white rounded-xl px-8 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBudgetModal(false)}
                className="flex-1 bg-slate-800 text-white rounded-xl py-3 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveBudget}
                className="flex-1 bg-emerald-500 text-white rounded-xl py-3 font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
