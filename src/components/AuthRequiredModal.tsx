import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, LogIn, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  action?: string;
}

const AuthRequiredModal = ({ isOpen, onClose, action = "this action" }: AuthRequiredModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-card rounded-2xl border border-border p-6 shadow-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-gold" />
                </div>

                <h2 className="font-display text-2xl text-foreground mb-2">
                  Sign In Required
                </h2>
                <p className="font-body text-muted-foreground mb-6">
                  Please sign in or create an account to {action}.
                </p>

                <div className="flex flex-col gap-3">
                  <Button variant="gold" size="lg" asChild className="w-full">
                    <Link to="/auth" onClick={onClose}>
                      <LogIn className="w-5 h-5 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="w-full">
                    <Link to="/auth?mode=signup" onClick={onClose}>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Create Account
                    </Link>
                  </Button>
                </div>

                <p className="font-body text-xs text-muted-foreground mt-4">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthRequiredModal;
