export type ExpenseCategory =
  | 'food'
  | 'groceries'
  | 'travel'
  | 'rent'
  | 'shopping'
  | 'medical'
  | 'entertainment'
  | 'recharge'
  | 'fd'
  | 'rd'
  | 'ppf'
  | 'mf'
  | 'home_decor'
  | 'stocks'
  | 'transfer_baba'
  | 'transfer_mummy'
  | 'gold'
  | 'petrol'
  | 'house_maid'
  | 'other'
  | 'vegetables_fruit'
  | 'milk'
  | 'electricity_bill'
  | 'grooming'
  | 'automobile_service'
  | 'art_expense'
  | 'trip';

export type InvestmentCategory = 'fd' | 'rd' | 'ppf' | 'mf' | 'stocks' | 'gold';

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
  monthly_limit: number;
}

export type Tab = 'dashboard' | 'expenses' | 'add' | 'analytics' | 'calendar' | 'export';
