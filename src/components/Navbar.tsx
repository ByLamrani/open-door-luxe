import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, ChevronDown, User } from "lucide-react";
import logo from "@/assets/lamralux-mark.png";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import ThemeToggle from "@/components/ThemeToggle";
import ScentSentimentSearch from "@/components/ScentSentimentSearch";
import { supabase } from "@/integrations/supabase/client";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import { exploreCategories } from "@/data/exploreCategories";
import { catalog } from "@/data/catalog";

interface SubMenuItem {
  name: string;
  path: string;
  tKey?: string;
}

interface MenuItem {
  name: string;
  path: string;
  tKey?: string;
  /** Explore clusters are only shown inline on very wide screens */
  cluster?: boolean;
  submenu?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { name: "Home", path: "/", tKey: "nav.home" },
  // The 6 Explore clusters become the main top-level categories
  ...catalog.map((c) => ({
    name: c.cluster,
    path: c.path,
    tKey: c.translationKey,
    cluster: true,
    submenu: c.items.map((i) => ({ name: i.name, path: i.path })),
  })),
  { name: "Track Order", path: "/track-order", tKey: "nav.trackOrder" },
  { name: "Why Us", path: "/why-us", tKey: "nav.whyUs" },
  { name: "Contact", path: "/contact", tKey: "nav.contact" },
];

const Navbar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [showExplore, setShowExplore] = useState(false);
  const [, setAccountType] = useState<string>("buyer");
  const location = useLocation();
  const { itemCount } = useCart();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("account_type").eq("user_id", user.id).single().then(({ data }) => {
        if (data) setAccountType(data.account_type || "buyer");
      });
    }
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row — logo + utilities */}
        <div className="flex items-center justify-between gap-4 h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <motion.img src={logo} alt="Lamra Lux" className="h-14 w-auto dark:invert" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }} />
          </Link>

          {/* Primary links (kept short so nothing collides) */}
          <div className="hidden lg:flex items-center gap-1 flex-shrink-0 ml-auto">
            {menuItems
              .filter((item) => !item.cluster)
              .map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-body tracking-wide whitespace-nowrap transition-colors ${
                    isActive(item.path) ? "text-gold" : "text-foreground/80 hover:text-gold"
                  }`}
                >
                  {item.tKey ? t(item.tKey) : item.name}
                </Link>
              ))}
          </div>


          {/* Right side */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden xl:block">
              <ScentSentimentSearch />
            </div>

            <CurrencySwitcher />
            <LanguageSwitcher />
            <ThemeToggle />

            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/profile" className="p-2 text-foreground/80 hover:text-gold transition-colors">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </Link>
                <button onClick={() => signOut()} className="text-xs text-muted-foreground hover:text-gold transition-colors">
                   {t("nav.signOut")}
                </button>
              </div>
            ) : (
              <Link to="/auth" className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm font-body text-gold border border-gold/50 rounded-full hover:bg-gold/10 transition-colors">
                 <User className="w-4 h-4" /> {t("nav.signIn")}
              </Link>
            )}

            <Link to="/cart" className="relative p-2 text-foreground/80 hover:text-gold transition-colors">
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </motion.span>
              )}
            </Link>

            <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 text-foreground/80 hover:text-gold transition-colors">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-card border-t border-border overflow-hidden">
            <div className="px-4 py-4 space-y-1">
              {!user && (
                <Link to="/auth" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-body text-gold">
                  {t("nav.signIn")}
                </Link>
              )}

              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-2">✦ {t("nav.explore")}</p>
                {exploreCategories.map((cat) => (
                  <div key={cat.cluster} className="ml-2 mb-2">
                    <p className="text-xs text-muted-foreground mb-1">{t(cat.translationKey)}</p>
                    {cat.items.map((item) => (
                      <Link key={item.name} to={item.path} onClick={() => setIsOpen(false)} className="block px-3 py-1 text-sm text-foreground/80 hover:text-gold">
                        {item.translationKey ? t(item.translationKey) : item.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>

              {menuItems.map((item) => (
                <div key={item.name}>
                  <Link to={item.path} onClick={() => !item.submenu && setIsOpen(false)} className={`block px-4 py-3 text-sm font-body tracking-wide transition-colors ${isActive(item.path) ? "text-gold" : "text-foreground/80 hover:text-gold"}`}>
                    {item.tKey ? t(item.tKey) : item.name}
                  </Link>
                  {item.submenu && (
                    <div className="ml-4 border-l border-border">
                      {item.submenu.map((subItem) => (
                        <Link key={subItem.name} to={subItem.path} onClick={() => setIsOpen(false)} className="block px-4 py-2 text-sm font-body text-muted-foreground hover:text-gold transition-colors">
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {user && (
                <button onClick={() => { signOut(); setIsOpen(false); }} className="block w-full text-left px-4 py-3 text-sm font-body text-muted-foreground hover:text-gold">
                  {t("nav.signOut")}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
