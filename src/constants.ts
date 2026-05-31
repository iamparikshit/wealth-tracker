import { ExpenseCategory, AssetType, PaymentSource } from './types';

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; color: string; bg: string; icon: string }> = {
  food: { label: 'Food & Dining', color: '#f97316', bg: '#fff7ed', icon: '🍽️' },
  transport: { label: 'Transport', color: '#3b82f6', bg: '#eff6ff', icon: '🚌' },
  shopping: { label: 'Shopping', color: '#ec4899', bg: '#fdf2f8', icon: '🛍️' },
  entertainment: { label: 'Entertainment', color: '#a855f7', bg: '#faf5ff', icon: '🎬' },
  health: { label: 'Health', color: '#22c55e', bg: '#f0fdf4', icon: '💊' },
  utilities: { label: 'Utilities', color: '#64748b', bg: '#f8fafc', icon: '⚡' },
  housing: { label: 'Housing', color: '#0ea5e9', bg: '#f0f9ff', icon: '🏠' },
  education: { label: 'Education', color: '#f59e0b', bg: '#fffbeb', icon: '📚' },
  travel: { label: 'Travel', color: '#14b8a6', bg: '#f0fdfa', icon: '✈️' },
  other: { label: 'Other', color: '#94a3b8', bg: '#f8fafc', icon: '💰' },
};

export const ASSET_TYPES: Record<AssetType, { label: string; color: string; icon: string; description: string }> = {
  bank: { label: 'Bank Account', color: '#3b82f6', icon: '🏦', description: 'Savings, Current accounts' },
  fd: { label: 'Fixed Deposit', color: '#22c55e', icon: '📜', description: 'Fixed term deposits' },
  rd: { label: 'Recurring Deposit', color: '#8b5cf6', icon: '📅', description: 'Monthly recurring deposits' },
  mutual_fund: { label: 'Mutual Fund', color: '#f59e0b', icon: '📈', description: 'SIP & lumpsum investments' },
  gold: { label: 'Gold', color: '#eab308', icon: '🪙', description: 'Physical & digital gold' },
  crypto: { label: 'Crypto', color: '#ec4899', icon: '₿', description: 'Cryptocurrency holdings' },
  property: { label: 'Property', color: '#f97316', icon: '🏘️', description: 'Real estate investments' },
  vehicle: { label: 'Vehicle', color: '#14b8a6', icon: '🚗', description: 'Cars, bikes, etc.' },
  other: { label: 'Other', color: '#64748b', icon: '📦', description: 'Other assets' },
};

export const PAYMENT_SOURCES: Record<PaymentSource, { label: string; icon: string; color: string }> = {
  upi: { label: 'UPI', icon: '📱', color: '#3b82f6' },
  credit_card: { label: 'Credit Card', icon: '💳', color: '#8b5cf6' },
  debit_card: { label: 'Debit Card', icon: '💳', color: '#22c55e' },
  cash: { label: 'Cash', icon: '💵', color: '#eab308' },
  net_banking: { label: 'Net Banking', icon: '🏦', color: '#0ea5e9' },
  wallet: { label: 'Wallet', icon: '👛', color: '#f97316' },
  cheque: { label: 'Cheque', icon: '📝', color: '#64748b' },
  other: { label: 'Other', icon: '💰', color: '#94a3b8' },
};

export const COMMON_BANKS = [
  'HDFC Bank - Parikshit',
  'SBI - Parikshit',
  'Kotak - Parikshit',
  'SCB - Parikshit',
  'HSBC - Parikshit',
  'HDFC - Shraddha',
  'SBI - Shraddha',
  'DB - Shraddha'
];

export const TRANSACTION_TYPES: Record<string, { label: string; color: string; icon: string }> = {
  deposit: { label: 'Deposit', color: '#22c55e', icon: '↓' },
  withdrawal: { label: 'Withdrawal', color: '#ef4444', icon: '↑' },
  interest: { label: 'Interest', color: '#3b82f6', icon: '✦' },
  maturity: { label: 'Maturity', color: '#8b5cf6', icon: '★' },
  purchase: { label: 'Purchase', color: '#f59e0b', icon: '+$' },
  sip: { label: 'SIP', color: '#06b6d4', icon: '⟳' },
  rental_income: { label: 'Rental Income', color: '#10b981', icon: '🏠' },
};

export const EXPENSE_CATEGORY_LIST: ExpenseCategory[] = [
  'food', 'transport', 'shopping', 'entertainment', 'health',
  'utilities', 'housing', 'education', 'travel', 'other',
];

export const ASSET_TYPE_LIST: AssetType[] = [
  'bank', 'fd', 'rd', 'mutual_fund', 'gold', 'crypto', 'property', 'vehicle', 'other',
];

export const PAYMENT_SOURCE_LIST: PaymentSource[] = [
  'upi', 'credit_card', 'debit_card', 'cash', 'net_banking', 'wallet', 'cheque', 'other',
];
