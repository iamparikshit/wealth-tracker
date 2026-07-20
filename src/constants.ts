import { ExpenseCategory, AssetType, PaymentSource, InvestmentCategory } from './types';

export const INVESTMENT_CATEGORIES: InvestmentCategory[] = ['fd', 'rd', 'ppf', 'mf', 'stocks', 'gold'];

export function isInvestmentCategory(category: ExpenseCategory): category is InvestmentCategory {
  return INVESTMENT_CATEGORIES.includes(category as InvestmentCategory);
}

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; color: string; bg: string; icon: string }> = {
  food: { label: 'Food', color: '#f97316', bg: '#fff7ed', icon: '🍽️' },
  groceries: { label: 'Groceries', color: '#22c55e', bg: '#f0fdf4', icon: '🛒' },
  vegetables_fruit: { label: 'Vegetables & Fruit', color: '#16a34a', bg: '#f0fdf4', icon: '🥬' },
  milk: { label: 'Milk', color: '#e2e8f0', bg: '#f8fafc', icon: '🥛' },
  travel: { label: 'Travel', color: '#14b8a6', bg: '#f0fdfa', icon: '✈️' },
  rent: { label: 'Rent', color: '#0ea5e9', bg: '#f0f9ff', icon: '🏠' },
  shopping: { label: 'Shopping', color: '#ec4899', bg: '#fdf2f8', icon: '🛍️' },
  medical: { label: 'Medical', color: '#ef4444', bg: '#fef2f2', icon: '💊' },
  entertainment: { label: 'Entertainment', color: '#a855f7', bg: '#faf5ff', icon: '🎬' },
  recharge: { label: 'Recharge', color: '#3b82f6', bg: '#eff6ff', icon: '📱' },
  petrol: { label: 'Petrol', color: '#78716c', bg: '#fafaf9', icon: '⛽' },
  home_decor: { label: 'Home Decor', color: '#d946ef', bg: '#fdf4ff', icon: '🪴' },
  electricity_bill: { label: 'Electricity Bill', color: '#eab308', bg: '#fefce8', icon: '⚡' },
  house_maid: { label: 'House Maid', color: '#f59e0b', bg: '#fffbeb', icon: '🧹' },
  grooming: { label: 'Grooming', color: '#c084fc', bg: '#faf5ff', icon: '💇' },
  automobile_service: { label: 'Automobile Service', color: '#64748b', bg: '#f8fafc', icon: '🔧' },
  art_expense: { label: 'Art Expense', color: '#d946ef', bg: '#fdf4ff', icon: '🎨' },
  // Investment categories
  fd: { label: 'Fixed Deposit', color: '#22c55e', bg: '#f0fdf4', icon: '📜' },
  rd: { label: 'Recurring Deposit', color: '#8b5cf6', bg: '#faf5ff', icon: '📅' },
  ppf: { label: 'PPF', color: '#0ea5e9', bg: '#f0f9ff', icon: '🏛️' },
  mf: { label: 'Mutual Fund', color: '#f59e0b', bg: '#fffbeb', icon: '📈' },
  stocks: { label: 'Stocks', color: '#06b6d4', bg: '#ecfeff', icon: '📊' },
  gold: { label: 'Gold', color: '#eab308', bg: '#fefce8', icon: '🪙' },
  // Transfers
  transfer_baba: { label: 'Transfer to Baba', color: '#6366f1', bg: '#eef2ff', icon: '👨' },
  transfer_mummy: { label: 'Transfer to Mummy', color: '#db2777', bg: '#fdf2f8', icon: '👩' },
  other: { label: 'Other', color: '#94a3b8', bg: '#f8fafc', icon: '💰' },
};

export const INVESTMENT_CATEGORY_META: Record<InvestmentCategory, { label: string; color: string; icon: string }> = {
  fd: { label: 'Fixed Deposit', color: '#22c55e', icon: '📜' },
  rd: { label: 'Recurring Deposit', color: '#8b5cf6', icon: '📅' },
  ppf: { label: 'PPF', color: '#0ea5e9', icon: '🏛️' },
  mf: { label: 'Mutual Fund', color: '#f59e0b', icon: '📈' },
  stocks: { label: 'Stocks', color: '#06b6d4', icon: '📊' },
  gold: { label: 'Gold', color: '#eab308', icon: '🪙' },
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
  'DB - Shraddha',
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

// Grouped category lists for the Add Expense form
export const ESSENTIAL_CATEGORIES: ExpenseCategory[] = [
  'food', 'groceries', 'vegetables_fruit', 'milk', 'petrol', 'recharge', 'electricity_bill',
];

export const LIVING_CATEGORIES: ExpenseCategory[] = [
  'rent', 'house_maid', 'home_decor', 'shopping', 'medical', 'grooming', 'automobile_service', 'art_expense',
];

export const LIFESTYLE_CATEGORIES: ExpenseCategory[] = [
  'travel', 'entertainment',
];

export const INVESTMENT_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'fd', 'rd', 'ppf', 'mf', 'stocks', 'gold',
];

export const TRANSFER_CATEGORIES: ExpenseCategory[] = [
  'transfer_baba', 'transfer_mummy', 'other',
];

export const EXPENSE_CATEGORY_LIST: ExpenseCategory[] = [
  ...ESSENTIAL_CATEGORIES,
  ...LIVING_CATEGORIES,
  ...LIFESTYLE_CATEGORIES,
  ...INVESTMENT_EXPENSE_CATEGORIES,
  ...TRANSFER_CATEGORIES,
];

export const ASSET_TYPE_LIST: AssetType[] = [
  'bank', 'fd', 'rd', 'mutual_fund', 'gold', 'crypto', 'property', 'vehicle', 'other',
];

export const PAYMENT_SOURCE_LIST: PaymentSource[] = [
  'upi', 'credit_card', 'debit_card', 'cash', 'net_banking', 'wallet', 'cheque', 'other',
];
