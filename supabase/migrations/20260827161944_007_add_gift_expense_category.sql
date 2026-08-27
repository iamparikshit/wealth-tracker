-- Add 'gifts' to the allowed expense categories
ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_check;

ALTER TABLE expenses ADD CONSTRAINT expenses_category_check
  CHECK (category IN (
    'food', 'groceries', 'travel', 'rent', 'shopping', 'medical',
    'entertainment', 'recharge', 'fd', 'rd', 'ppf', 'mf',
    'home_decor', 'stocks', 'transfer_baba', 'transfer_mummy',
    'gold', 'petrol', 'house_maid', 'other', 'vegetables_fruit',
    'milk', 'electricity_bill', 'grooming', 'automobile_service',
    'art_expense', 'trip', 'gifts'
  ));
