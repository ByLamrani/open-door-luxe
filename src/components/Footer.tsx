import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <img src={logo} alt="ale LifeStyle" className="h-16 w-auto" />
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              Elevate your lifestyle with our curated collection of premium self-care, 
              fragrances, and luxury accessories.
            </p>
            <div className="flex gap-4">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="p-2 border border-border rounded-full text-muted-foreground hover:text-gold hover:border-gold transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {["Home", "Self-Care", "Fragrances", "Watches", "Why Us"].map((link) => (
                <li key={link}>
                  <Link
                    to={`/${link.toLowerCase().replace(" ", "-")}`}
                    className="text-muted-foreground font-body text-sm hover:text-gold transition-colors"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-6">Categories</h4>
            <ul className="space-y-3">
              {["Tondeuse", "SPA Packs", "Massage Articles", "Air Diffusers", "Men's Watches", "Women's Watches"].map((cat) => (
                <li key={cat}>
                  <Link
                    to="#"
                    className="text-muted-foreground font-body text-sm hover:text-gold transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold mt-1 flex-shrink-0" />
                <span className="text-muted-foreground font-body text-sm">
                  123 Luxury Avenue, Casablanca, Morocco
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <span className="text-muted-foreground font-body text-sm">
                  +212 5XX-XXXXXX
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                <span className="text-muted-foreground font-body text-sm">
                  contact@alelifestyle.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground font-body text-sm">
            © 2025 ale LifeStyle. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-gold/10 text-gold text-xs font-body rounded-full">
              10% OFF on Online Payment
            </span>
            <span className="text-muted-foreground font-body text-xs">
              Cash on Delivery Available
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
