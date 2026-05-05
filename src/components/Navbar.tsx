import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, ChevronDown, User, Zap, BarChart3 } from "lucide-react";
import logo from "@/assets/vanta-logo.png";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import ScentSentimentSearch from "@/components/ScentSentimentSearch";
import { supabase } from "@/integrations/supabase/client";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import CurrencySwitcher from "@/components/CurrencySwitcher";

interface SubMenuItem {
  name: string;
  path: string;
}

interface MenuItem {
  name: string;
  path: string;
  submenu?: SubMenuItem[];
}

// Explore mega-menu clusters
const exploreCategories = [
  {
    cluster: "Luxury & Lifestyle",
    items: [
      { name: "Fragrance Vault", path: "/fragrances" },
      { name: "Wellness Rituals", path: "/self-care/spa" },
      { name: "Executive Gift Sets", path: "/collections" },
      { name: "Limited Drops", path: "/new" },
    ],
  },
  {
    cluster: "Tech & Gear",
    items: [
      { name: "Smart Accessories", path: "/watches" },
      { name: "Horology & Time", path: "/watches/men" },
      { name: "Home Electronics", path: "/home-electronics" },
    ],
  },
  {
    cluster: "Wellness & Beauty",
    items: [
      { name: "The Grooming Suite", path: "/self-care/tondeuse" },
      { name: "Organic Apothecary", path: "/self-care/massage" },
      { name: "Personalized Self-Care", path: "/self-care" },
    ],
  },
  {
    cluster: "Art & Living",
    items: [
      { name: "Atmospheric Living", path: "/air-diffusers" },
      { name: "Home Decor", path: "/home-decor" },
      { name: "Lighting & Ambience", path: "/lighting" },
    ],
  },
  {
    cluster: "Home & Living",
    items: [
      { name: "Housing Furniture", path: "/housing-furniture" },
      { name: "Kitchen Tools", path: "/kitchen-tools" },
      { name: "Bedroom Essentials", path: "/bedroom" },
      { name: "Bath & Linen", path: "/bath-linen" },
    ],
  },
  {
    cluster: "Fashion & Accessories",
    items: [
      { name: "Bags & Leather", path: "/bags" },
      { name: "Jewelry", path: "/jewelry" },
      { name: "Eyewear", path: "/eyewear" },
    ],
  },
];

const menuItems: MenuItem[] = [
  { name: "Home", path: "/" },
  {
    name: "Self-Care",
    path: "/self-care",
    submenu: [
      { name: "Tondeuse", path: "/self-care/tondeuse" },
      { name: "Pack de Soin/SPA", path: "/self-care/spa" },
      { name: "Articles de Massage", path: "/self-care/massage" },
    ],
  },
  {
    name: "Fragrances",
    path: "/fragrances",
    submenu: [
      { name: "For Men", path: "/fragrances/men" },
      { name: "For Women", path: "/fragrances/women" },
    ],
  },
  { name: "Air Diffusers", path: "/air-diffusers" },
  {
    name: "Watches",
    path: "/watches",
    submenu: [
      { name: "For Men", path: "/watches/men" },
      { name: "For Women", path: "/watches/women" },
    ],
  },
  { name: "Track Order", path: "/track-order" },
  { name: "Why Us", path: "/why-us" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [showExplore, setShowExplore] = useState(false);
  const [accountType, setAccountType] = useState<string>("buyer");
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
            <motion.img src={logo} alt="VANTA by Lamrani" className="h-14 w-auto rounded-md" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }} />
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
                ✦ Explore
                <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showExplore && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-1 py-4 px-4 min-w-[480px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      {exploreCategories.map((cat) => (
                        <div key={cat.cluster}>
                          <p className="text-xs font-semibold text-gold mb-2 uppercase tracking-wider">{cat.cluster}</p>
                          <div className="space-y-1">
                            {cat.items.map((item) => (
                              <Link
                                key={item.name}
                                to={item.path}
                                className="block px-3 py-1.5 text-sm font-body text-foreground/80 hover:text-gold hover:bg-gold/5 rounded transition-colors"
                              >
                                {item.name}
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

            {menuItems.map((item) => {
              const renderDashboardBefore = item.name === "Track Order" && user && accountType === "seller";
              return (
              <>
              {renderDashboardBefore && (
                <div key="seller-dash" className="relative flex-shrink-0">
                  <Link to="/seller/dashboard" className={`px-3 py-2 text-xs font-body tracking-wide transition-colors flex items-center gap-1 whitespace-nowrap ${isActive("/seller/dashboard") ? "text-gold" : "text-gold/90 hover:text-gold"}`}>
                    <BarChart3 className="w-3 h-3" /> Dashboard
                  </Link>
                </div>
              )}
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
                  {item.name}
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
              </>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <ScentSentimentSearch />
            </div>

            <CurrencySwitcher />
            <LanguageSwitcher />
            <ThemeToggle />

            {/* Seller Dashboard now lives inline in nav next to Track Order */}

            {/* Auth Button */}
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
                  Sign Out
                </button>
              </div>
            ) : (
              <Link to="/auth" className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm font-body text-gold border border-gold/50 rounded-full hover:bg-gold/10 transition-colors">
                <User className="w-4 h-4" /> Sign In
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
                  Sign In / Sign Up
                </Link>
              )}

              {user && accountType === "seller" && (
                <Link to="/seller/dashboard" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-body text-gold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" /> Seller Dashboard
                </Link>
              )}

              {/* Explore section in mobile */}
              <div className="px-4 py-2">
                <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-2">✦ Explore</p>
                {exploreCategories.map((cat) => (
                  <div key={cat.cluster} className="ml-2 mb-2">
                    <p className="text-xs text-muted-foreground mb-1">{cat.cluster}</p>
                    {cat.items.map((item) => (
                      <Link key={item.name} to={item.path} onClick={() => setIsOpen(false)} className="block px-3 py-1 text-sm text-foreground/80 hover:text-gold">
                        {item.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>

              {menuItems.map((item) => (
                <div key={item.name}>
                  <Link to={item.path} onClick={() => !item.submenu && setIsOpen(false)} className={`block px-4 py-3 text-sm font-body tracking-wide transition-colors ${isActive(item.path) ? "text-gold" : "text-foreground/80 hover:text-gold"}`}>
                    {item.name}
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
                  Sign Out
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
