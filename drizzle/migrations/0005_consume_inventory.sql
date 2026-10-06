CREATE OR REPLACE FUNCTION public.consume_inventory(_items jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE it jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  FOR it IN SELECT * FROM jsonb_array_elements(COALESCE(_items,'[]'::jsonb)) LOOP
    UPDATE public.product_inventory
      SET quantity = GREATEST(quantity - GREATEST(COALESCE((it->>'quantity')::int,0),0), 0), updated_at = now()
      WHERE product_id = it->>'id';
  END LOOP;
END; $$;
REVOKE ALL ON FUNCTION public.consume_inventory(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.consume_inventory(jsonb) TO authenticated;