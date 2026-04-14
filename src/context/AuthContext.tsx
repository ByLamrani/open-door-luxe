import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: { full_name?: string; phone?: string; home_address?: string; city?: string; country?: string; account_type?: string; business_name?: string; company_name?: string; country_of_origin?: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Extract social login profile data on sign-in
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
          const user = session.user;
          const meta = user.user_metadata;
          if (meta && (meta.full_name || meta.name || meta.avatar_url || meta.picture)) {
            // Update profile with social login data (defer to avoid deadlock)
            setTimeout(async () => {
              try {
                const { data: existingProfile } = await supabase
                  .from("profiles")
                  .select("full_name, avatar_url, phone")
                  .eq("user_id", user.id)
                  .single();

                if (existingProfile) {
                  const updates: Record<string, string> = {};
                  const socialName = meta.full_name || meta.name || '';
                  const socialAvatar = meta.avatar_url || meta.picture || '';

                  // Only update if fields are empty
                  if (!existingProfile.full_name && socialName) updates.full_name = socialName;
                  if (!existingProfile.avatar_url && socialAvatar) updates.avatar_url = socialAvatar;

                  if (Object.keys(updates).length > 0) {
                    await supabase
                      .from("profiles")
                      .update(updates)
                      .eq("user_id", user.id);
                  }
                }
              } catch (err) {
                console.error("Failed to sync social profile:", err);
              }
            }, 0);
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { full_name?: string; phone?: string; home_address?: string; city?: string; country?: string; account_type?: string; business_name?: string; company_name?: string; country_of_origin?: string }
  ) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
