import { useState, useEffect } from 'react';
import { Tab } from './types';
import type { Expense, ExpenseCategory, PaymentSource } from './types';
import { useAuth } from './hooks/useAuth';
import { useExpenses } from './hooks/useExpenses';
import { Auth } from './components/Auth';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { AddExpense } from './components/AddExpense';
import { ExpenseList } from './components/ExpenseList';
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

  const [tab, setTab] = useState<Tab>('dashboard');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    if (user) {
      fetchExpenses();
      fetchBudgets();
    }
  }, [user, fetchExpenses, fetchBudgets]);

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

  async function handleSetBudget(limit: number) {
    await setBudget(limit);
  }

  async function handleSignOut() {
    await signOut();
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
      </div>
    </div>
  );
}
