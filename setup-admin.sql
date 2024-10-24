-- First, ensure the admin_users table exists
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing admin users
CREATE POLICY "Public users can view admin status"
ON admin_users FOR SELECT
USING (true);

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM admin_users
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert the admin user (replace with the actual user ID)
INSERT INTO admin_users (id)
SELECT id
FROM auth.users
WHERE email = 'sergio136@gmail.com'
ON CONFLICT (id) DO NOTHING;