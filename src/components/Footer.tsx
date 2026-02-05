import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter } from "lucide-react";
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
              {[
                { name: "Home", path: "/" },
                { name: "Self-Care", path: "/self-care" },
                { name: "Fragrances", path: "/fragrances" },
                { name: "Watches", path: "/watches" },
                { name: "Track Order", path: "/track-order" },
                { name: "Why Us", path: "/why-us" },
                { name: "Our Collections", path: "/collections" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground font-body text-sm hover:text-gold transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-6">Categories</h4>
            <ul className="space-y-3">
              {[
                { name: "Tondeuse", path: "/self-care/tondeuse" },
                { name: "SPA Packs", path: "/self-care/spa" },
                { name: "Massage Articles", path: "/self-care/massage" },
                { name: "Air Diffusers", path: "/air-diffusers" },
                { name: "Men's Watches", path: "/watches/men" },
                { name: "Women's Watches", path: "/watches/women" },
              ].map((cat) => (
                <li key={cat.name}>
                  <Link
                    to={cat.path}
                    className="text-muted-foreground font-body text-sm hover:text-gold transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Send Us a Message */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-6">Get in Touch</h4>
            <p className="text-muted-foreground font-body text-sm mb-4">
              Have questions? We'd love to hear from you.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-lg text-gold text-sm font-body hover:bg-gold/20 transition-colors"
            >
              Send Us a Message
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col gap-4">
          <div className="flex flex-wrap justify-center gap-4 text-sm font-body">
            <Link to="/terms" className="text-muted-foreground hover:text-gold transition-colors">
              Terms of Service
            </Link>
            <span className="text-border">|</span>
            <Link to="/privacy" className="text-muted-foreground hover:text-gold transition-colors">
              Privacy Policy
            </Link>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground font-body text-sm">
            © 2025 ale LifeStyle. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-gold/10 text-gold text-xs font-body rounded-full">
              Up to 8% OFF Online
            </span>
            <span className="text-muted-foreground font-body text-xs">
              Cash on Delivery (Morocco)
            </span>
          </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
