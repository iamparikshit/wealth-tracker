import { useState, useEffect } from 'react';
import { Tab } from './types';
import type { Expense, Asset, ExpenseCategory, AssetType, TransactionType, PaymentSource } from './types';
import { useAuth } from './hooks/useAuth';
import { useExpenses } from './hooks/useExpenses';
import { useAssets } from './hooks/useAssets';
import { Auth } from './components/Auth';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { AddExpense } from './components/AddExpense';
import { ExpenseList } from './components/ExpenseList';
import { Assets } from './components/Assets';
import { AssetDetail } from './components/AssetDetail';
import { Analytics } from './components/Analytics';
import { Calendar } from './components/Calendar';
import { Export } from './components/Export';
import { EditExpense } from './components/EditExpense';

export default function App() {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const {
    expenses,
    budgets,
    fetchExpenses,
    fetchBudgets,
    addExpense,
    updateExpense,
    deleteExpense,
    setBudget,
    getMonthExpenses,
  } = useExpenses(user?.id);
  const {
    assets,
    transactions,
    fetchAssets,
    fetchTransactions,
    addAsset,
    updateAsset,
    deleteAsset,
    addTransaction,
    deleteTransaction,
    getTotalValue,
    getAssetTransactions,
  } = useAssets(user?.id);

  const [tab, setTab] = useState<Tab>('dashboard');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchBudgets();
      fetchAssets();
      fetchTransactions();
    }
  }, [user, fetchExpenses, fetchBudgets, fetchAssets, fetchTransactions]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <Auth
        onAuth={async (email, password, isSignUp) => {
          if (isSignUp) {
            await signUp(email, password);
          } else {
            await signIn(email, password);
          }
        }}
      />
    );
  }

  async function handleAddExpense(data: { amount: number; category: ExpenseCategory; description: string; date: string; payment_source: PaymentSource; bank_account: string }) {
    await addExpense(data);
  }

  async function handleUpdateExpense(id: string, updates: { amount: number; category: ExpenseCategory; description: string; date: string; payment_source: PaymentSource; bank_account: string }) {
    await updateExpense(id, updates);
  }

  async function handleDeleteExpense(id: string) {
    await deleteExpense(id);
  }

  async function handleSetBudget(category: string, limit: number) {
    await setBudget(category as ExpenseCategory, limit);
  }

  async function handleAddAsset(data: { name: string; type: AssetType; value: number; institution?: string; notes?: string }) {
    await addAsset(data);
  }

  async function handleUpdateAsset(id: string, updates: Partial<Asset>) {
    await updateAsset(id, updates);
  }

  async function handleDeleteAsset(id: string) {
    await deleteAsset(id);
  }

  async function handleAddTransaction(data: { asset_id: string; amount: number; date: string; transaction_type: TransactionType; notes?: string }) {
    await addTransaction(data);
  }

  async function handleDeleteTransaction(id: string) {
    await deleteTransaction(id);
  }

  async function handleSignOut() {
    await signOut();
  }

  function handleSelectAsset(asset: Asset) {
    setSelectedAsset(asset);
  }

  return (
    <div className="min-h-screen bg-slate-950" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-md mx-auto relative min-h-screen">
        <main className="overflow-y-auto -webkit-overflow-scrolling-touch">
          {tab === 'dashboard' && (
            <Dashboard
              expenses={expenses}
              budgets={budgets}
              onSetBudget={handleSetBudget}
              onNavigate={setTab}
              getMonthExpenses={getMonthExpenses}
              totalAssets={getTotalValue()}
              onSignOut={handleSignOut}
            />
          )}
          {tab === 'add' && (
            <AddExpense onAdd={handleAddExpense} onNavigate={setTab} />
          )}
          {tab === 'expenses' && (
            <ExpenseList
              expenses={expenses}
              onDelete={handleDeleteExpense}
              onEdit={setEditingExpense}
            />
          )}
          {tab === 'assets' && !selectedAsset && (
            <Assets
              assets={assets}
              transactions={transactions}
              onAdd={handleAddAsset}
              totalValue={getTotalValue()}
              onSelectAsset={handleSelectAsset}
            />
          )}
          {tab === 'analytics' && (
            <Analytics getMonthExpenses={getMonthExpenses} />
          )}
          {tab === 'calendar' && (
            <Calendar
              getMonthExpenses={getMonthExpenses}
              onEditExpense={setEditingExpense}
            />
          )}
          {tab === 'export' && (
            <Export expenses={expenses} />
          )}
        </main>
        <BottomNav active={tab} onChange={setTab} />

        {editingExpense && (
          <EditExpense
            expense={editingExpense}
            onClose={() => setEditingExpense(null)}
            onSave={handleUpdateExpense}
            onDelete={handleDeleteExpense}
            onNavigate={setTab}
          />
        )}

        {selectedAsset && (
          <AssetDetail
            asset={selectedAsset}
            transactions={getAssetTransactions(selectedAsset.id)}
            onClose={() => setSelectedAsset(null)}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onUpdateAsset={handleUpdateAsset}
            onDeleteAsset={handleDeleteAsset}
          />
        )}
      </div>
    </div>
  );
}
