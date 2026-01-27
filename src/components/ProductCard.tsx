import { motion } from "framer-motion";
import { ShoppingBag, Eye } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  isNew?: boolean;
}

const ProductCard = ({ id, name, price, image, category, isNew }: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id, name, price, image, category });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group relative"
    >
      <Link to={`/product/${id}`}>
        <div className="relative overflow-hidden rounded-lg bg-card border border-border hover:border-gold/50 transition-all duration-300">
          {/* Product Image */}
          <div className="aspect-square overflow-hidden bg-muted">
            <motion.img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* New Badge */}
          {isNew && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-gold text-primary-foreground text-xs font-body font-semibold tracking-wider rounded">
              NEW
            </div>
          )}

          {/* Online Discount Badge */}
          <div className="absolute top-3 right-3 px-2 py-1 bg-accent/90 text-accent-foreground text-xs font-body tracking-wide rounded backdrop-blur-sm">
            10% OFF Online
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="p-3 bg-gold text-primary-foreground rounded-full shadow-lg"
            >
              <ShoppingBag className="w-5 h-5" />
            </motion.button>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-foreground/10 backdrop-blur-sm text-foreground rounded-full border border-foreground/20"
            >
              <Eye className="w-5 h-5" />
            </motion.div>
          </div>
        </div>

        {/* Product Info */}
        <div className="mt-4 space-y-1">
          <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">
            {category}
          </p>
          <h3 className="font-display text-lg text-foreground group-hover:text-gold transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-body font-semibold text-gold">
              ${(price * 0.9).toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground line-through">
              ${price.toFixed(2)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
