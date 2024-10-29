-- Insert basic ingredients
INSERT INTO ingredients (name, category, is_liquid, base_unit, calories, proteins, carbohydrates, fats, fiber, sodium) VALUES
-- Frutas
('Manzana', 'Frutas', false, 'g', 52, 0.3, 14, 0.2, 2.4, 0.001),
('Plátano', 'Frutas', false, 'g', 89, 1.1, 22.8, 0.3, 2.6, 0.001),
('Naranja', 'Frutas', false, 'g', 47, 0.9, 11.8, 0.1, 2.4, 0.001),
('Pera', 'Frutas', false, 'g', 57, 0.4, 15.2, 0.1, 3.1, 0.001),
('Mandarina', 'Frutas', false, 'g', 53, 0.8, 13.3, 0.3, 1.8, 0.002),
('Fresa', 'Frutas', false, 'g', 32, 0.7, 7.7, 0.3, 2.0, 0.001),
('Melocotón', 'Frutas', false, 'g', 39, 0.9, 9.5, 0.3, 1.5, 0.000),
('Uva', 'Frutas', false, 'g', 69, 0.7, 18.1, 0.2, 0.9, 0.002),
('Kiwi', 'Frutas', false, 'g', 61, 1.1, 14.7, 0.5, 3.0, 0.003),
('Piña', 'Frutas', false, 'g', 50, 0.5, 13.1, 0.1, 1.4, 0.001),
('Melón', 'Frutas', false, 'g', 34, 0.8, 8.2, 0.2, 0.9, 0.016),
('Sandía', 'Frutas', false, 'g', 30, 0.6, 7.6, 0.2, 0.4, 0.001),
('Mango', 'Frutas', false, 'g', 60, 0.8, 15.0, 0.4, 1.6, 0.001),
('Aguacate', 'Frutas', false, 'g', 160, 2.0, 8.5, 14.7, 6.7, 0.007),
('Limón', 'Frutas', false, 'g', 29, 1.1, 9.3, 0.3, 2.8, 0.002),
('Granada', 'Frutas', false, 'g', 83, 1.7, 18.7, 1.2, 4.0, 0.003),

-- Verduras
('Tomate', 'Verduras', false, 'g', 18, 0.9, 3.9, 0.2, 1.2, 0.005),
('Lechuga', 'Verduras', false, 'g', 15, 1.4, 2.9, 0.2, 1.3, 0.028),
('Zanahoria', 'Verduras', false, 'g', 41, 0.9, 9.6, 0.2, 2.8, 0.069),
('Pimiento', 'Verduras', false, 'g', 20, 0.9, 4.6, 0.2, 1.7, 0.003),
('Cebolla', 'Verduras', false, 'g', 40, 1.1, 9.3, 0.1, 1.7, 0.004),
('Pepino', 'Verduras', false, 'g', 15, 0.7, 3.6, 0.1, 0.5, 0.002),
('Calabacín', 'Verduras', false, 'g', 17, 1.2, 3.1, 0.3, 1.0, 0.003),
('Berenjena', 'Verduras', false, 'g', 25, 1.0, 5.7, 0.2, 3.0, 0.002),
('Espinacas', 'Verduras', false, 'g', 23, 2.9, 3.6, 0.4, 2.2, 0.079),
('Brócoli', 'Verduras', false, 'g', 34, 2.8, 6.6, 0.4, 2.6, 0.033),
('Coliflor', 'Verduras', false, 'g', 25, 1.9, 5.0, 0.3, 2.0, 0.030),
('Judías verdes', 'Verduras', false, 'g', 31, 1.8, 7.0, 0.2, 3.4, 0.006),
('Alcachofa', 'Verduras', false, 'g', 47, 3.3, 10.5, 0.2, 5.4, 0.094),
('Espárragos', 'Verduras', false, 'g', 20, 2.2, 3.9, 0.2, 2.1, 0.002),
('Champiñones', 'Verduras', false, 'g', 22, 3.1, 3.3, 0.3, 1.0, 0.005),
('Patata', 'Verduras', false, 'g', 77, 2.0, 17.0, 0.1, 2.2, 0.006),

-- Carnes
('Pollo', 'Carnes', false, 'g', 239, 27, 0, 14, 0, 0.082),
('Ternera', 'Carnes', false, 'g', 250, 26, 0, 17, 0, 0.072),
('Cerdo', 'Carnes', false, 'g', 242, 27, 0, 14, 0, 0.062),
('Cordero', 'Carnes', false, 'g', 294, 25, 0, 21, 0, 0.072),
('Pavo', 'Carnes', false, 'g', 189, 29, 0, 7.5, 0, 0.109),
('Conejo', 'Carnes', false, 'g', 173, 33, 0, 3.5, 0, 0.049),
('Pechuga de pollo', 'Carnes', false, 'g', 165, 31, 0, 3.6, 0, 0.074),
('Lomo de cerdo', 'Carnes', false, 'g', 242, 27, 0, 14, 0, 0.062),
('Solomillo de ternera', 'Carnes', false, 'g', 217, 26, 0, 12, 0, 0.070),

-- Pescados
('Salmón', 'Pescados', false, 'g', 208, 20, 0, 13, 0, 0.059),
('Merluza', 'Pescados', false, 'g', 71, 17, 0, 0.3, 0, 0.115),
('Atún', 'Pescados', false, 'g', 144, 23, 0, 4.9, 0, 0.043),
('Dorada', 'Pescados', false, 'g', 96, 19, 0, 2.0, 0, 0.070),
('Lubina', 'Pescados', false, 'g', 97, 18.4, 0, 2.3, 0, 0.068),
('Bacalao', 'Pescados', false, 'g', 82, 18, 0, 0.7, 0, 0.054),
('Sardinas', 'Pescados', false, 'g', 208, 24, 0, 11.5, 0, 0.505),
('Boquerón', 'Pescados', false, 'g', 131, 20.4, 0, 4.8, 0, 0.104),
('Rape', 'Pescados', false, 'g', 87, 18.7, 0, 1.5, 0, 0.090),
('Lenguado', 'Pescados', false, 'g', 83, 18.8, 0, 1.3, 0, 0.090),

-- Mariscos
('Gambas', 'Mariscos', false, 'g', 99, 21, 0.9, 1.4, 0, 0.190),
('Mejillones', 'Mariscos', false, 'g', 86, 11.9, 3.7, 2.2, 0, 0.286),
('Almejas', 'Mariscos', false, 'g', 86, 14.7, 3.6, 1.0, 0, 0.056),
('Pulpo', 'Mariscos', false, 'g', 82, 14.9, 2.2, 1.0, 0, 0.230),
('Calamares', 'Mariscos', false, 'g', 92, 15.6, 3.1, 1.4, 0, 0.044),
('Langostinos', 'Mariscos', false, 'g', 99, 21, 0.9, 1.4, 0, 0.190),

-- Lácteos
('Leche', 'Lácteos', true, 'ml', 42, 3.4, 4.8, 1.0, 0, 0.044),
('Yogur', 'Lácteos', false, 'g', 59, 3.5, 4.7, 3.3, 0, 0.046),
('Queso', 'Lácteos', false, 'g', 402, 25, 1.3, 33, 0, 0.621),
('Leche desnatada', 'Lácteos', true, 'ml', 34, 3.4, 4.8, 0.2, 0, 0.044),
('Yogur griego', 'Lácteos', false, 'g', 97, 9.0, 3.6, 5.0, 0, 0.035),
('Queso fresco', 'Lácteos', false, 'g', 98, 14, 2.5, 4.3, 0, 0.405),
('Requesón', 'Lácteos', false, 'g', 98, 11, 3.0, 4.5, 0, 0.406),
('Mozzarella', 'Lácteos', false, 'g', 280, 28, 3.1, 17, 0, 0.627),
('Queso cheddar', 'Lácteos', false, 'g', 402, 25, 1.3, 33, 0, 0.621),
('Queso parmesano', 'Lácteos', false, 'g', 431, 38, 4.1, 29, 0, 1.529),

-- Cereales
('Arroz', 'Cereales', false, 'g', 130, 2.7, 28, 0.3, 0.4, 0.001),
('Pan', 'Cereales', false, 'g', 265, 9, 49, 3.2, 2.7, 0.540),
('Pasta', 'Cereales', false, 'g', 131, 5.3, 25, 1.1, 1.8, 0.006),
('Quinoa', 'Cereales', false, 'g', 120, 4.4, 21.3, 1.9, 2.8, 0.007),
('Avena', 'Cereales', false, 'g', 389, 16.9, 66.3, 6.9, 10.6, 0.002),
('Cuscús', 'Cereales', false, 'g', 112, 3.8, 23.0, 0.2, 1.4, 0.007),
('Trigo sarraceno', 'Cereales', false, 'g', 343, 13.3, 71.5, 3.4, 10.0, 0.001),
('Mijo', 'Cereales', false, 'g', 378, 11.0, 72.8, 4.2, 8.5, 0.005),
('Pan integral', 'Cereales', false, 'g', 247, 13, 41, 2.9, 7.0, 0.540),

-- Legumbres
('Lentejas', 'Legumbres', false, 'g', 116, 9, 20, 0.4, 7.9, 0.002),
('Garbanzos', 'Legumbres', false, 'g', 364, 19, 61, 6, 17, 0.024),
('Judías', 'Legumbres', false, 'g', 333, 23.4, 60, 0.8, 15, 0.012),
('Soja', 'Legumbres', false, 'g', 446, 36.5, 30.2, 20, 9.3, 0.002),
('Habas', 'Legumbres', false, 'g', 341, 26.1, 58.3, 1.5, 25, 0.013),
('Guisantes', 'Legumbres', false, 'g', 81, 5.4, 14.5, 0.4, 5.1, 0.005),
('Alubias negras', 'Legumbres', false, 'g', 341, 21.6, 62.4, 1.4, 15.5, 0.001),
('Alubias rojas', 'Legumbres', false, 'g', 337, 22.5, 61.3, 1.1, 15.2, 0.012),

-- Frutos secos
('Almendras', 'Frutos secos', false, 'g', 579, 21.2, 21.7, 49.9, 12.5, 0.001),
('Nueces', 'Frutos secos', false, 'g', 654, 15.2, 13.7, 65.2, 6.7, 0.002),
('Pistachos', 'Frutos secos', false, 'g', 562, 20.2, 27.2, 45.4, 10.6, 0.001),
('Anacardos', 'Frutos secos', false, 'g', 553, 18.2, 30.2, 43.9, 3.3, 0.012),
('Avellanas', 'Frutos secos', false, 'g', 628, 15, 17, 61, 9.7, 0.002),
('Pipas de girasol', 'Frutos secos', false, 'g', 584, 20.8, 20, 51.5, 8.6, 0.009),
('Pipas de calabaza', 'Frutos secos', false, 'g', 559, 30.2, 10.7, 49.1, 6.0, 0.007),

-- Condimentos y especias
('Sal', 'Condimentos', false, 'g', 0, 0, 0, 0, 0, 38.758),
('Aceite de oliva', 'Condimentos', true, 'ml', 884, 0, 0, 100, 0, 0.002),
('Ajo', 'Condimentos', false, 'g', 149, 6.4, 33, 0.5, 2.1, 0.017),
('Pimienta negra', 'Especias', false, 'g', 251, 10.4, 64, 3.3, 26, 0.044),
('Orégano', 'Especias', false, 'g', 265, 9, 69, 4.3, 42.8, 0.015),
('Perejil', 'Especias', false, 'g', 36, 3, 6.3, 0.8, 3.3, 0.056),
('Albahaca', 'Especias', false, 'g', 23, 3.2, 2.7, 0.6, 1.6, 0.004),
('Tomillo', 'Especias', false, 'g', 101, 5.6, 24.5, 1.7, 14, 0.009),
('Romero', 'Especias', false, 'g', 131, 3.3, 20.7, 5.9, 14.1, 0.050),
('Curry en polvo', 'Especias', false, 'g', 325, 14.3, 58.4, 14, 53.2, 0.038),
('Pimentón', 'Especias', false, 'g', 282, 14.1, 54.2, 13, 34.9, 0.068),
('Canela', 'Especias', false, 'g', 247, 4, 81, 1.2, 53.1, 0.026),
('Jengibre', 'Especias', false, 'g', 80, 1.8, 17.8, 0.8, 2, 0.013),
('Cúrcuma', 'Especias', false, 'g', 312, 9.7, 67.1, 3.3, 22.7, 0.027),

-- Salsas y condimentos líquidos
('Vinagre', 'Condimentos', true, 'ml', 18, 0, 0.9, 0, 0, 0.020),
('Salsa de soja', 'Condimentos', true, 'ml', 53, 8.1, 4.9, 0, 0.8, 5.637),
('Mostaza', 'Condimentos', false, 'g', 66, 4.4, 6.4, 3.9, 3.3, 1.252),
('Ketchup', 'Condimentos', false, 'g', 112, 1.7, 27.3, 0.2, 0.9, 1.088),
('Mayonesa', 'Condimentos', false, 'g', 680, 1, 0.6, 74.8, 0, 0.635),
('Tabasco', 'Condimentos', true, 'ml', 70, 0.8, 4, 4, 1.3, 1.230),

-- Bebidas
('Zumo de naranja', 'Bebidas', true, 'ml', 45, 0.7, 10.4, 0.2, 0.2, 0.001),
('Zumo de manzana', 'Bebidas', true, 'ml', 46, 0.1, 11.3, 0.1, 0.2, 0.004),
('Zumo de tomate', 'Bebidas', true, 'ml', 17, 0.8, 3.5, 0.1, 0.5, 0.230),
('Café', 'Bebidas', true, 'ml', 1, 0.1, 0, 0, 0, 0.002),
('Té verde', 'Bebidas', true, 'ml', 1, 0, 0, 0, 0, 0.002),

-- Huevos y derivados
('Huevo', 'Huevos', false, 'g', 155, 12.6, 1.1, 11.3, 0, 0.144),
('Clara de huevo', 'Huevos', false, 'g', 52, 10.9, 0.7, 0.2, 0, 0.166),
('Yema de huevo', 'Huevos', false, 'g', 322, 15.9, 3.6, 26.5, 0, 0.048),

-- Dulces y endulzantes
('Miel', 'Endulzantes', false, 'g', 304, 0.3, 82.4, 0, 0.2, 0.004),
('Azúcar', 'Endulzantes', false, 'g', 387, 0, 99.8, 0, 0, 0.001),
('Sirope de arce', 'Endulzantes', true, 'ml', 260, 0, 67, 0, 0, 0.012),
('Stevia', 'Endulzantes', false, 'g', 0, 0, 0, 0, 0, 0.001),
('Chocolate negro', 'Dulces', false, 'g', 546, 7.8, 45.9, 31.3, 10.9, 0.024),
('Chocolate con leche', 'Dulces', false, 'g', 545, 7.7, 59.4, 30.9, 3.4, 0.107)

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