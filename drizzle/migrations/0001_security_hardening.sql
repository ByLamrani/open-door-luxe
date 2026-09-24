ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.currency_rates TO anon, authenticated;
GRANT ALL ON public.currency_rates, public.ai_insights TO service_role;
CREATE POLICY "Anyone can read currency rates" ON public.currency_rates FOR SELECT USING (true);
CREATE POLICY "Admins manage ai insights" ON public.ai_insights FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Money-moving functions must only run server-side
REVOKE EXECUTE ON FUNCTION public.wallet_pay_vendor(uuid, uuid, numeric, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.credit_wallet_from_topup(uuid, numeric, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.activate_subscription(text, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.expire_old_listings() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.process_referral_rewards(text, text[], integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.upgrade_to_seller(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.wallet_pay_vendor(uuid, uuid, numeric, text), public.credit_wallet_from_topup(uuid, numeric, uuid), public.activate_subscription(text, integer) TO service_role;