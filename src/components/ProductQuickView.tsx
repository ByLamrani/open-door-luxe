import { ShoppingBag, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import InviteLink from "@/components/InviteLink";
import { PRICING_RULES } from "@/lib/pricing";
import { useCurrency } from "@/context/CurrencyContext";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAuthRequired: () => void;
}

const ProductQuickView = ({ product, isOpen, onClose, onAuthRequired }: ProductQuickViewProps) => {
  const { addItem, isInCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const { format } = useCurrency();
  const [localName, localDescription] = useAutoTranslate([product?.name, product?.description]);

  if (!product) return null;

  const inCart = isInCart(product.id);
  const discountedPrice = product.price * (1 - PRICING_RULES.ONLINE_PCT);

  const handleAddToCart = () => {
    if (!user) {
      onClose();
      onAuthRequired();
      return;
    }
    if (!inCart) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      });
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      onClose();
      onAuthRequired();
      return;
    }
    if (!inCart) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      });
    }
    onClose();
    navigate("/checkout");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-card border-border overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Images Section */}
          <div className="p-4 bg-muted">
            <div className="aspect-square rounded-lg overflow-hidden mb-3">
              <motion.img
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={product.images[selectedImage] || product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.slice(0, 5).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? "border-gold" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info Section */}
          <div className="p-6 flex flex-col">
            {/* Badges */}
            <div className="flex gap-2 mb-3">
              {product.isNew && (
                <span className="px-2 py-1 bg-gold text-primary-foreground text-xs font-body tracking-wide rounded">
                  NEW
                </span>
              )}
              <span className="px-2 py-1 bg-accent/90 text-accent-foreground text-xs font-body tracking-wide rounded">
                Up to 8% OFF Online
              </span>
            </div>

            {/* Category */}
            <p className="text-xs text-muted-foreground font-body uppercase tracking-wider mb-1">
              {product.subcategory || product.category}
            </p>

            {/* Name */}
            <h2 className="font-display text-2xl text-foreground mb-3">{localName || product.name}</h2>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-display text-3xl text-gold">{format(discountedPrice)}</span>
              <span className="text-lg text-muted-foreground line-through">{format(product.price)}</span>
              <span className="text-sm text-green-500 font-body">-5%</span>
            </div>

            {/* Description */}
            <p className="font-body text-muted-foreground mb-6 flex-grow">
              {localDescription || product.description}
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <Button variant="gold" size="lg" className="w-full" onClick={handleBuyNow}>
                <Zap className="w-5 h-5 mr-2" />
                Buy Now
              </Button>

              <Button variant="outline" size="lg" className="w-full" onClick={handleAddToCart}>
                <ShoppingBag className="w-5 h-5 mr-2" />
                {inCart ? "In Cart" : "Add to Cart"}
              </Button>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to={`/product/${product.id}`} onClick={onClose}>View Full Details</Link>
                </Button>
                <InviteLink productId={product.id} className="flex-1" />
              </div>
            </div>

            {/* Features */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gold rounded-full" />
                  2–8% Online Discount
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gold rounded-full" />
                  Free Shipping $100+
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gold rounded-full" />
                  6–8% Off on 8+ items
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-gold rounded-full" />
                  Secure Payment
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;
