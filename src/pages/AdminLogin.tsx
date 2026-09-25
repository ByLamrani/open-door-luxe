import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroImg from "@/assets/admin-login.jpg";
import logo from "@/assets/lamralux-mark.png";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) {
      setBusy(false);
      setError("Identifiant ou mot de passe incorrect.");
      return;
    }
    const { data: ok } = await supabase.rpc("has_role", { _user_id: data.user.id, _role: "admin" });
    setBusy(false);
    if (ok !== true) {
      await supabase.auth.signOut();
      setError("Ce compte n'a pas accès au Backoffice.");
      return;
    }
    navigate(window.location.hostname.startsWith("backoffice.") ? "/" : "/admin", { replace: true });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[2fr_1fr] bg-background">
      <div className="hidden lg:block relative">
        <img src={heroImg} alt="Lamra Lux" className="absolute inset-0 h-full w-full object-cover" />
      </div>
      <div className="flex flex-col justify-center px-8 py-12">
        <div className="w-full max-w-sm mx-auto">
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="Lamra Lux" className="h-16 w-16 object-contain mb-3" />
            <h1 className="font-display text-3xl tracking-wide">Lamra Lux</h1>
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Backoffice</span>
          </div>
          <p className="text-center text-sm text-muted-foreground mb-6">
            Bienvenue dans votre espace sécurisé Backoffice.<br />Pour accéder à votre compte, merci de vous identifier.
          </p>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email"><span className="text-destructive">*</span> Identifiant</Label>
              <Input id="email" type="email" required autoComplete="username" placeholder="Identifiant" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw"><span className="text-destructive">*</span> Mot de passe</Label>
              <Input id="pw" type="password" required autoComplete="current-password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Se connecter
            </Button>
          </form>
          <Link to="/auth" className="block text-center text-sm mt-6 hover:underline">Mot de passe oublié ?</Link>
          <p className="text-center text-xs text-muted-foreground mt-10">Copyrights Lamra Lux Backoffice © 2026</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
