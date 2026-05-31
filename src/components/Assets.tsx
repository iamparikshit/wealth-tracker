import { useState } from 'react';
import { Plus, TrendingUp, X, ChevronRight } from 'lucide-react';
import { Asset, AssetType, AssetTransaction } from '../types';
import { ASSET_TYPES, ASSET_TYPE_LIST } from '../constants';
import { formatCurrency } from '../utils';

interface Props {
  assets: Asset[];
  transactions: AssetTransaction[];
  onAdd: (asset: { name: string; type: AssetType; value: number; institution?: string; notes?: string }) => Promise<void>;
  totalValue: number;
  onSelectAsset: (asset: Asset) => void;
}

export function Assets({
  assets,
  transactions,
  onAdd,
  totalValue,
  onSelectAsset,
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<AssetType>('bank');
  const [value, setValue] = useState('');
  const [institution, setInstitution] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setName('');
    setType('bank');
    setValue('');
    setInstitution('');
    setNotes('');
  }

  function openAdd() {
    resetForm();
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numValue = parseFloat(value);
    if (!name.trim() || isNaN(numValue)) return;
    setLoading(true);
    try {
      await onAdd({ name: name.trim(), type, value: numValue, institution, notes });
      setShowModal(false);
      resetForm();
    } finally {
      setLoading(false);
    }
  }

  const groupedByType = ASSET_TYPE_LIST.map((t) => ({
    type: t,
    meta: ASSET_TYPES[t],
    items: assets.filter((a) => a.type === t),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col pb-28 pt-6 px-4 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Assets</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track your wealth</p>
        </div>
        <button
          onClick={openAdd}
          className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Total Card */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-600 p-5 shadow-xl shadow-blue-500/20">
        <p className="text-blue-100 text-sm font-medium flex items-center gap-1.5">
          <TrendingUp size={14} /> Net Worth
        </p>
        <p className="text-3xl font-bold text-white mt-1">{formatCurrency(totalValue)}</p>
        <div className="flex justify-between mt-3">
          <p className="text-blue-200 text-xs">{assets.length} assets</p>
          <p className="text-blue-200 text-xs">{groupedByType.length} categories</p>
        </div>
      </div>

      {/* Breakdown by Type */}
      {groupedByType.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-10 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-3xl mb-4">🏦</div>
          <p className="text-white font-semibold">No assets yet</p>
          <p className="text-slate-500 text-sm mt-1">Add your bank accounts, FDs, RDs, Mutual Funds, and Gold</p>
        </div>
      ) : (
        groupedByType.map(({ type: t, meta, items }) => {
          const typeTotal = items.reduce((s, a) => s + Number(a.value), 0);
          const typePercentage = totalValue > 0 ? (typeTotal / totalValue) * 100 : 0;

          return (
            <div key={t} className="bg-slate-800/60 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meta.icon}</span>
                  <div>
                    <span className="text-white font-semibold">{meta.label}</span>
                    <p className="text-slate-500 text-xs">{meta.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-white font-semibold">{formatCurrency(typeTotal)}</span>
                  <p className="text-slate-500 text-xs">{typePercentage.toFixed(1)}%</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-slate-700 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${typePercentage}%`, backgroundColor: meta.color }}
                />
              </div>

              <div className="flex flex-col gap-2">
                {items.map((asset) => {
                  const assetTxns = transactions.filter((t) => t.asset_id === asset.id);
                  const lastTxn = assetTxns[0];
                  return (
                    <button
                      key={asset.id}
                      onClick={() => onSelectAsset(asset)}
                      className="bg-slate-700/50 rounded-xl px-3 py-3 flex items-center justify-between hover:bg-slate-700 transition-colors w-full text-left group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{asset.name}</p>
                        <p className="text-slate-500 text-xs truncate">
                          {asset.institution || meta.label}
                          {lastTxn && ` • Last: ${formatCurrency(Number(lastTxn.amount))}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">{formatCurrency(Number(asset.value))}</span>
                        <ChevronRight size={16} className="text-slate-500 group-hover:text-slate-400" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      {/* Quick Stats */}
      {groupedByType.length > 0 && (
        <div className="bg-slate-800/60 rounded-2xl p-4">
          <h3 className="text-white font-semibold text-sm mb-3">Portfolio Summary</h3>
          <div className="grid grid-cols-2 gap-3">
            {groupedByType.slice(0, 4).map(({ type: t, meta, items }) => {
              const typeTotal = items.reduce((s, a) => s + Number(a.value), 0);
              const pct = totalValue > 0 ? (typeTotal / totalValue) * 100 : 0;
              return (
                <div key={t} className="bg-slate-700/50 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs">{meta.icon}</span>
                    <span className="text-slate-400 text-xs">{meta.label}</span>
                  </div>
                  <p className="text-white font-semibold text-sm">{formatCurrency(typeTotal)}</p>
                  <p className="text-slate-500 text-xs">{pct.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end">
          <div className="bg-slate-900 rounded-t-3xl w-full p-6 pb-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-bold">Add Asset</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1.5 block">Asset Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., HDFC Savings, SBI FD, Axis Mutual Fund"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1.5 block">Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AssetType)}
                  className="w-full bg-slate-800 text-white rounded-xl px-4 py-3"
                >
                  {ASSET_TYPE_LIST.map((t) => (
                    <option key={t} value={t}>
                      {ASSET_TYPES[t].icon} {ASSET_TYPES[t].label} - {ASSET_TYPES[t].description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1.5 block">Current Value</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                    inputMode="decimal"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 block">
                  Institution <span className="text-slate-600 normal-case">(optional)</span>
                </label>
                <input
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., SBI, HDFC, Zerodha, Groww"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 block">
                  Notes <span className="text-slate-600 normal-case">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                  placeholder="e.g., 5 year FD at 7%, SIP of 5000/month"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 text-white rounded-xl py-3 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-500 text-white rounded-xl py-3 font-medium disabled:opacity-60"
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
