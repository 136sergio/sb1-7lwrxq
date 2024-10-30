-- Insert basic ingredients
INSERT INTO ingredients (name, category, is_liquid, base_unit, calories, proteins, carbohydrates, fats, fiber, sodium) VALUES
('Caldo Aneto Fideua', 'Caldos y sopas', true, 'ml', 16, 0.9, 1.4, 0.7, 0, 840)
ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  is_liquid = EXCLUDED.is_liquid,
  base_unit = EXCLUDED.base_unit,
  calories = EXCLUDED.calories,
  proteins = EXCLUDED.proteins,
  carbohydrates = EXCLUDED.carbohydrates,
  fats = EXCLUDED.fats,
  fiber = EXCLUDED.fiber,
  sodium = EXCLUDED.sodium;