import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";
import logo from "@/assets/lamralux-mark.png";
import { exploreCategories } from "@/data/exploreCategories";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Explore mega-grid */}
        <div className="mb-14">
          <h4 className="font-display text-lg text-foreground mb-6">✦ {t("nav.explore")}</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {exploreCategories.map((cat) => (
              <div key={cat.cluster}>
                <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-3">
                  {t(cat.translationKey)}
                </p>
                <ul className="space-y-2">
                  {cat.items.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.path}
                        className="text-muted-foreground font-body text-sm hover:text-gold transition-colors"
                      >
                        {item.translationKey ? t(item.translationKey) : item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pt-10 border-t border-border">
          {/* Brand */}
          <div className="space-y-6">
            <img src={logo} alt="Lamra Lux" className="h-16 w-auto dark:invert" />
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              {t("footer.brandTagline")}
            </p>
            <div className="flex gap-4">
              {[
                { Icon: Instagram, href: "https://www.instagram.com/lamralux/" },
                { Icon: Facebook, href: "https://www.facebook.com/profile.php?id=61591960955034" },
                { Icon: Twitter, href: "#" },
              ].map(({ Icon, href }, i) => (
                <motion.a
                  key={i}
                  href={href}
                  target={href !== "#" ? "_blank" : undefined}
                  rel={href !== "#" ? "noopener noreferrer" : undefined}
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
            <h4 className="font-display text-lg text-foreground mb-6">{t("footer.quickLinks")}</h4>
            <ul className="space-y-3">
              {[
                { label: t("nav.home"), path: "/" },
                { label: t("nav.trackOrder"), path: "/track-order" },
                { label: t("nav.whyUs"), path: "/why-us" },
                { label: t("nav.contact"), path: "/contact" },
                { label: t("footer.terms"), path: "/terms" },
                { label: t("footer.privacy"), path: "/privacy" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground font-body text-sm hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories — the 6 Explore clusters */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-6">{t("footer.categories")}</h4>
            <ul className="space-y-3">
              {exploreCategories.map((cat) => (
                <li key={cat.path}>
                  <Link
                    to={cat.path}
                    className="text-muted-foreground font-body text-sm hover:text-gold transition-colors"
                  >
                    {t(cat.translationKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>


          {/* Get in Touch */}
          <div>
            <h4 className="font-display text-lg text-foreground mb-6">{t("footer.getInTouch")}</h4>
            <p className="text-muted-foreground font-body text-sm mb-4">
              {t("footer.getInTouchDesc")}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-lg text-gold text-sm font-body hover:bg-gold/20 transition-colors"
            >
              {t("footer.sendMessage")}
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col gap-4">
          <div className="flex flex-wrap justify-center gap-4 text-sm font-body">
            <Link to="/terms" className="text-muted-foreground hover:text-gold transition-colors">
              {t("footer.terms")}
            </Link>
            <span className="text-border">|</span>
            <Link to="/privacy" className="text-muted-foreground hover:text-gold transition-colors">
              {t("footer.privacy")}
            </Link>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground font-body text-sm">
              © 2026 <span className="font-display">Lamra Lux</span>. {t("footer.rights")}
            </p>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-gold/10 text-gold text-xs font-body rounded-full">
                {t("features.onlineDiscount")}
              </span>
              <span className="text-muted-foreground font-body text-xs">
                {t("footer.codMorocco")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
