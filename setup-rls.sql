-- Enable RLS for all tables
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Recipes policies
CREATE POLICY "Users can view their own recipes"
ON recipes FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recipes"
ON recipes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
ON recipes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
ON recipes FOR DELETE
USING (auth.uid() = user_id);

-- Weekly menus policies
CREATE POLICY "Users can view their own menus"
ON weekly_menus FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own menus"
ON weekly_menus FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own menus"
ON weekly_menus FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own menus"
ON weekly_menus FOR DELETE
USING (auth.uid() = user_id);

-- Admin users policies
CREATE POLICY "Public users can view admin status"
ON admin_users FOR SELECT
USING (true);

-- Verify policies are active
SELECT tablename, policies 
FROM pg_policies 
WHERE schemaname = 'public';