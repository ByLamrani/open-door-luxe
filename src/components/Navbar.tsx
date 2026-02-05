import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, ChevronDown, User } from "lucide-react";
import logo from "@/assets/logo.png";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

interface SubMenuItem {
  name: string;
  path: string;
}

interface MenuItem {
  name: string;
  path: string;
  submenu?: SubMenuItem[];
}

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
  { name: "Collections", path: "/collections" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const location = useLocation();
  const { itemCount } = useCart();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <motion.img
              src={logo}
              alt="ale LifeStyle"
              className="h-14 w-auto"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.submenu && setActiveSubmenu(item.name)}
                onMouseLeave={() => setActiveSubmenu(null)}
              >
                <Link
                  to={item.path}
                  className={`px-4 py-2 text-sm font-body tracking-wide transition-colors flex items-center gap-1 ${
                    isActive(item.path)
                      ? "text-gold"
                      : "text-foreground/80 hover:text-gold"
                  }`}
                >
                  {item.name}
                  {item.submenu && (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </Link>

                {/* Submenu */}
                <AnimatePresence>
                  {item.submenu && activeSubmenu === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-1 py-2 min-w-[180px] bg-card border border-border rounded-md shadow-lg overflow-hidden"
                    >
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          className="block px-4 py-2 text-sm font-body text-foreground/80 hover:text-gold hover:bg-muted transition-colors"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Cart, Auth & Mobile Menu */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth Button */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/profile"
                  className="p-2 text-foreground/80 hover:text-gold transition-colors"
                >
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-xs text-muted-foreground hover:text-gold transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm font-body text-gold border border-gold/50 rounded-full hover:bg-gold/10 transition-colors"
              >
                <User className="w-4 h-4" />
                Sign In
              </Link>
            )}

            <Link
              to="/cart"
              className="relative p-2 text-foreground/80 hover:text-gold transition-colors"
            >
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-foreground/80 hover:text-gold transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-card border-t border-border overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {/* Auth for mobile */}
              {!user && (
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-sm font-body text-gold"
                >
                  Sign In / Sign Up
                </Link>
              )}
              
              {menuItems.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.path}
                    onClick={() => !item.submenu && setIsOpen(false)}
                    className={`block px-4 py-3 text-sm font-body tracking-wide transition-colors ${
                      isActive(item.path)
                        ? "text-gold"
                        : "text-foreground/80 hover:text-gold"
                    }`}
                  >
                    {item.name}
                  </Link>
                  {item.submenu && (
                    <div className="ml-4 border-l border-border">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.path}
                          onClick={() => setIsOpen(false)}
                          className="block px-4 py-2 text-sm font-body text-muted-foreground hover:text-gold transition-colors"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {user && (
                <button
                  onClick={() => { signOut(); setIsOpen(false); }}
                  className="block w-full text-left px-4 py-3 text-sm font-body text-muted-foreground hover:text-gold"
                >
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
