/*
  # Change budget system from category-wise to monthly budget

  1. Changes
    - Modify `budgets` table to remove category column
    - Add unique constraint on (user_id) to ensure only one budget per user
    - This simplifies budget tracking to a single monthly expense limit
  
  2. Data Migration
    - Delete existing category-specific budgets (they will be replaced by single monthly budget)
  
  3. Security
    - Existing RLS policies remain intact
*/

DELETE FROM budgets;

ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_category_check;
ALTER TABLE budgets DROP COLUMN IF EXISTS category;

ALTER TABLE budgets ADD CONSTRAINT budgets_user_id_unique UNIQUE(user_id);
