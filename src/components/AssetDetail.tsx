import { useState } from 'react';
import { X, Plus, TrendingUp, TrendingDown, Trash2, CreditCard as Edit2 } from 'lucide-react';
import { Asset, AssetTransaction, TransactionType } from '../types';
import { ASSET_TYPES, TRANSACTION_TYPES } from '../constants';
import { formatCurrency, formatDate, todayISO } from '../utils';

interface Props {
  asset: Asset;
  transactions: AssetTransaction[];
  onClose: () => void;
  onAddTransaction: (data: { asset_id: string; amount: number; date: string; transaction_type: TransactionType; notes?: string }) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
  onUpdateAsset: (id: string, updates: Partial<Asset>) => Promise<void>;
  onDeleteAsset: (id: string) => Promise<void>;
}

export function AssetDetail({
  asset,
  transactions,
  onClose,
  onAddTransaction,
  onDeleteTransaction,
  onUpdateAsset,
  onDeleteAsset,
}: Props) {
  const meta = ASSET_TYPES[asset.type];
  const [showAddTxn, setShowAddTxn] = useState(false);
  const [showEditAsset, setShowEditAsset] = useState(false);
  const [txAmount, setTxAmount] = useState('');
  const [txDate, setTxDate] = useState(todayISO());
  const [txType, setTxType] = useState<TransactionType>('deposit');
  const [txNotes, setTxNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Edit asset state
  const [editName, setEditName] = useState(asset.name);
  const [editValue, setEditValue] = useState(String(asset.value));
  const [editInstitution, setEditInstitution] = useState(asset.institution || '');
  const [editNotes, setEditNotes] = useState(asset.notes || '');

  const totalDeposits = transactions
    .filter((t) => ['deposit', 'interest', 'maturity', 'purchase', 'sip', 'rental_income'].includes(t.transaction_type))
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalWithdrawals = transactions
    .filter((t) => t.transaction_type === 'withdrawal')
    .reduce((s, t) => s + Number(t.amount), 0);

  async function handleAddTxn(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(txAmount);
    if (isNaN(val) || val <= 0) return;
    setLoading(true);
    try {
      await onAddTransaction({
        asset_id: asset.id,
        amount: val,
        date: txDate,
        transaction_type: txType,
        notes: txNotes.trim(),
      });
      setShowAddTxn(false);
      setTxAmount('');
      setTxNotes('');
      setTxDate(todayISO());
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateAsset(e: React.FormEvent) {
    e.preventDefault();
    const val = parseFloat(editValue);
    if (!editName.trim() || isNaN(val)) return;
    setLoading(true);
    try {
      await onUpdateAsset(asset.id, {
        name: editName.trim(),
        value: val,
        institution: editInstitution.trim(),
        notes: editNotes.trim(),
      });
      setShowEditAsset(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAsset() {
    if (!confirm('Delete this asset and all its transactions?')) return;
    await onDeleteAsset(asset.id);
    onClose();
  }

  async function handleDeleteTxn(id: string) {
    if (!confirm('Delete this transaction?')) return;
    await onDeleteTransaction(id);
  }

  const groupedTxns = transactions.reduce((groups, txn) => {
    const month = txn.date.substring(0, 7);
    if (!groups[month]) groups[month] = [];
    groups[month].push(txn);
    return groups;
  }, {} as Record<string, AssetTransaction[]>);

  const sortedMonths = Object.keys(groupedTxns).sort((a, b) => b.localeCompare(a));

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col">
      <div className="bg-slate-900 w-full max-w-md mx-auto flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: meta.color + '20' }}
            >
              {meta.icon}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{asset.name}</h2>
              <p className="text-slate-400 text-sm">{meta.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 pb-32">
          {/* Value Card */}
          <div
            className="rounded-2xl p-5 mb-4"
            style={{ backgroundColor: meta.color + '20', border: `1px solid ${meta.color}40` }}
          >
            <p className="text-slate-400 text-sm">Current Value</p>
            <p className="text-3xl font-bold mt-1" style={{ color: meta.color }}>
              {formatCurrency(Number(asset.value))}
            </p>
            {asset.institution && (
              <p className="text-slate-500 text-sm mt-2">{asset.institution}</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-800/60 rounded-xl p-3">
              <div className="flex items-center gap-1 text-emerald-400 text-xs mb-1">
                <TrendingUp size={12} /> Total In
              </div>
              <p className="text-white font-bold">{formatCurrency(totalDeposits)}</p>
            </div>
            <div className="bg-slate-800/60 rounded-xl p-3">
              <div className="flex items-center gap-1 text-red-400 text-xs mb-1">
                <TrendingDown size={12} /> Total Out
              </div>
              <p className="text-white font-bold">{formatCurrency(totalWithdrawals)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowAddTxn(true)}
              className="flex-1 bg-emerald-500 text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-1"
            >
              <Plus size={16} /> Add Transaction
            </button>
            <button
              onClick={() => setShowEditAsset(true)}
              className="bg-slate-800 text-slate-300 rounded-xl px-3 hover:text-white"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={handleDeleteAsset}
              className="bg-red-500/20 text-red-400 rounded-xl px-3 hover:bg-red-500/30"
            >
              <Trash2 size={16} />
            </button>
          </div>

          {/* Transaction History */}
          <h3 className="text-white font-semibold text-sm mb-3">
            Transaction History ({transactions.length})
          </h3>

          {sortedMonths.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No transactions yet. Add your first deposit or SIP.
            </div>
          ) : (
            <div className="space-y-4">
              {sortedMonths.map((month) => {
                const txns = groupedTxns[month].sort((a, b) => b.date.localeCompare(a.date));
                const monthTotal = txns.reduce((s, t) => {
                  if (['deposit', 'interest', 'maturity', 'purchase', 'sip', 'rental_income'].includes(t.transaction_type)) {
                    return s + Number(t.amount);
                  }
                  return s - Number(t.amount);
                }, 0);

                return (
                  <div key={month}>
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                      <span>{new Date(month + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                      <span className={monthTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {monthTotal >= 0 ? '+' : ''}{formatCurrency(Math.abs(monthTotal))}
                      </span>
                    </div>
                    {txns.map((txn) => {
                      const tMeta = TRANSACTION_TYPES[txn.transaction_type];
                      return (
                        <div
                          key={txn.id}
                          className="bg-slate-800/60 rounded-lg px-3 py-2.5 mb-2 flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ backgroundColor: tMeta.color + '20', color: tMeta.color }}
                            >
                              {tMeta.icon}
                            </span>
                            <div>
                              <p className="text-white text-sm">{tMeta.label}</p>
                              <p className="text-slate-500 text-xs">{formatDate(txn.date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold text-sm ${['deposit', 'interest', 'maturity', 'purchase', 'sip', 'rental_income'].includes(txn.transaction_type) ? 'text-emerald-400' : 'text-red-400'}`}>
                              {['deposit', 'interest', 'maturity', 'purchase', 'sip', 'rental_income'].includes(txn.transaction_type) ? '+' : '-'}{formatCurrency(Number(txn.amount))}
                            </span>
                            <button
                              onClick={() => handleDeleteTxn(txn.id)}
                              className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Transaction Modal */}
        {showAddTxn && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-60">
            <div className="bg-slate-900 rounded-t-3xl w-full p-6 pb-safe">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">Add Transaction</h3>
                <button onClick={() => setShowAddTxn(false)} className="text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAddTxn} className="space-y-4">
                <div>
                  <label className="text-slate-400 text-xs font-medium uppercase mb-1 block">Type</label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value as TransactionType)}
                    className="w-full bg-slate-800 text-white rounded-xl px-4 py-3"
                  >
                    {Object.entries(TRANSACTION_TYPES).map(([key, val]) => (
                      <option key={key} value={key}>{val.icon} {val.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium uppercase mb-1 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input
                      type="number"
                      value={txAmount}
                      onChange={(e) => setTxAmount(e.target.value)}
                      className="w-full bg-slate-800 text-white rounded-xl pl-8 pr-4 py-3"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium uppercase mb-1 block">Date</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium uppercase mb-1 block">Notes (optional)</label>
                  <input
                    type="text"
                    value={txNotes}
                    onChange={(e) => setTxNotes(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl px-4 py-3"
                    placeholder="e.g., Monthly SIP"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddTxn(false)}
                    className="flex-1 bg-slate-800 text-white rounded-xl py-3 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-emerald-500 text-white rounded-xl py-3 font-medium disabled:opacity-60"
                  >
                    {loading ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Asset Modal */}
        {showEditAsset && (
          <div className="fixed inset-0 bg-black/50 flex items-end z-60">
            <div className="bg-slate-900 rounded-t-3xl w-full p-6 pb-safe">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">Edit Asset</h3>
                <button onClick={() => setShowEditAsset(false)} className="text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateAsset} className="space-y-4">
                <div>
                  <label className="text-slate-400 text-xs font-medium uppercase mb-1 block">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl px-4 py-3"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium uppercase mb-1 block">Current Value</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full bg-slate-800 text-white rounded-xl pl-8 pr-4 py-3"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium uppercase mb-1 block">Institution</label>
                  <input
                    type="text"
                    value={editInstitution}
                    onChange={(e) => setEditInstitution(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl px-4 py-3"
                    placeholder="e.g., SBI, HDFC, Zerodha"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs font-medium uppercase mb-1 block">Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 resize-none"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditAsset(false)}
                    className="flex-1 bg-slate-800 text-white rounded-xl py-3 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-emerald-500 text-white rounded-xl py-3 font-medium disabled:opacity-60"
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
