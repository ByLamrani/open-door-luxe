import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, ChevronDown, User } from "lucide-react";
import logo from "@/assets/lamralux-logo.png";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import ThemeToggle from "@/components/ThemeToggle";
import ScentSentimentSearch from "@/components/ScentSentimentSearch";
import { supabase } from "@/integrations/supabase/client";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CurrencySwitcher from "@/components/CurrencySwitcher";
import { exploreCategories } from "@/data/exploreCategories";

interface SubMenuItem {
  name: string;
  path: string;
  tKey?: string;
}

interface MenuItem {
  name: string;
  path: string;
  tKey?: string;
  submenu?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { name: "Home", path: "/", tKey: "nav.home" },
  {
    name: "Self-Care",
    path: "/self-care",
    tKey: "nav.selfCare",
    submenu: [
      { name: "Tondeuse", path: "/self-care/tondeuse" },
      { name: "Pack de Soin/SPA", path: "/self-care/spa" },
      { name: "Articles de Massage", path: "/self-care/massage" },
    ],
  },
  {
    name: "Fragrances",
    path: "/fragrances",
    tKey: "nav.fragrances",
    submenu: [
      { name: "For Men", path: "/fragrances/men" },
      { name: "For Women", path: "/fragrances/women" },
    ],
  },
  { name: "Air Diffusers", path: "/air-diffusers", tKey: "nav.airDiffusers" },
  {
    name: "Watches",
    path: "/watches",
    tKey: "nav.watches",
    submenu: [
      { name: "For Men", path: "/watches/men" },
      { name: "For Women", path: "/watches/women" },
    ],
  },
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
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <motion.img src={logo} alt="LamraLux by Lamrani" className="h-14 w-auto" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5">
            {/* Explore Mega-Menu Trigger */}
            <div
              className="relative flex-shrink-0"
              onMouseEnter={() => setShowExplore(true)}
              onMouseLeave={() => setShowExplore(false)}
            >
              <button className="px-3 py-2 text-xs font-body tracking-wide transition-colors flex items-center gap-1 whitespace-nowrap text-gold hover:text-gold/80 font-semibold">
                ✦ {t("nav.explore")}
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showExplore && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-1 py-4 px-4 min-w-[680px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="grid grid-cols-3 gap-4">
                      {exploreCategories.map((cat) => (
                        <div key={cat.cluster}>
                          <p className="text-xs font-semibold text-gold mb-2 uppercase tracking-wider">{t(cat.translationKey)}</p>
                          <div className="space-y-1">
                            {cat.items.map((item) => (
                              <Link
                                key={item.name}
                                to={item.path}
                                className="block px-3 py-1.5 text-sm font-body text-foreground/80 hover:text-gold hover:bg-gold/5 rounded transition-colors"
                              >
                                {item.translationKey ? t(item.translationKey) : item.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {menuItems.map((item) => (
              <div
                key={item.name}
                className="relative flex-shrink-0"
                onMouseEnter={() => item.submenu && setActiveSubmenu(item.name)}
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                <Link
                  to={item.path}
                  className={`px-3 py-2 text-xs font-body tracking-wide transition-colors flex items-center gap-1 whitespace-nowrap ${
                    isActive(item.path) ? "text-gold" : "text-foreground/80 hover:text-gold"
                  }`}
                >
                  {item.tKey ? t(item.tKey) : item.name}
                  {item.submenu && <ChevronDown className="w-3 h-3" />}
                </Link>
                <AnimatePresence>
                  {item.submenu && activeSubmenu === item.name && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }} className="absolute top-full left-0 mt-1 py-2 min-w-[180px] bg-card border border-border rounded-md shadow-lg overflow-hidden">
                      {item.submenu.map((subItem) => (
                        <Link key={subItem.name} to={subItem.path} className="block px-4 py-2 text-sm font-body text-foreground/80 hover:text-gold hover:bg-muted transition-colors whitespace-nowrap">
                          {subItem.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
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
