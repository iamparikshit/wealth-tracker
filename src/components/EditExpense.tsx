import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import type { Expense, ExpenseCategory, PaymentSource, Tab } from '../types';
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

interface Props {
  expense: Expense | null;
  onClose: () => void;
  onSave: (id: string, updates: { amount: number; category: ExpenseCategory; description: string; date: string; payment_source: PaymentSource; bank_account: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onNavigate: (tab: Tab) => void;
}

const CATEGORY_GROUPS = [
  { label: 'Essentials', categories: ESSENTIAL_CATEGORIES },
  { label: 'Living', categories: LIVING_CATEGORIES },
  { label: 'Lifestyle', categories: LIFESTYLE_CATEGORIES },
  { label: 'Investments', categories: INVESTMENT_EXPENSE_CATEGORIES },
  { label: 'Transfers', categories: TRANSFER_CATEGORIES },
];

export function EditExpense({ expense, onClose, onSave, onDelete, onNavigate }: Props) {
  const [amount, setAmount] = useState(String(expense?.amount || 0));
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category || 'food');
  const [description, setDescription] = useState(expense?.description || '');
  const [date, setDate] = useState(expense?.date || '');
  const [paymentSource, setPaymentSource] = useState<PaymentSource>(expense?.payment_source || 'cash');
  const [bankAccount, setBankAccount] = useState(expense?.bank_account || '');
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBankSelect, setShowBankSelect] = useState(false);

  if (!expense) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!expense) return;
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;
    setLoading(true);
    try {
      await onSave(expense.id, {
        amount: val,
        category,
        description: description.trim(),
        date,
        payment_source: paymentSource,
        bank_account: bankAccount.trim(),
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!expense) return;
    setLoading(true);
    try {
      await onDelete(expense.id);
      onClose();
      onNavigate('expenses');
    } finally {
      setLoading(false);
    }
  }

  const requiresBank = ['upi', 'debit_card', 'net_banking'].includes(paymentSource);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end">
      <div className="bg-slate-900 rounded-t-3xl w-full p-6 pb-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-lg font-bold">Edit Expense</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 block">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-medium">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-800 text-white text-2xl font-bold rounded-2xl pl-9 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                inputMode="decimal"
                required
                min="0.01"
                step="0.01"
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
                      if (!['upi', 'debit_card', 'net_banking'].includes(src)) {
                        setBankAccount('');
                      }
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
                <div className="fixed inset-0 bg-black/50 flex items-end z-[60]">
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

          <div>
            <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-800 text-white rounded-2xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 [color-scheme:dark]"
              required
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="px-4 bg-red-500/20 text-red-400 rounded-xl py-3 font-medium hover:bg-red-500/30"
            >
              <Trash2 size={20} />
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-500 text-white rounded-xl py-3 font-medium disabled:opacity-60"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
            <div className="bg-slate-800 rounded-2xl p-6 m-4 max-w-sm w-full">
              <h3 className="text-white font-bold text-lg mb-2">Delete Expense?</h3>
              <p className="text-slate-400 text-sm mb-4">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-slate-700 text-white rounded-xl py-2.5 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white rounded-xl py-2.5 font-medium"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
