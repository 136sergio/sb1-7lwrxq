-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create admin_users table to store admin permissions
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create recipes table
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  meal_types TEXT[] NOT NULL DEFAULT '{}',
  week_days TEXT[] NOT NULL DEFAULT '{}',
  ingredients TEXT NOT NULL,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create weekly_menus table
CREATE TABLE weekly_menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  week INTEGER NOT NULL,
  meal_count INTEGER NOT NULL,
  meal_types TEXT[] NOT NULL,
  meal_plan JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS for admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Admin users policies
CREATE POLICY "Public read access to admin users" ON admin_users
  FOR SELECT USING (true);

-- Recipes RLS policies
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recipes"
  ON recipes FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create their own recipes"
  ON recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Weekly menus RLS policies
ALTER TABLE weekly_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own menus"
  ON weekly_menus FOR SELECT
  USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create their own menus"
  ON weekly_menus FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own menus"
  ON weekly_menus FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own menus"
  ON weekly_menus FOR DELETE
  USING (auth.uid() = user_id);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_weekly_menus_updated_at
    BEFORE UPDATE ON weekly_menus
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();