import { ReactNode, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Role = "admin" | "moderator" | "user";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: Role;
  /** Where to send signed-out visitors */
  redirectTo?: string;
}

const ProtectedRoute = ({ children, requiredRole, redirectTo }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setAllowed(false);
      return;
    }
    if (!requiredRole) {
      setAllowed(true);
      return;
    }
    let active = true;
    supabase
      .rpc("has_role", { _user_id: user.id, _role: requiredRole })
      .then(({ data, error }) => {
        if (active) setAllowed(!error && data === true);
      });
    return () => {
      active = false;
    };
  }, [user, loading, requiredRole]);

  if (loading || allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to={redirectTo ?? (requiredRole === "admin" ? "/admin/login" : "/auth")} replace />;

  if (!allowed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-display font-semibold mb-2">Access denied</h1>
        <p className="text-muted-foreground mb-6 max-w-sm">
          This area is restricted. Your account does not have the required permissions.
        </p>
        <Button asChild variant="outline">
          <Link to="/">Back to store</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
