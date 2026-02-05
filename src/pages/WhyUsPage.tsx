import { motion } from "framer-motion";
import { Shield, Sparkles, Truck, Heart, Award, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    icon: Sparkles,
    title: "Premium Quality",
    description: "Every product in our collection is carefully curated to meet the highest standards of quality and craftsmanship.",
  },
  {
    icon: Shield,
    title: "Authentic Products",
    description: "We guarantee 100% authentic products sourced directly from trusted brands and manufacturers.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Enjoy swift delivery across Morocco with tracking and reliable service to your doorstep.",
  },
  {
    icon: Heart,
    title: "Customer First",
    description: "Your satisfaction is our priority. Our dedicated support team is always ready to assist you.",
  },
  {
    icon: Award,
    title: "Best Prices",
    description: "Get competitive prices with an additional 10% discount on all online payments.",
  },
  {
    icon: Clock,
    title: "Easy Returns",
    description: "Hassle-free return policy within 14 days if you're not completely satisfied with your purchase.",
  },
];

const WhyUsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-card relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-10"
          style={{ background: "var(--gradient-radial-gold)" }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              Why Choose <span className="text-gradient-gold">ale LifeStyle</span>
            </h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto text-lg">
              We're committed to bringing you the finest lifestyle products with exceptional 
              service and an unparalleled shopping experience.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 bg-card rounded-xl border border-border hover:border-gold/50 transition-all hover-lift"
              >
                <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="font-display text-xl text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="font-body text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
                Our <span className="text-gradient-gold">Promise</span> to You
              </h2>
              <p className="font-body text-muted-foreground mb-6 leading-relaxed">
                At ale LifeStyle, we believe that everyone deserves access to premium 
                self-care and lifestyle products. That's why we've made it our mission 
                to curate the finest collection while keeping prices accessible.
              </p>
              <p className="font-body text-muted-foreground mb-6 leading-relaxed">
                Every product you see on our platform has been carefully selected, tested, 
                and approved by our team. We don't just sell products – we deliver experiences 
                that elevate your daily routine.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                    <span className="font-display text-gold text-xl">1K+</span>
                  </div>
                  <div>
                    <p className="font-body font-semibold text-foreground">Happy Customers</p>
                    <p className="font-body text-xs text-muted-foreground">And growing</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center">
                    <span className="font-display text-gold text-xl">50+</span>
                  </div>
                  <div>
                    <p className="font-body font-semibold text-foreground">Premium Products</p>
                    <p className="font-body text-xs text-muted-foreground">Carefully curated</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden border border-border">
                <img
                  src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800"
                  alt="Luxury lifestyle"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 p-6 bg-card rounded-xl border border-gold/30 shadow-lg">
                <p className="font-display text-2xl text-gold">8%</p>
                <p className="font-body text-sm text-muted-foreground">OFF on online payments</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WhyUsPage;
