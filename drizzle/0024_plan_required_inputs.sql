-- Add dynamic required inputs for each product plan
-- Safe to run multiple times

ALTER TABLE product_plans
ADD COLUMN IF NOT EXISTS required_inputs jsonb DEFAULT '[]'::jsonb;

-- Normalize old rows (if any null values exist)
UPDATE product_plans
SET required_inputs = '[]'::jsonb
WHERE required_inputs IS NULL;
