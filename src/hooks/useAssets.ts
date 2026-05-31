import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Asset, AssetType, AssetTransaction, TransactionType } from '../types';

export function useAssets(userId: string | undefined) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [transactions, setTransactions] = useState<AssetTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAssets = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAssets(data || []);
    } catch (err) {
      console.error('Error fetching assets:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchTransactions = useCallback(async (assetId?: string) => {
    if (!userId) return;
    try {
      let query = supabase
        .from('asset_transactions')
        .select('*')
        .order('date', { ascending: false });
      if (assetId) {
        query = query.eq('asset_id', assetId);
      }
      const { data, error } = await query;
      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  }, [userId]);

  const addAsset = useCallback(async (asset: { name: string; type: AssetType; value: number; institution?: string; notes?: string }) => {
    const { data, error } = await supabase
      .from('assets')
      .insert([{ ...asset, user_id: userId, institution: asset.institution || '', notes: asset.notes || '' }])
      .select()
      .single();
    if (error) throw error;
    setAssets((prev) => [data, ...prev]);
    return data;
  }, [userId]);

  const updateAsset = useCallback(async (id: string, updates: Partial<Asset>) => {
    const { data, error } = await supabase
      .from('assets')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    setAssets((prev) => prev.map((a) => (a.id === id ? data : a)));
    return data;
  }, []);

  const deleteAsset = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('assets')
      .delete()
      .eq('id', id);
    if (error) throw error;
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setTransactions((prev) => prev.filter((t) => t.asset_id !== id));
  }, []);

  const addTransaction = useCallback(async (transaction: {
    asset_id: string;
    amount: number;
    date: string;
    transaction_type: TransactionType;
    notes?: string;
  }) => {
    const { data, error } = await supabase
      .from('asset_transactions')
      .insert([{ ...transaction, user_id: userId, notes: transaction.notes || '' }])
      .select()
      .single();
    if (error) throw error;
    setTransactions((prev) => [data, ...prev]);

    // Update asset value based on transaction type
    const asset = assets.find((a) => a.id === transaction.asset_id);
    if (asset) {
      let newValue = Number(asset.value);
      if (['deposit', 'interest', 'maturity', 'purchase', 'sip', 'rental_income'].includes(transaction.transaction_type)) {
        newValue += transaction.amount;
      } else if (transaction.transaction_type === 'withdrawal') {
        newValue = Math.max(0, newValue - transaction.amount);
      }
      await updateAsset(transaction.asset_id, { value: newValue });
    }
    return data;
  }, [userId, assets, updateAsset]);

  const deleteTransaction = useCallback(async (id: string) => {
    const transaction = transactions.find((t) => t.id === id);
    if (!transaction) return;

    const { error } = await supabase
      .from('asset_transactions')
      .delete()
      .eq('id', id);
    if (error) throw error;

    setTransactions((prev) => prev.filter((t) => t.id !== id));

    // Reverse the effect on asset value
    const asset = assets.find((a) => a.id === transaction.asset_id);
    if (asset) {
      let newValue = Number(asset.value);
      if (['deposit', 'interest', 'maturity', 'purchase', 'sip', 'rental_income'].includes(transaction.transaction_type)) {
        newValue = Math.max(0, newValue - transaction.amount);
      } else if (transaction.transaction_type === 'withdrawal') {
        newValue += transaction.amount;
      }
      await updateAsset(transaction.asset_id, { value: newValue });
    }
  }, [transactions, assets, updateAsset]);

  const getTotalValue = useCallback(() => {
    return assets.reduce((sum, a) => sum + Number(a.value), 0);
  }, [assets]);

  const getValuesByType = useCallback(() => {
    const totals: Partial<Record<AssetType, number>> = {};
    for (const a of assets) {
      totals[a.type] = (totals[a.type] || 0) + Number(a.value);
    }
    return totals;
  }, [assets]);

  const getAssetTransactions = useCallback((assetId: string) => {
    return transactions.filter((t) => t.asset_id === assetId);
  }, [transactions]);

  return {
    assets,
    transactions,
    loading,
    fetchAssets,
    fetchTransactions,
    addAsset,
    updateAsset,
    deleteAsset,
    addTransaction,
    deleteTransaction,
    getTotalValue,
    getValuesByType,
    getAssetTransactions,
  };
}
