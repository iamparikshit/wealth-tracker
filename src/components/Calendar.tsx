import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Expense } from '../types';
import { PAYMENT_SOURCES, isInvestmentCategory } from '../constants';
import { formatCurrency, getDaysInMonth, formatMonthYear } from '../utils';

interface Props {
  getMonthExpenses: (y: number, m: number) => Expense[];
  onEditExpense: (expense: Expense) => void;
}

export function Calendar({ getMonthExpenses, onEditExpense }: Props) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthExpenses = useMemo(
    () => getMonthExpenses(year, month).filter((e) => !isInvestmentCategory(e.category)),
    [getMonthExpenses, year, month]
  );

  const dailyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of monthExpenses) {
      totals[e.date] = (totals[e.date] || 0) + Number(e.amount);
    }
    return totals;
  }, [monthExpenses]);

  const maxDaily = useMemo(() => Math.max(...Object.values(dailyTotals), 1), [dailyTotals]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = getDaysInMonth(year, month);
    const days: { date: string; day: number; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevDays = getDaysInMonth(prevYear, prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDays - i;
      days.push({
        date: `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        day: d,
        isCurrentMonth: false
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        day: d,
        isCurrentMonth: true
      });
    }

    // Next month padding
    const remaining = 42 - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        day: d,
        isCurrentMonth: false
      });
    }

    return days;
  }, [year, month]);

  const selectedExpenses = useMemo(() => {
    if (!selectedDate) return [];
    return monthExpenses.filter((e) => e.date === selectedDate);
  }, [monthExpenses, selectedDate]);

  const selectedTotal = useMemo(() => {
    return selectedExpenses.reduce((s, e) => s + Number(e.amount), 0);
  }, [selectedExpenses]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelectedDate(null);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelectedDate(null);
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    <div className="flex flex-col pb-28 pt-6 px-4 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Calendar</h1>
        <p className="text-slate-400 text-sm mt-0.5">View daily expenses</p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-slate-800/60 rounded-2xl px-4 py-3">
        <button onClick={prevMonth} className="text-slate-400 hover:text-white transition-colors p-1">
          <ChevronLeft size={18} />
        </button>
        <span className="text-white font-semibold">{formatMonthYear(year, month)}</span>
        <button
          onClick={nextMonth}
          className={`transition-colors p-1 ${year === now.getFullYear() && month === now.getMonth() ? 'text-slate-700 cursor-not-allowed' : 'text-slate-400 hover:text-white'}`}
          disabled={year === now.getFullYear() && month === now.getMonth()}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-slate-800/60 rounded-2xl p-3">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-slate-500 text-xs font-medium py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(({ date, day, isCurrentMonth }) => {
            const total = dailyTotals[date] || 0;
            const hasExpense = total > 0;
            const isSelected = selectedDate === date;
            const isToday = date === today;
            const intensity = hasExpense ? Math.min(total / maxDaily, 1) : 0;

            return (
              <button
                key={date}
                onClick={() => setSelectedDate(isSelected ? null : date)}
                disabled={!isCurrentMonth}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all ${
                  !isCurrentMonth
                    ? 'text-slate-700'
                    : isSelected
                    ? 'bg-emerald-500 text-white'
                    : isToday
                    ? 'bg-slate-700 text-white ring-2 ring-emerald-500'
                    : hasExpense
                    ? 'text-white hover:bg-slate-700'
                    : 'text-slate-400 hover:bg-slate-700'
                }`}
              >
                {hasExpense && !isSelected && (
                  <div
                    className="absolute inset-0 rounded-lg opacity-30"
                    style={{
                      backgroundColor: '#22c55e',
                      opacity: 0.2 + intensity * 0.4,
                    }}
                  />
                )}
                <span className="text-xs font-medium relative z-10">{day}</span>
                {hasExpense && (
                  <span className={`text-[9px] font-semibold relative z-10 ${isSelected ? 'text-white' : 'text-emerald-400'}`}>
                    {formatCurrency(total).replace('₹', '')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && (
        <div className="bg-slate-800/60 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white font-semibold">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
              </h3>
              <p className="text-slate-400 text-sm">{formatCurrency(selectedTotal)} spent</p>
            </div>
            <span className="text-emerald-400 text-sm font-medium">{selectedExpenses.length} txn</span>
          </div>

          {selectedExpenses.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">No expenses on this day</p>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedExpenses.map((e) => (
                <div
                  key={e.id}
                  onClick={() => onEditExpense(e)}
                  className="bg-slate-700/50 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm truncate">{e.description || 'Expense'}</span>
                    <span className="text-white font-semibold text-sm">{formatCurrency(Number(e.amount))}</span>
                  </div>
                  {e.payment_source && (
                    <div className="flex items-center gap-1 mt-1 text-slate-500 text-xs">
                      {PAYMENT_SOURCES[e.payment_source]?.icon} {PAYMENT_SOURCES[e.payment_source]?.label}
                      {e.bank_account && <span className="text-slate-600">({e.bank_account})</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Monthly Summary */}
      <div className="bg-slate-800/60 rounded-2xl p-4">
        <h3 className="text-white font-semibold text-sm mb-3">Monthly Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-700/50 rounded-xl p-3 text-center">
            <p className="text-slate-400 text-xs">Total Expenses</p>
            <p className="text-white font-bold text-sm mt-1">
              {formatCurrency(monthExpenses.reduce((s, e) => s + Number(e.amount), 0))}
            </p>
          </div>
          <div className="bg-slate-700/50 rounded-xl p-3 text-center">
            <p className="text-slate-400 text-xs">Avg / Day</p>
            <p className="text-white font-bold text-sm mt-1">
              {formatCurrency(monthExpenses.reduce((s, e) => s + Number(e.amount), 0) / getDaysInMonth(year, month))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
