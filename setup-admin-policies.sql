-- Create function for admin user creation
CREATE OR REPLACE FUNCTION admin_create_user(
  user_email TEXT,
  user_password TEXT
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user json;
BEGIN
  -- Verify the calling user is an admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Create the new user
  SELECT auth.create_user(
    user_email := user_email,
    password := user_password,
    email_confirm := true
  ) INTO new_user;

  RETURN new_user;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_create_user TO authenticated;

-- Create function to get auth users
CREATE OR REPLACE FUNCTION get_auth_users()
RETURNS SETOF auth.users
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify the calling user is an admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY SELECT * FROM auth.users;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_auth_users TO authenticated;