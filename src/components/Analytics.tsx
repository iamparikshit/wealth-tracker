import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Expense, ExpenseCategory } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';
import { formatCurrency, formatMonthYear } from '../utils';

interface Props {
  getMonthExpenses: (y: number, m: number) => Expense[];
}

export function Analytics({ getMonthExpenses }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const monthExpenses = useMemo(() => getMonthExpenses(year, month), [getMonthExpenses, year, month]);
  const total = useMemo(() => monthExpenses.reduce((s, e) => s + Number(e.amount), 0), [monthExpenses]);

  const prevMonthExpenses = useMemo(() => {
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    return getMonthExpenses(py, pm);
  }, [getMonthExpenses, year, month]);

  const prevTotal = useMemo(() => prevMonthExpenses.reduce((s, e) => s + Number(e.amount), 0), [prevMonthExpenses]);

  const categoryTotals = useMemo(() => {
    const totals: Partial<Record<ExpenseCategory, number>> = {};
    for (const e of monthExpenses) {
      totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
    }
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1]) as [ExpenseCategory, number][];
  }, [monthExpenses]);

  const prevCategoryTotals = useMemo(() => {
    const totals: Partial<Record<ExpenseCategory, number>> = {};
    for (const e of prevMonthExpenses) {
      totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
    }
    return totals;
  }, [prevMonthExpenses]);

  const last6Months = useMemo(() => {
    const result: { label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      let m = month - i;
      let y = year;
      while (m < 0) { m += 12; y--; }
      const exps = getMonthExpenses(y, m);
      const t = exps.reduce((s, e) => s + Number(e.amount), 0);
      result.push({
        label: new Date(y, m, 1).toLocaleDateString('en-US', { month: 'short' }),
        total: t,
      });
    }
    return result;
  }, [getMonthExpenses, year, month]);

  const maxMonthly = Math.max(...last6Months.map((m) => m.total), 1);

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (isCurrentMonth) return;
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const diff = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0;

  return (
    <div className="flex flex-col pb-28 pt-6 px-4 gap-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-0.5">Spending insights</p>
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

      {/* Month vs Month Comparison */}
      {prevTotal > 0 && (
        <div className="bg-slate-800/60 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <ArrowRight size={14} className="text-emerald-400" /> Month Comparison
            </h3>
            <div className={`flex items-center gap-1 text-sm font-medium ${diff < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {diff < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
              {Math.abs(diff).toFixed(1)}%
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-xl p-3">
              <p className="text-slate-400 text-xs">Previous Month</p>
              <p className="text-white font-bold text-lg mt-1">{formatCurrency(prevTotal)}</p>
            </div>
            <div className="bg-emerald-500/20 rounded-xl p-3">
              <p className="text-emerald-300 text-xs">Current Month</p>
              <p className="text-white font-bold text-lg mt-1">{formatCurrency(total)}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-slate-500"
                style={{ width: prevTotal > 0 ? `${(Math.min(prevTotal, total) / Math.max(prevTotal, total)) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 6-Month Overview */}
      <div className="bg-slate-800/60 rounded-2xl p-4">
        <h3 className="text-white font-semibold text-sm mb-4">6-Month Overview</h3>
        <div className="flex items-end justify-between gap-1 h-28">
          {last6Months.map((m, i) => {
            const h = maxMonthly > 0 ? (m.total / maxMonthly) * 100 : 0;
            const isCurrent = i === 5;
            return (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full flex items-end justify-center" style={{ height: '96px' }}>
                  <div
                    className={`w-full rounded-t-md transition-all duration-700 ${isCurrent ? 'bg-emerald-500' : 'bg-slate-600'}`}
                    style={{ height: `${Math.max(h, h > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className="text-slate-500 text-[10px]">{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Pie Chart */}
      {categoryTotals.length > 0 ? (
        <div className="bg-slate-800/60 rounded-2xl p-4">
          <h3 className="text-white font-semibold text-sm mb-4">Spending by Category</h3>

          <PieChart data={categoryTotals} total={total} />

          <div className="flex flex-col gap-2 mt-4">
            {categoryTotals.map(([cat, amt]) => {
              const meta = EXPENSE_CATEGORIES[cat];
              const pct = total > 0 ? (amt / total) * 100 : 0;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="text-slate-300 text-sm flex-1">{meta.icon} {meta.label}</span>
                  <span className="text-slate-400 text-xs">{pct.toFixed(1)}%</span>
                  <span className="text-white font-semibold text-sm">{formatCurrency(amt)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-10 text-center bg-slate-800/60 rounded-2xl p-8">
          <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-3xl mb-4">📊</div>
          <p className="text-white font-semibold">No data yet</p>
          <p className="text-slate-500 text-sm mt-1">Add expenses to see analytics</p>
        </div>
      )}

      {/* Category Comparison */}
      {categoryTotals.length > 0 && Object.keys(prevCategoryTotals).length > 0 && (
        <div className="bg-slate-800/60 rounded-2xl p-4">
          <h3 className="text-white font-semibold text-sm mb-3">Category Changes</h3>
          <div className="flex flex-col gap-2">
            {categoryTotals.slice(0, 5).map(([cat, amt]) => {
              const prev = prevCategoryTotals[cat] || 0;
              const diff = prev > 0 ? ((amt - prev) / prev) * 100 : amt > 0 ? 100 : 0;
              const meta = EXPENSE_CATEGORIES[cat];
              return (
                <div key={cat} className="flex items-center gap-3 py-1.5">
                  <span className="text-base">{meta.icon}</span>
                  <span className="text-slate-300 text-sm flex-1">{meta.label}</span>
                  <span className="text-slate-500 text-xs">{formatCurrency(prev)}</span>
                  <ArrowRight size={12} className="text-slate-600" />
                  <span className="text-white text-sm font-medium">{formatCurrency(amt)}</span>
                  <span className={`text-xs font-medium w-14 text-right ${diff < 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PieChart({ data, total }: { data: [ExpenseCategory, number][]; total: number }) {
  const size = 160;
  const strokeWidth = 24;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  const chartColors = [
    '#f97316', '#22c55e', '#3b82f6', '#14b8a6', '#a855f7', '#ef4444', '#ec4899', '#eab308', '#f59e0b',
    '#10b981', '#06b6d4', '#8b5cf6', '#f43f5e', '#06b6d4', '#84cc16', '#64748b', '#d946ef', '#f97316'
  ];

  let offset = 0;
  const segments = data.slice(0, 8).map(([cat, amt], idx) => {
    const pct = total > 0 ? amt / total : 0;
    const dash = pct * circumference;
    const segment = { cat, dash, offset, color: chartColors[idx % chartColors.length] };
    offset += dash;
    return segment;
  });

  return (
    <div className="flex items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {segments.map(({ cat, dash, offset: off, color }) => (
            <circle
              key={cat}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-off}
              strokeLinecap="butt"
            />
          ))}
          <circle cx={size / 2} cy={size / 2} r={r - strokeWidth / 2 - 2} fill="#1e293b" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white font-bold text-base">{formatCurrency(total)}</span>
          <span className="text-slate-400 text-xs">total</span>
        </div>
      </div>
    </div>
  );
}
