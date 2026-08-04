import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "lx_referral";

export interface StoredReferral {
  code: string;
  productId?: string;
}

export const getStoredReferral = (): StoredReferral | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredReferral) : null;
  } catch {
    return null;
  }
};

/**
 * Captures ?ref=CODE (and optional &refp=PRODUCT_ID) from any invite link and,
 * once the invited visitor has an account, permanently attaches them to the inviter.
 */
const ReferralCapture = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("ref");
    if (code) {
      const productId = params.get("refp") || undefined;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ code: code.toUpperCase(), productId }));
    }
  }, [location.search]);

  useEffect(() => {
    const attach = async () => {
      const stored = getStoredReferral();
      if (!user || !stored) return;

      const { data: me } = await supabase
        .from("profiles")
        .select("id, referred_by, referral_code")
        .eq("user_id", user.id)
        .maybeSingle();

      // Already attributed, or user is trying to use their own code
      if (!me || me.referred_by || me.referral_code === stored.code) return;

      const { data: inviterId } = await supabase.rpc("resolve_referral_code", { _code: stored.code });

      if (!inviterId || inviterId === user.id) return;


      await supabase
        .from("profiles")
        .update({ referred_by: inviterId as string, referred_product_id: stored.productId ?? null })
        .eq("user_id", user.id);
    };
    attach();
  }, [user]);

  return null;
};

export default ReferralCapture;
