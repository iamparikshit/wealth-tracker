/*
  # Update Expense Categories

  1. Changes
    - Migrate existing 'transport' category to 'other' (since transport is not in new list)
    - Drop existing check constraint on expenses.category
    - Add new check constraint with expanded category list

  2. New Categories (26 total)
    food, groceries, travel, rent, shopping, medical, entertainment,
    recharge, fd, rd, ppf, mf, home_decor, stocks, transfer_baba,
    transfer_mummy, gold, petrol, house_maid, other, vegetables_fruit,
    milk, electricity_bill, grooming, automobile_service

  3. Investment Categories
    fd, rd, ppf, mf, stocks, gold - shown in investment card on dashboard
*/

-- Migrate old categories to new ones
UPDATE expenses SET category = 'other' WHERE category NOT IN (
  'food', 'groceries', 'travel', 'rent', 'shopping', 'medical',
  'entertainment', 'recharge', 'fd', 'rd', 'ppf', 'mf',
  'home_decor', 'stocks', 'transfer_baba', 'transfer_mummy',
  'gold', 'petrol', 'house_maid', 'other', 'vegetables_fruit',
  'milk', 'electricity_bill', 'grooming', 'automobile_service'
);

-- Drop old constraint and add new one
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_check;

ALTER TABLE expenses ADD CONSTRAINT expenses_category_check
  CHECK (category IN (
    'food', 'groceries', 'travel', 'rent', 'shopping', 'medical',
    'entertainment', 'recharge', 'fd', 'rd', 'ppf', 'mf',
    'home_decor', 'stocks', 'transfer_baba', 'transfer_mummy',
    'gold', 'petrol', 'house_maid', 'other', 'vegetables_fruit',
    'milk', 'electricity_bill', 'grooming', 'automobile_service'
  ));

-- Also update budgets table if it has a similar constraint
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_category_check;

ALTER TABLE budgets ADD CONSTRAINT budgets_category_check
  CHECK (category IN (
    'food', 'groceries', 'travel', 'rent', 'shopping', 'medical',
    'entertainment', 'recharge', 'fd', 'rd', 'ppf', 'mf',
    'home_decor', 'stocks', 'transfer_baba', 'transfer_mummy',
    'gold', 'petrol', 'house_maid', 'other', 'vegetables_fruit',
    'milk', 'electricity_bill', 'grooming', 'automobile_service'
  ));
