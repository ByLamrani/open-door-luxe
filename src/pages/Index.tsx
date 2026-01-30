import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DoorEntry from "@/components/DoorEntry";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import MostRecommended from "@/components/MostRecommended";
import LamraniSignature from "@/components/LamraniSignature";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Truck, Shield, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { getDiverseProducts, getNewProducts } from "@/data/products";
// Removed logo import - using Lamrani text instead

const Index = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const diverseProducts = getDiverseProducts();
  const newProducts = getNewProducts();

  useEffect(() => {
    // Check if user has already entered (session storage)
    const entered = sessionStorage.getItem("aleLifestyleEntered");
    if (entered) {
      setHasEntered(true);
      setShowContent(true);
    }
  }, []);

  const handleEnter = () => {
    sessionStorage.setItem("aleLifestyleEntered", "true");
    setHasEntered(true);
    setTimeout(() => setShowContent(true), 500);
  };

  return (
    <>
      {/* Door Entry Animation */}
      <AnimatePresence>
        {!hasEntered && <DoorEntry onEnter={handleEnter} />}
      </AnimatePresence>

      {/* Main Content */}
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="min-h-screen bg-background"
        >
          <Navbar />

          {/* Hero Section */}
          <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-charcoal via-background to-card" />
            <div 
              className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full opacity-10"
              style={{ background: "var(--gradient-radial-gold)" }}
            />
            
            {/* Lamrani Signature Background */}
            <LamraniSignature />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              {/* Lamrani Text with Signature Line */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-6"
              >
                <h2 
                  className="font-display text-5xl md:text-7xl lg:text-8xl italic"
                  style={{
                    background: "linear-gradient(135deg, #C4A052 0%, #E8D5A3 50%, #C4A052 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textShadow: "0 0 60px rgba(196, 160, 82, 0.3)",
                  }}
                >
                  Lamrani
                </h2>
                {/* Signature Line */}
                <svg 
                  viewBox="0 0 200 20" 
                  className="w-48 md:w-64 mx-auto mt-2"
                  style={{ filter: "drop-shadow(0 0 10px rgba(196, 160, 82, 0.5))" }}
                >
                  <path
                    d="M10 10 Q50 5 100 10 T190 10"
                    fill="none"
                    stroke="url(#goldGradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M170 10 Q180 15 190 8"
                    fill="none"
                    stroke="url(#goldGradient)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#C4A052" />
                      <stop offset="50%" stopColor="#E8D5A3" />
                      <stop offset="100%" stopColor="#C4A052" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground mb-6"
              >
                Elevate Your <span className="text-gradient-gold">LifeStyle</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="font-body text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
              >
                Discover our curated collection of premium self-care products, 
                exquisite fragrances, and luxury accessories.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button variant="gold" size="lg" asChild>
                  <Link to="/self-care">
                    Explore Collection
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/why-us">Why Choose Us</Link>
                </Button>
              </motion.div>

              {/* Payment Info Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-12 inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full"
              >
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="font-body text-sm text-gold">
                  Up to 8% OFF on Online Payments
                </span>
              </motion.div>
            </div>
          </section>

          {/* Most Recommended - Right after hero */}
          <MostRecommended />

          {/* Features Banner */}
          <section className="py-8 bg-background border-y border-border">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: CreditCard, text: "Up to 8% OFF Online" },
                  { icon: Truck, text: "Cash on Delivery" },
                  { icon: Shield, text: "Secure Shopping" },
                  { icon: Sparkles, text: "Premium Quality" },
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
                  Explore <span className="text-gradient-gold">Collection</span>
                </h2>
                <p className="font-body text-muted-foreground max-w-xl mx-auto">
                  Discover our diverse range of premium products across all categories.
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
                  Shop by <span className="text-gradient-gold">Category</span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: "Self-Care", path: "/self-care", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600" },
                  { name: "Fragrances", path: "/fragrances", image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600" },
                  { name: "Air Diffusers", path: "/air-diffusers", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600" },
                  { name: "Men's Watches", path: "/watches/men", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600" },
                  { name: "Women's Watches", path: "/watches/women", image: "https://images.unsplash.com/photo-1549972574-8e3e1ed6a347?w=600" },
                  { name: "New Arrivals", path: "/new", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600" },
                ].map((category, i) => (
                  <motion.div
                    key={category.name}
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
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="font-display text-2xl text-foreground group-hover:text-gold transition-colors">
                          {category.name}
                        </h3>
                        <span className="font-body text-sm text-gold/80 flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          Shop Now <ArrowRight className="w-4 h-4" />
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
                  New <span className="text-gradient-gold">Arrivals</span>
                </h2>
                <p className="font-body text-muted-foreground max-w-xl mx-auto">
                  Be the first to discover our latest additions.
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
                  Ready to <span className="text-gradient-gold">Elevate</span> Your Lifestyle?
                </h2>
                <p className="font-body text-muted-foreground mb-8">
                  Join thousands of satisfied customers who have discovered the art of refined living.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="gold" size="lg" asChild>
                    <Link to="/self-care">
                      Start Shopping
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/contact">Contact Us</Link>
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
