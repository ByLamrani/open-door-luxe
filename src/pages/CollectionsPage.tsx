import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { getOneFromEachCategory } from "@/data/products";
import { catalog } from "@/data/catalog";

// Every collection in the store, derived from the single catalog source.
const collections = catalog.map((c) => ({
  name: c.cluster,
  description: c.blurb,
  path: c.path,
  image: c.image,
  subcollections: c.items.map((i) => ({ name: i.name, path: i.path })),
}));

const CollectionsPage = () => {
  const navigate = useNavigate();
  const sampleProducts = getOneFromEachCategory();

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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-gold transition-colors font-body"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-6">
              Our <span className="text-gradient-gold">Collections</span>
            </h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto text-lg">
              Explore our carefully curated collections of premium lifestyle products.
              Each category represents the finest selection in its class.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {collections.map((collection, i) => (
              <motion.div
                key={collection.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-border"
              >
                <Link to={collection.path}>
                  <div className="aspect-[16/10] relative overflow-hidden">
                    <img
                      src={collection.image}
                      alt={collection.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display text-2xl md:text-3xl text-foreground group-hover:text-gold transition-colors mb-2">
                      {collection.name}
                    </h3>
                    <p className="font-body text-muted-foreground mb-4">
                      {collection.description}
                    </p>
                    {collection.subcollections.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {collection.subcollections.map((sub) => (
                          <Link
                            key={sub.name}
                            to={sub.path}
                            onClick={(e) => e.stopPropagation()}
                            className="px-3 py-1 bg-gold/10 border border-gold/30 rounded-full text-gold text-xs font-body hover:bg-gold/20 transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                    <span className="font-body text-sm text-gold/80 flex items-center gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      View Collection <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample from Each Collection */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Featured from Each <span className="text-gradient-gold">Collection</span>
            </h2>
            <p className="font-body text-muted-foreground max-w-xl mx-auto">
              Discover a curated selection showcasing the best from every category.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="gold" size="lg" asChild>
              <Link to="/new">
                View All Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CollectionsPage;