-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create recipes table if not exists
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  meal_types TEXT[] NOT NULL DEFAULT '{}',
  week_days TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create recipe_ingredients table with nutrition info if not exists
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  is_product BOOLEAN DEFAULT false,
  calories DECIMAL,
  proteins DECIMAL,
  carbohydrates DECIMAL,
  fats DECIMAL,
  fiber DECIMAL,
  sodium DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS for recipes if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'recipes' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Enable RLS for recipe_ingredients if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'recipe_ingredients' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist and create new ones
DO $$ 
BEGIN
  -- Recipes policies
  DROP POLICY IF EXISTS "Users can view their own recipes" ON recipes;
  DROP POLICY IF EXISTS "Users can create their own recipes" ON recipes;
  DROP POLICY IF EXISTS "Users can update their own recipes" ON recipes;
  DROP POLICY IF EXISTS "Users can delete their own recipes" ON recipes;

  -- Recipe ingredients policies
  DROP POLICY IF EXISTS "Users can view recipe ingredients" ON recipe_ingredients;
  DROP POLICY IF EXISTS "Users can create recipe ingredients" ON recipe_ingredients;
  DROP POLICY IF EXISTS "Users can update recipe ingredients" ON recipe_ingredients;
  DROP POLICY IF EXISTS "Users can delete recipe ingredients" ON recipe_ingredients;
END $$;

-- Create recipes policies
CREATE POLICY "Users can view their own recipes"
  ON recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Create recipe ingredients policies
CREATE POLICY "Users can view recipe ingredients"
  ON recipe_ingredients FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM recipes 
    WHERE recipes.id = recipe_ingredients.recipe_id 
    AND recipes.user_id = auth.uid()
  ));

CREATE POLICY "Users can create recipe ingredients"
  ON recipe_ingredients FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM recipes 
    WHERE recipes.id = recipe_ingredients.recipe_id 
    AND recipes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update recipe ingredients"
  ON recipe_ingredients FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM recipes 
    WHERE recipes.id = recipe_ingredients.recipe_id 
    AND recipes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete recipe ingredients"
  ON recipe_ingredients FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM recipes 
    WHERE recipes.id = recipe_ingredients.recipe_id 
    AND recipes.user_id = auth.uid()
  ));

-- Create or replace update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_recipes_updated_at ON recipes;
DROP TRIGGER IF EXISTS update_recipe_ingredients_updated_at ON recipe_ingredients;

-- Create triggers for updated_at
CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_recipe_ingredients_updated_at
    BEFORE UPDATE ON recipe_ingredients
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();