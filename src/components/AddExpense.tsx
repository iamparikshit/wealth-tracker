import { useState } from 'react';
import { X, Loader } from 'lucide-react';
import type { ExpenseCategory, PaymentSource, Tab } from '../types';
import {
  EXPENSE_CATEGORIES,
  PAYMENT_SOURCES,
  PAYMENT_SOURCE_LIST,
  COMMON_BANKS,
  ESSENTIAL_CATEGORIES,
  LIVING_CATEGORIES,
  LIFESTYLE_CATEGORIES,
  INVESTMENT_EXPENSE_CATEGORIES,
  TRANSFER_CATEGORIES,
} from '../constants';
import { todayISO } from '../utils';

interface Props {
  onAdd: (data: { amount: number; category: ExpenseCategory; description: string; date: string; payment_source: PaymentSource; bank_account: string }) => Promise<void>;
  onNavigate: (tab: Tab) => void;
}

const CATEGORY_GROUPS = [
  { label: 'Essentials', categories: ESSENTIAL_CATEGORIES },
  { label: 'Living', categories: LIVING_CATEGORIES },
  { label: 'Lifestyle', categories: LIFESTYLE_CATEGORIES },
  { label: 'Investments', categories: INVESTMENT_EXPENSE_CATEGORIES },
  { label: 'Transfers', categories: TRANSFER_CATEGORIES },
];

export function AddExpense({ onAdd, onNavigate }: Props) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayISO());
  const [paymentSource, setPaymentSource] = useState<PaymentSource>('cash');
  const [bankAccount, setBankAccount] = useState('');
  const [showBankSelect, setShowBankSelect] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    setLoading(true);
    try {
      await onAdd({
        amount: val,
        category,
        description: description.trim(),
        date,
        payment_source: paymentSource,
        bank_account: bankAccount.trim(),
      });
      setAmount('');
      setDescription('');
      setPaymentSource('cash');
      setBankAccount('');
      onNavigate('expenses');
    } finally {
      setLoading(false);
    }
  }

  const requiresBank = true;

  return (
    <div className="flex flex-col pb-28 pt-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Add Expense</h1>
        <p className="text-slate-400 text-sm mt-0.5">Track your spending</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Amount */}
        <div>
          <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3 block">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-medium">₹</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-800 text-white text-2xl font-bold rounded-2xl pl-9 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="0"
              inputMode="decimal"
              required
              min="0.01"
              step="0.01"
              autoFocus
            />
          </div>
        </div>

        {/* Category Groups */}
        <div>
          <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3 block">Category</label>
          <div className="flex flex-col gap-4">
            {CATEGORY_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-widest mb-2">{group.label}</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {group.categories.map((cat) => {
                    const meta = EXPENSE_CATEGORIES[cat];
                    const isSelected = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`flex flex-col items-center gap-0.5 py-2 rounded-xl border-2 transition-all duration-150 ${
                          isSelected ? 'border-emerald-500 bg-emerald-500/10' : 'border-transparent bg-slate-800'
                        }`}
                      >
                        <span className="text-lg">{meta.icon}</span>
                        <span className={`text-[9px] font-medium leading-tight text-center px-0.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {meta.label.length > 10 ? meta.label.split(' ')[0] : meta.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 block">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-800 text-white rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="What did you spend on?"
          />
        </div>

        {/* Payment Source */}
        <div>
          <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3 block">Payment Method</label>
          <div className="grid grid-cols-4 gap-1.5">
            {PAYMENT_SOURCE_LIST.slice(0, 8).map((src) => {
              const meta = PAYMENT_SOURCES[src];
              const isSelected = paymentSource === src;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => {
                    setPaymentSource(src);
                  }}
                  className={`flex flex-col items-center gap-0.5 py-2 rounded-xl border-2 transition-all duration-150 ${
                    isSelected ? 'border-emerald-500 bg-emerald-500/10' : 'border-transparent bg-slate-800'
                  }`}
                >
                  <span className="text-lg">{meta.icon}</span>
                  <span className={`text-[9px] font-medium leading-tight text-center ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bank Account */}
        {requiresBank && (
          <div>
            <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 block">
              Bank / Account
            </label>
            <button
              type="button"
              onClick={() => setShowBankSelect(true)}
              className="w-full bg-slate-800 text-white rounded-xl px-4 py-3.5 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {bankAccount || 'Select bank...'}
            </button>

            {showBankSelect && (
              <div className="fixed inset-0 bg-black/50 flex items-end z-50">
                <div className="bg-slate-900 rounded-t-3xl w-full p-6 max-h-[70vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg">Select Bank</h3>
                    <button onClick={() => setShowBankSelect(false)} className="text-slate-400">
                      <X size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {COMMON_BANKS.map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => {
                          setBankAccount(bank);
                          setShowBankSelect(false);
                        }}
                        className={`px-3 py-2.5 rounded-xl text-sm text-left transition-all ${
                          bankAccount === bank
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Date Picker */}
        <div>
          <label className="text-slate-400 text-sm mb-1 block">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-slate-500 text-xs mt-1">
            {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !amount}
          className="bg-emerald-500 text-white rounded-2xl py-4 font-semibold text-lg disabled:opacity-60 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
        >
          {loading && <Loader size={20} className="animate-spin" />}
          {loading ? 'Adding...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
}
