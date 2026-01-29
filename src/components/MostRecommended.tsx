import { motion } from "framer-motion";
import ProductCard from "./ProductCard";
import { products } from "@/data/products";

// Get products with highest recommendation potential (featured + high price)
const getMostRecommended = () => {
  return products
    .filter(p => p.isFeatured)
    .sort((a, b) => b.price - a.price)
    .slice(0, 4);
};

const MostRecommended = () => {
  const recommendedProducts = getMostRecommended();

  return (
    <section className="py-20 md:py-28 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
            Most <span className="text-gradient-gold">Recommended</span>
          </h2>
          <p className="font-body text-muted-foreground max-w-xl mx-auto">
            Our customers' top picks and bestselling products
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MostRecommended;
