-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS create_recipe_with_ingredients(text, text[], text[], text, uuid, jsonb);
DROP FUNCTION IF EXISTS update_recipe_with_ingredients(uuid, text, text[], text[], text, jsonb);

-- Function to create a recipe with ingredients in a transaction
CREATE OR REPLACE FUNCTION create_recipe_with_ingredients(
  p_name TEXT,
  p_meal_types TEXT[],
  p_week_days TEXT[],
  p_instructions TEXT,
  p_user_id UUID,
  p_ingredients JSONB
) RETURNS recipes AS $$
DECLARE
  v_recipe recipes;
BEGIN
  -- Verify the user has permission
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Insert recipe
  INSERT INTO recipes (
    name,
    meal_types,
    week_days,
    instructions,
    user_id
  ) VALUES (
    p_name,
    p_meal_types,
    p_week_days,
    p_instructions,
    p_user_id
  ) RETURNING * INTO v_recipe;

  -- Insert ingredients if provided
  IF p_ingredients IS NOT NULL AND jsonb_array_length(p_ingredients) > 0 THEN
    INSERT INTO recipe_ingredients (
      recipe_id,
      name,
      quantity,
      unit,
      is_product,
      calories,
      proteins,
      carbohydrates,
      fats,
      fiber,
      sodium
    )
    SELECT
      v_recipe.id,
      (value->>'name')::TEXT,
      (value->>'quantity')::DECIMAL,
      (value->>'unit')::TEXT,
      COALESCE((value->>'is_product')::BOOLEAN, false),
      NULLIF((value->>'calories')::TEXT, '')::DECIMAL,
      NULLIF((value->>'proteins')::TEXT, '')::DECIMAL,
      NULLIF((value->>'carbohydrates')::TEXT, '')::DECIMAL,
      NULLIF((value->>'fats')::TEXT, '')::DECIMAL,
      NULLIF((value->>'fiber')::TEXT, '')::DECIMAL,
      NULLIF((value->>'sodium')::TEXT, '')::DECIMAL
    FROM jsonb_array_elements(p_ingredients);
  END IF;

  RETURN v_recipe;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update a recipe with ingredients in a transaction
CREATE OR REPLACE FUNCTION update_recipe_with_ingredients(
  p_recipe_id UUID,
  p_name TEXT,
  p_meal_types TEXT[],
  p_week_days TEXT[],
  p_instructions TEXT,
  p_ingredients JSONB
) RETURNS recipes AS $$
DECLARE
  v_recipe recipes;
BEGIN
  -- Verify the user has permission
  SELECT * INTO v_recipe
  FROM recipes
  WHERE id = p_recipe_id AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recipe not found or not authorized';
  END IF;

  -- Update recipe
  UPDATE recipes SET
    name = p_name,
    meal_types = p_meal_types,
    week_days = p_week_days,
    instructions = p_instructions,
    updated_at = TIMEZONE('utc'::text, NOW())
  WHERE id = p_recipe_id
  RETURNING * INTO v_recipe;

  -- Delete existing ingredients
  DELETE FROM recipe_ingredients WHERE recipe_id = p_recipe_id;

  -- Insert new ingredients if provided
  IF p_ingredients IS NOT NULL AND jsonb_array_length(p_ingredients) > 0 THEN
    INSERT INTO recipe_ingredients (
      recipe_id,
      name,
      quantity,
      unit,
      is_product,
      calories,
      proteins,
      carbohydrates,
      fats,
      fiber,
      sodium
    )
    SELECT
      v_recipe.id,
      (value->>'name')::TEXT,
      (value->>'quantity')::DECIMAL,
      (value->>'unit')::TEXT,
      COALESCE((value->>'is_product')::BOOLEAN, false),
      NULLIF((value->>'calories')::TEXT, '')::DECIMAL,
      NULLIF((value->>'proteins')::TEXT, '')::DECIMAL,
      NULLIF((value->>'carbohydrates')::TEXT, '')::DECIMAL,
      NULLIF((value->>'fats')::TEXT, '')::DECIMAL,
      NULLIF((value->>'fiber')::TEXT, '')::DECIMAL,
      NULLIF((value->>'sodium')::TEXT, '')::DECIMAL
    FROM jsonb_array_elements(p_ingredients);
  END IF;

  RETURN v_recipe;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_recipe_with_ingredients(text, text[], text[], text, uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION update_recipe_with_ingredients(uuid, text, text[], text[], text, jsonb) TO authenticated;