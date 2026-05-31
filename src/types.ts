export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'shopping'
  | 'entertainment'
  | 'health'
  | 'utilities'
  | 'housing'
  | 'education'
  | 'travel'
  | 'other';

export type AssetType =
  | 'bank'
  | 'fd'
  | 'rd'
  | 'mutual_fund'
  | 'gold'
  | 'crypto'
  | 'property'
  | 'vehicle'
  | 'other';

export type TransactionType = 'deposit' | 'withdrawal' | 'interest' | 'maturity' | 'purchase' | 'sip' | 'rental_income';

export type PaymentSource = 'upi' | 'credit_card' | 'debit_card' | 'cash' | 'net_banking' | 'wallet' | 'cheque' | 'other';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  payment_source: PaymentSource;
  bank_account: string;
  created_at: string;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  value: number;
  institution: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface AssetTransaction {
  id: string;
  asset_id: string;
  amount: number;
  date: string;
  transaction_type: TransactionType;
  notes: string;
  created_at: string;
}

export interface Budget {
  id: string;
  category: ExpenseCategory;
  monthly_limit: number;
}

export type Tab = 'dashboard' | 'expenses' | 'add' | 'assets' | 'analytics' | 'calendar' | 'export';
