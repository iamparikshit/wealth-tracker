import { useMemo, useState } from 'react';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Settings, LogOut, PiggyBank } from 'lucide-react';
import { Expense, Budget, Tab, InvestmentCategory } from '../types';
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LIST, INVESTMENT_CATEGORIES, INVESTMENT_CATEGORY_META, PAYMENT_SOURCES } from '../constants';
import { formatCurrency, formatMonthYear, getDaysInMonth } from '../utils';
import { CategoryBadge } from './CategoryBadge';

interface Props {
  expenses: Expense[];
  budgets: Budget[];
  onSetBudget: (limit: number) => Promise<void>;
  onNavigate: (tab: Tab) => void;
  getMonthExpenses: (y: number, m: number) => Expense[];
  onSignOut: () => void;
}

export function Dashboard({ expenses, budgets, onSetBudget, onNavigate, getMonthExpenses, onSignOut }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);

  const monthExpenses = useMemo(() => getMonthExpenses(year, month), [getMonthExpenses, year, month]);
  const total = useMemo(() => monthExpenses.reduce((s, e) => s + Number(e.amount), 0), [monthExpenses]);

  // Investment totals for current month
  const investmentTotal = useMemo(() => {
    return monthExpenses
      .filter((e) => INVESTMENT_CATEGORIES.includes(e.category as InvestmentCategory))
      .reduce((s, e) => s + Number(e.amount), 0);
  }, [monthExpenses]);

  // All-time investment totals
  const allTimeInvestments = useMemo(() => {
    const totals: Partial<Record<InvestmentCategory, number>> = {};
    for (const cat of INVESTMENT_CATEGORIES) {
      totals[cat] = 0;
    }
    for (const e of expenses) {
      if (INVESTMENT_CATEGORIES.includes(e.category as InvestmentCategory)) {
        totals[e.category as InvestmentCategory] = (totals[e.category as InvestmentCategory] || 0) + Number(e.amount);
      }
    }
    return totals;
  }, [expenses]);

  const allTimeInvestmentTotal = useMemo(() => {
    return Object.values(allTimeInvestments).reduce((s, v) => s + v, 0);
  }, [allTimeInvestments]);

  // Non-investment expenses
  const spendingTotal = useMemo(() => {
    return monthExpenses
      .filter((e) => !INVESTMENT_CATEGORIES.includes(e.category as InvestmentCategory))
      .reduce((s, e) => s + Number(e.amount), 0);
  }, [monthExpenses]);

  const prevMonthTotal = useMemo(() => {
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    return getMonthExpenses(py, pm).reduce((s, e) => s + Number(e.amount), 0);
  }, [getMonthExpenses, year, month]);

  const diff = prevMonthTotal > 0 ? ((total - prevMonthTotal) / prevMonthTotal) * 100 : 0;
  const daysInMonth = getDaysInMonth(year, month);
  const dayOfMonth = year === now.getFullYear() && month === now.getMonth() ? now.getDate() : daysInMonth;
  const avgPerDay = dayOfMonth > 0 ? spendingTotal / dayOfMonth : 0;

  const monthlyBudget = useMemo(() => {
    return budgets.length > 0 ? Number(budgets[0].monthly_limit) : 0;
  }, [budgets]);

  const budgetPct = monthlyBudget > 0 ? Math.min((spendingTotal / monthlyBudget) * 100, 100) : 0;
  const remaining = monthlyBudget - spendingTotal;

  const topCategories = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of monthExpenses) {
      if (!INVESTMENT_CATEGORIES.includes(e.category as InvestmentCategory)) {
        totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
      }
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
      await onSetBudget(val);
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
            onClick={() => setShowBudgetModal(true)}
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

      {/* Investment Card */}
      <button
        onClick={() => setShowInvestmentModal(true)}
        className="rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 p-5 shadow-xl shadow-amber-500/20 text-left hover:shadow-amber-500/40 transition-shadow"
      >
        <p className="text-amber-100 text-sm font-medium flex items-center gap-1.5">
          <PiggyBank size={14} /> Investments
        </p>
        <p className="text-3xl font-bold text-white mt-1">{formatCurrency(investmentTotal)}</p>
        <p className="text-amber-200 text-xs mt-1">Invested in {formatMonthYear(year, month)}</p>
      </button>

      {/* Expenses Card (spending only, excludes investments) */}
      <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 shadow-xl shadow-emerald-500/20">
        <p className="text-emerald-100 text-sm font-medium">Total Spending</p>
        <p className="text-3xl font-bold text-white mt-1">{formatCurrency(spendingTotal)}</p>
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
            <div className="flex justify-between text-xs text-emerald-100 mt-1.5">
              <span>{budgetPct.toFixed(0)}% used</span>
              <span className={remaining >= 0 ? 'text-emerald-100' : 'text-red-200'}>
                {remaining >= 0 ? 'Left: ' : 'Over: '}
                {formatCurrency(Math.abs(remaining))}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/60 rounded-2xl p-4">
          <p className="text-slate-400 text-xs font-medium">Daily Avg</p>
          <p className="text-white font-bold text-lg mt-1">{formatCurrency(avgPerDay)}</p>
        </div>
        <div className="bg-slate-800/60 rounded-2xl p-4">
          <p className="text-slate-400 text-xs font-medium">Txns</p>
          <p className="text-white font-bold text-lg mt-1">{monthExpenses.length}</p>
        </div>
        <div className="bg-slate-800/60 rounded-2xl p-4">
          <p className="text-slate-400 text-xs font-medium">Invested</p>
          <p className="text-amber-400 font-bold text-lg mt-1">{formatCurrency(investmentTotal)}</p>
        </div>
      </div>

      {/* Top Categories (excludes investments) */}
      {topCategories.length > 0 && (
        <div className="bg-slate-800/60 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Top Spending</h3>
            <button onClick={() => onNavigate('analytics')} className="text-emerald-400 text-xs font-medium">
              View all
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {topCategories.map(([cat, amt]) => {
              const meta = EXPENSE_CATEGORIES[cat as keyof typeof EXPENSE_CATEGORIES];
              const pct = spendingTotal > 0 ? (amt / spendingTotal) * 100 : 0;
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
              const isInvestment = INVESTMENT_CATEGORIES.includes(e.category as InvestmentCategory);
              return (
                <div key={e.id} className="bg-slate-800/60 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: isInvestment ? '#f59e0b20' : meta.bg }}
                  >
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{e.description || meta.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {e.payment_source && (
                        <span className="text-slate-500 text-xs flex items-center gap-0.5">
                          {PAYMENT_SOURCES[e.payment_source]?.icon} {PAYMENT_SOURCES[e.payment_source]?.label}
                          {e.bank_account && <span className="text-slate-600">({e.bank_account})</span>}
                        </span>
                      )}
                      {isInvestment && (
                        <span className="text-amber-400 text-[9px] font-medium bg-amber-400/10 px-1.5 py-0.5 rounded">INVESTMENT</span>
                      )}
                    </div>
                  </div>
                  <span className={`font-semibold text-sm flex-shrink-0 ${isInvestment ? 'text-amber-400' : 'text-white'}`}>
                    -{formatCurrency(Number(e.amount))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Investment Details Modal */}
      {showInvestmentModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-slate-900 rounded-t-3xl w-full p-6 pb-10 max-h-[80vh] overflow-y-auto">
            <h2 className="text-white text-lg font-bold mb-4">Investment Breakdown</h2>

            <div className="mb-6 p-4 bg-amber-500/20 rounded-2xl border border-amber-500/30">
              <p className="text-amber-200 text-sm mb-1">Total Invested</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(allTimeInvestmentTotal)}</p>
            </div>

            <div className="space-y-3">
              {INVESTMENT_CATEGORIES.map((cat) => {
                const meta = INVESTMENT_CATEGORY_META[cat];
                const val = allTimeInvestments[cat] || 0;
                const pct = allTimeInvestmentTotal > 0 ? (val / allTimeInvestmentTotal) * 100 : 0;
                return (
                  <div key={cat} className="bg-slate-800/60 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{meta.icon}</span>
                        <div>
                          <p className="text-white font-semibold text-sm">{meta.label}</p>
                          <p className="text-slate-400 text-xs">{pct.toFixed(1)}% of total</p>
                        </div>
                      </div>
                      <p className="text-white font-bold text-lg">{formatCurrency(val)}</p>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: meta.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowInvestmentModal(false)}
              className="w-full mt-6 bg-slate-800 text-white rounded-xl py-3 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-slate-900 rounded-t-3xl w-full p-6 pb-10">
            <h2 className="text-white text-lg font-bold mb-4">Set Monthly Budget</h2>
            <label className="text-slate-400 text-sm mb-1 block">Monthly Expense Limit</label>
            <div className="relative mb-6">
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
