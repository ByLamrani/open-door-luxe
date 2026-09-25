import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import MostRecommended from "@/components/MostRecommended";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Truck, Shield, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { getDiverseProducts, getNewProducts, getProductsByCategory } from "@/data/products";
import lamraluxLogo from "@/assets/lamralux-mark.png";
import { exploreCategories } from "@/data/exploreCategories";
import { catalog, clusterCategories } from "@/data/catalog";

const Index = () => {
  const { t } = useTranslation();
  const [showContent, setShowContent] = useState(true);

  const diverseProducts = getDiverseProducts();
  const newProducts = getNewProducts();
  // Hero showcases the 6 Explore clusters with a few products from each
  const heroCategories = catalog
    .map((c) => ({
      name: c.cluster,
      tKey: c.translationKey,
      path: c.path,
      items: clusterCategories(c.path)
        .flatMap((cat) => getProductsByCategory(cat))
        .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
        .slice(0, 4),
    }))
    .filter((c) => c.items.length > 0);

  return (
    <>
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen bg-background"
        >
          <Navbar />

          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center pt-36 pb-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-muted/60 via-background to-background" />
            <div
              className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-10"
              style={{ background: "var(--gradient-radial-gold)" }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              {/* LamraLux Logo */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-2"
              >
                <img
                  src={lamraluxLogo}
                  alt="Lamra Lux"
                  className="w-[260px] sm:w-[340px] md:w-[420px] lg:w-[480px] mx-auto select-none dark:invert"
                />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="font-display text-3xl md:text-5xl lg:text-6xl text-foreground mb-4 -mt-2"
              >
                {t("hero.title1")} <span className="text-gradient-gold italic">{t("hero.titleAccent")}</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
              >
                {t("hero.subtitle")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button variant="gold" size="lg" asChild>
                  <Link to="/collections">
                    {t("hero.exploreCollection")}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/why-us">{t("hero.whyChoose")}</Link>
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full"
              >
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="font-body text-sm text-gold">
                  {t("hero.discountBadge")}
                </span>
              </motion.div>

              {/* Hero featured items grouped by category */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="mt-14 space-y-12"
              >
                {heroCategories.map((cat) => (
                  <div key={cat.name}>
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <span className="h-px w-10 bg-border" />
                      <Link
                        to={cat.path}
                        className="text-xs uppercase tracking-[0.3em] text-foreground hover:opacity-70 transition-opacity"
                      >
                        {t(cat.tKey)}
                      </Link>
                      <span className="h-px w-10 bg-border" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
                      {cat.items.map((product) => (
                        <ProductCard key={product.id} {...product} />
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>

            </div>
          </section>

          {/* Explore mega-section */}
          <section className="py-20 bg-card border-y border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                  ✦ <span className="text-gradient-gold">{t("nav.explore")}</span>
                </h2>
                <p className="font-body text-muted-foreground max-w-xl mx-auto">
                  {t("footer.discoverExplore")}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {exploreCategories.map((cat, i) => (
                  <motion.div
                    key={cat.cluster}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 rounded-xl bg-background/50 border border-border hover:border-gold/40 transition-colors"
                  >
                    <p className="text-xs font-semibold text-gold uppercase tracking-wider mb-3">
                      {t(cat.translationKey)}
                    </p>
                    <ul className="space-y-2">
                      {cat.items.map((item) => (
                        <li key={item.name}>
                          <Link
                            to={item.path}
                            className="block text-sm font-body text-foreground/80 hover:text-gold transition-colors"
                          >
                            {item.translationKey ? t(item.translationKey) : item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Most Recommended */}
          <MostRecommended />

          {/* Features Banner */}
          <section className="py-8 bg-background border-y border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: CreditCard, text: t("features.onlineDiscount") },
                  { icon: Truck, text: t("features.cod") },
                  { icon: Shield, text: t("features.secure") },
                  { icon: Sparkles, text: t("features.premium") },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 justify-center text-center"
                  >
                    <feature.icon className="w-5 h-5 text-gold flex-shrink-0" />
                    <span className="font-body text-sm text-muted-foreground">
                      {feature.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Explore Collection - Diverse Products */}
          <section className="py-20 md:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                  {t("section.exploreCollection").split(" ")[0]} <span className="text-gradient-gold">{t("section.exploreCollection").split(" ").slice(1).join(" ")}</span>
                </h2>
                <p className="font-body text-muted-foreground max-w-xl mx-auto">
                  {t("section.exploreDesc")}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {diverseProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </div>
          </section>

          {/* Categories Grid */}
          <section className="py-20 bg-card">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                  <span className="text-gradient-gold">{t("section.shopByCategory")}</span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catalog
                  .map((c) => ({ name: t(c.translationKey), path: c.path, image: c.image }))
                  .concat([
                    { name: t("section.newArrivals"), path: "/new", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600" },
                  ])
                  .map((category, i) => (

                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link to={category.path} className="group block relative overflow-hidden rounded-lg aspect-[4/3]">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="font-display text-2xl text-foreground group-hover:text-gold transition-colors">
                          {category.name}
                        </h3>
                        <span className="font-body text-sm text-gold/80 flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {t("section.shopNow")} <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* New Arrivals */}
          <section className="py-20 md:py-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                  <span className="text-gradient-gold">{t("section.newArrivals")}</span>
                </h2>
                <p className="font-body text-muted-foreground max-w-xl mx-auto">
                  {t("section.newArrivalsDesc")}
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {newProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-card relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-20"
              style={{ background: "var(--gradient-radial-gold)" }}
            />
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
                  <span className="text-gradient-gold">{t("section.readyElevate")}</span>
                </h2>
                <p className="font-body text-muted-foreground mb-8">
                  {t("section.readyDesc")}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="gold" size="lg" asChild>
                    <Link to="/self-care">
                      {t("section.startShopping")}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/contact">{t("section.contactUs")}</Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>

          <Footer />
        </motion.div>
      )}
    </>
  );
};

export default Index;
