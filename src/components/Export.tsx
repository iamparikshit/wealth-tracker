import { useState } from 'react';
import { Download, FileSpreadsheet, Copy, Check, Loader2 } from 'lucide-react';
import { Expense } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';

interface Props {
  expenses: Expense[];
}

export function Export({ expenses }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  function generateCSV() {
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Payment Source', 'Bank Account'];
    const rows = expenses.map((e) => {
      const meta = EXPENSE_CATEGORIES[e.category];
      return [
        e.date,
        meta?.label || e.category,
        `"${(e.description || '').replace(/"/g, '""')}"`,
        Number(e.amount).toFixed(2),
        e.payment_source || '',
        e.bank_account || ''
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  }

  async function downloadCSV() {
    const csv = generateCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyToClipboard() {
    const csv = generateCSV();
    try {
      await navigator.clipboard.writeText(csv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  }

  async function exportToGoogleSheets() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-sheets-export`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ expenses: expenses.map((e) => ({
            date: e.date,
            category: EXPENSE_CATEGORIES[e.category]?.label || e.category,
            description: e.description,
            amount: Number(e.amount)
          })), format: 'sheets' }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Export failed');
      }

      const data = await response.json();
      await navigator.clipboard.writeText(data.csv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      window.open('https://docs.google.com/spreadsheets/create', '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col pb-28 pt-6 px-4 gap-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Export</h1>
        <p className="text-slate-400 text-sm mt-0.5">Download or export your data</p>
      </div>

      <div className="bg-slate-800/60 rounded-2xl p-5">
        <h3 className="text-white font-semibold mb-1">{expenses.length} expenses</h3>
        <p className="text-slate-400 text-sm mb-4">Ready to export</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={downloadCSV}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Download size={18} /> Download CSV
          </button>

          <button
            onClick={copyToClipboard}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>

          <button
            onClick={exportToGoogleSheets}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={18} />
            )}
            {loading ? 'Exporting...' : 'Export to Google Sheets'}
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-sm mt-3 text-center bg-red-400/10 rounded-lg py-2">{error}</p>
        )}
      </div>

      <div className="bg-slate-800/60 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">How to import to Google Sheets</h3>
        <ol className="text-slate-400 text-sm space-y-2">
          <li>1. Click "Export to Google Sheets" above</li>
          <li>2. A new Google Sheets will open</li>
          <li>3. Paste the data (Ctrl/Cmd + V) into cell A1</li>
          <li>4. Your expenses will appear formatted</li>
        </ol>
      </div>

      <div className="bg-slate-800/60 rounded-2xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Preview</h3>
        <div className="bg-slate-900 rounded-xl p-3 text-xs font-mono text-slate-300 overflow-x-auto">
          <pre>{generateCSV().slice(0, 500)}{expenses.length * 50 > 500 ? '...' : ''}</pre>
        </div>
      </div>
    </div>
  );
}
