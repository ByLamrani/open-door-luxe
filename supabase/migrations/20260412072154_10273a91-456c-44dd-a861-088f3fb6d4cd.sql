
-- Enable pgvector in extensions schema
CREATE EXTENSION IF NOT EXISTS vector SCHEMA extensions;

-- Create similarity search function
CREATE OR REPLACE FUNCTION public.match_products(query_embedding vector(768), match_threshold float DEFAULT 0.5, match_count int DEFAULT 5)
RETURNS TABLE (product_id text, product_name text, content_text text, similarity float)
LANGUAGE plpgsql STABLE
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pe.product_id,
    pe.product_name,
    pe.content_text,
    (1 - (pe.embedding <=> query_embedding))::float as similarity
  FROM product_embeddings pe
  WHERE (1 - (pe.embedding <=> query_embedding))::float > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
