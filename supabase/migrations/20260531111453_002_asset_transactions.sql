/*
  # Asset Transactions for RD, FD, Mutual Fund, Gold Tracking

  1. New Table
    - `asset_transactions` - Track individual contributions/deposits for assets
      - `id` (uuid, primary key)
      - `asset_id` (uuid, references assets)
      - `user_id` (uuid, references auth.users)
      - `amount` (numeric, required)
      - `date` (date, required)
      - `transaction_type` (text: deposit, withdrawal, interest, maturity, purchase)
      - `notes` (text)
      - `created_at` (timestamp)

  2. Modify asset types to include:
    - bank (Bank Account)
    - fd (Fixed Deposit)
    - rd (Recurring Deposit)
    - mutual_fund (Mutual Fund)
    - gold (Gold)
    - crypto (Crypto)
    - property (Property)
    - vehicle (Vehicle)
    - other (Other)

  3. Security
    - Enable RLS on asset_transactions
    - Policies restrict access to user's own transactions
*/

-- Asset transactions table
CREATE TABLE IF NOT EXISTS asset_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric(14,2) NOT NULL CHECK (amount >= 0),
  date date NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'interest', 'maturity', 'purchase', 'sip', 'rental_income')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asset_transactions_asset ON asset_transactions(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_transactions_user_date ON asset_transactions(user_id, date DESC);

-- Enable RLS
ALTER TABLE asset_transactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own asset transactions"
  ON asset_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own asset transactions"
  ON asset_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own asset transactions"
  ON asset_transactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own asset transactions"
  ON asset_transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
