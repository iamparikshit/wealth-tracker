import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Expense, ExpenseCategory, PaymentSource, Budget } from '../types';

export function useExpenses(userId: string | undefined) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      setExpenses(data || []);
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchBudgets = useCallback(async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*');
      if (error) throw error;
      setBudgets(data || []);
    } catch (err) {
      console.error('Error fetching budgets:', err);
    }
  }, [userId]);

  const addExpense = useCallback(async (expense: {
    amount: number;
    category: ExpenseCategory;
    description: string;
    date: string;
    payment_source?: PaymentSource;
    bank_account?: string;
  }) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert([{
        ...expense,
        user_id: userId,
        payment_source: expense.payment_source || 'cash',
        bank_account: expense.bank_account || '',
      }])
      .select()
      .single();
    if (error) throw error;
    setExpenses((prev) => [data, ...prev]);
    return data;
  }, [userId]);

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setExpenses((prev) => prev.map((e) => (e.id === id ? data : e)));
    return data;
  }, []);

  const deleteExpense = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const setBudget = useCallback(async (monthlyLimit: number) => {
    const existing = budgets.length > 0 ? budgets[0] : null;
    if (existing) {
      const { data, error } = await supabase
        .from('budgets')
        .update({ monthly_limit: monthlyLimit })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      setBudgets([data]);
    } else {
      const { data, error } = await supabase
        .from('budgets')
        .insert([{ user_id: userId, monthly_limit: monthlyLimit }])
        .select()
        .single();
      if (error) throw error;
      setBudgets([data]);
    }
  }, [userId, budgets]);

  const getMonthExpenses = useCallback((year: number, month: number) => {
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endMonth = month === 11 ? 0 : month + 1;
    const endYear = month === 11 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth + 1).padStart(2, '0')}-01`;
    return expenses.filter((e) => e.date >= startDate && e.date < endDate);
  }, [expenses]);

  const getCategoryTotals = useCallback((exps: Expense[]) => {
    const totals: Partial<Record<ExpenseCategory, number>> = {};
    for (const e of exps) {
      totals[e.category] = (totals[e.category] || 0) + Number(e.amount);
    }
    return totals;
  }, []);

  const getPaymentSourceTotals = useCallback((exps: Expense[]) => {
    const totals: Partial<Record<PaymentSource, number>> = {};
    for (const e of exps) {
      totals[e.payment_source] = (totals[e.payment_source] || 0) + Number(e.amount);
    }
    return totals;
  }, []);

  return {
    expenses,
    budgets,
    loading,
    fetchExpenses,
    fetchBudgets,
    addExpense,
    updateExpense,
    deleteExpense,
    setBudget,
    getMonthExpenses,
    getCategoryTotals,
    getPaymentSourceTotals,
  };
}
