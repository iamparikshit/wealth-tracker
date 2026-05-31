/*
  # Add Payment Source Tracking to Expenses

  1. New Columns
    - `payment_source` (text) - Method of payment: upi, credit_card, debit_card, cash, net_banking, wallet, other
    - `bank_account` (text) - Bank/institution name: HDFC, SBI, ICICI, Axis, etc.

  2. Purpose
    - Track which payment method was used for each expense
    - Track specific bank account for debit/UPI transactions
    - Enable better financial tracking and analysis

  3. Security
    - Columns are user-owned and protected by existing RLS policies
*/

-- Add payment_source column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'payment_source'
  ) THEN
    ALTER TABLE expenses ADD COLUMN payment_source text DEFAULT 'cash';
  END IF;
END $$;

-- Add bank_account column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'bank_account'
  ) THEN
    ALTER TABLE expenses ADD COLUMN bank_account text DEFAULT '';
  END IF;
END $$;

-- Create index for filtering by payment source
CREATE INDEX IF NOT EXISTS idx_expenses_payment_source ON expenses(user_id, payment_source);
