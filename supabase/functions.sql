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

  -- Insert ingredients
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
    (value->>'is_product')::BOOLEAN,
    (value->>'calories')::DECIMAL,
    (value->>'proteins')::DECIMAL,
    (value->>'carbohydrates')::DECIMAL,
    (value->>'fats')::DECIMAL,
    (value->>'fiber')::DECIMAL,
    (value->>'sodium')::DECIMAL
  FROM jsonb_array_elements(p_ingredients);

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

  -- Insert new ingredients
  IF p_ingredients IS NOT NULL THEN
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
      (value->>'is_product')::BOOLEAN,
      (value->>'calories')::DECIMAL,
      (value->>'proteins')::DECIMAL,
      (value->>'carbohydrates')::DECIMAL,
      (value->>'fats')::DECIMAL,
      (value->>'fiber')::DECIMAL,
      (value->>'sodium')::DECIMAL
    FROM jsonb_array_elements(p_ingredients);
  END IF;

  RETURN v_recipe;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;