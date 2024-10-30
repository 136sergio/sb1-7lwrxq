-- Habilitar las extensiones necesarias
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Crear función IMMUTABLE para búsqueda normalizada
CREATE OR REPLACE FUNCTION normalize_search(text) 
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT lower(unaccent($1));
$$;

-- Crear índice usando la función IMMUTABLE
CREATE INDEX IF NOT EXISTS idx_ingredients_name_search 
ON ingredients (normalize_search(name) text_pattern_ops);

-- Crear índice para búsqueda por prefijo
CREATE INDEX IF NOT EXISTS idx_ingredients_name_prefix
ON ingredients (name text_pattern_ops);

-- Crear índice GiST para búsqueda por similitud
CREATE INDEX IF NOT EXISTS idx_ingredients_name_trgm
ON ingredients USING gin (name gin_trgm_ops);

-- Actualizar la configuración de búsqueda
ALTER TABLE ingredients
ADD COLUMN IF NOT EXISTS search_name text GENERATED ALWAYS AS (normalize_search(name)) STORED;