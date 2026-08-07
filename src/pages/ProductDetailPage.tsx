import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Truck, Shield, CreditCard, Minus, Plus, Check, Heart, Share2, Gift, ShoppingCart, ZoomIn } from "lucide-react";
import WatchFitCheck from "@/components/WatchFitCheck";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getProductById, getRelatedProducts } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AuthRequiredModal from "@/components/AuthRequiredModal";
import ShareModal from "@/components/ShareModal";
import ImageViewer from "@/components/ImageViewer";
import { useCurrency } from "@/context/CurrencyContext";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { PRICING_RULES } from "@/lib/pricing";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem, isInCart } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [viewerImageIndex, setViewerImageIndex] = useState(0);

  const [product, setProduct] = useState(id ? getProductById(id) : undefined);
  const [loadingProduct, setLoadingProduct] = useState(!product);
  const inCart = product ? isInCart(product.id) : false;

  // Reset the whole page whenever the visited product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setQuantity(1);
    setSelectedImage(0);
    setAddedToCart(false);
    setIsFavorite(false);
    setShowImageViewer(false);

    const staticProduct = id ? getProductById(id) : undefined;
    setProduct(staticProduct);
    setLoadingProduct(!staticProduct);

    if (!staticProduct && id) {
      let cancelled = false;
      (async () => {
        const { data } = await supabase.from("products").select("*").eq("id", id).single();
        if (cancelled) return;
        if (data) {
          setProduct({
            id: data.id,
            name: data.name,
            price: data.price,
            image: data.image || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500",
            images: data.image ? [data.image] : [],
            category: data.category || "",
            description: data.description || "",
            isNew: data.is_new || false,
            isFeatured: data.is_featured || false,
          });
        }
        setLoadingProduct(false);
      })();
      return () => {
        cancelled = true;
      };
    }
  }, [id]);


  // Check if product is in favorites
  useEffect(() => {
    const checkFavorite = async () => {
      if (!user || !product) return;
      const { data } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", product.id)
        .single();
      setIsFavorite(!!data);
    };
    checkFavorite();
  }, [user, product]);

  // Localised product copy + active currency formatting
  const { format } = useCurrency();
  const [localName, localDescription] = useAutoTranslate([product?.name, product?.description]);


  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-20 text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">The product you're looking for doesn't exist.</p>
          <Button variant="gold" asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedProducts = getRelatedProducts(product);
  const discountedPrice = product.price * 0.95; // 5% online discount

  const requireAuth = (action: string, callback: () => void) => {
    if (!user) {
      setAuthAction(action);
      setShowAuthModal(true);
      return;
    }
    callback();
  };

  const handleAddToCart = () => {
    requireAuth("add items to cart", () => {
      if (inCart) {
        navigate("/cart");
        return;
      }
      
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
        });
      }
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    });
  };

  const handleBuyNow = () => {
    requireAuth("buy this product", () => {
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
        });
      }
      navigate("/checkout");
    });
  };

  const handleAddToFavorites = async () => {
    requireAuth("add items to favorites", async () => {
      if (!user) return;

      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", product.id);
        setIsFavorite(false);
        toast({ title: "Removed from Favorites", description: `${product.name} has been removed from your favorites` });
      } else {
        // Add to favorites
        try {
          const { error } = await supabase.from("favorites").insert({
            user_id: user.id,
            product_id: product.id,
          });

          if (error) {
            if (error.code === "23505") {
              toast({ title: "Already in Favorites", description: "This product is already in your favorites" });
            } else {
              throw error;
            }
          } else {
            setIsFavorite(true);
            toast({ title: "Added to Favorites! ❤️", description: `${product.name} has been saved to your favorites` });
          }
        } catch (error: any) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
      }
    });
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleRecommend = async () => {
    requireAuth("recommend products and earn $1", async () => {
      if (!user) return;

      const email = prompt("Enter your friend's email to recommend this product:");
      if (!email) return;

      try {
        await supabase.from("recommendations").insert({
          recommender_id: user.id,
          product_id: product.id,
          recipient_email: email,
        });

        toast({
          title: "Recommendation Sent! 🎁",
          description: "You'll receive $1 in your E-Wallet when your friend makes a purchase!",
        });
      } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    });
  };

  const handleImageClick = (index: number) => {
    setViewerImageIndex(index);
    setShowImageViewer(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
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

          {/* Product Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div 
                className="aspect-square rounded-2xl overflow-hidden bg-card border border-border relative cursor-zoom-in group"
                onClick={() => handleImageClick(selectedImage)}
              >
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isNew && (
                    <span className="px-3 py-1 bg-gold text-primary-foreground text-xs font-body font-semibold tracking-wider rounded">
                      NEW
                    </span>
                  )}
                  <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-body tracking-wide rounded">
                    Up to 8% OFF
                  </span>
                </div>

                {/* Zoom Indicator */}
                <div className="absolute bottom-4 right-4 p-2 bg-card/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-5 h-5 text-foreground" />
                </div>
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(i);
                    }}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i ? "border-gold" : "border-border hover:border-gold/50"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col"
            >
              <p className="text-sm text-muted-foreground font-body uppercase tracking-wider mb-2">
                {product.category} {product.subcategory && `/ ${product.subcategory}`}
              </p>
              
              <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                {localName || product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="font-display text-3xl text-gold">
                  {format(discountedPrice)}
                </span>
                <span className="text-xl text-muted-foreground line-through">
                  {format(product.price)}
                </span>
                <span className="text-sm text-accent-foreground bg-accent px-2 py-1 rounded">
                  Save {Math.round(PRICING_RULES.ONLINE_PCT * 100)}% online
                </span>
              </div>

              {/* Mini calculator — line total for the chosen quantity */}
              <div className="mb-6 p-3 rounded-lg border border-border bg-muted/40 inline-flex flex-col gap-1 w-fit">
                <span className="font-body text-xs text-muted-foreground">
                  1 × {format(product.price)} · {quantity} × {format(product.price)} ={" "}
                  {format(product.price * quantity)}
                </span>
                <span className="font-body text-sm text-foreground">
                  Total ({quantity} {quantity > 1 ? "articles" : "article"}):{" "}
                  <span className="font-display text-lg text-gold">
                    {format(discountedPrice * quantity)}
                  </span>
                </span>
              </div>

              {/* Description */}
              <p className="font-body text-muted-foreground leading-relaxed mb-8">
                {localDescription || product.description}
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="font-body text-foreground">Quantity:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 font-body min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>


              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Button
                  variant="gold"
                  size="lg"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Added to Cart
                    </>
                  ) : inCart ? (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Check My Cart
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </Button>
              </div>

              {/* Social Actions */}
              <div className="flex gap-3 mb-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddToFavorites}
                  className="flex-1"
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-white" : ""}`} />
                  {isFavorite ? "In Favorites" : "Add to Favorites"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRecommend}
                  className="flex-1"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Recommend (+$1)
                </Button>
              </div>

              {/* Watch Fit-Check (only for watches) */}
              {product.category === "Watches" && (
                <div className="mb-6">
                  <WatchFitCheck
                    productName={product.name}
                    productDescription={product.description}
                  />
                </div>
              )}

              {/* Features */}
              <div className="border-t border-border pt-6 space-y-4">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <CreditCard className="w-5 h-5 text-gold" />
                  <span className="font-body text-sm">Up to 8% OFF with Online Payment</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Truck className="w-5 h-5 text-gold" />
                  <span className="font-body text-sm">Cash on Delivery Available (Morocco only)</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Shield className="w-5 h-5 text-gold" />
                  <span className="font-body text-sm">Secure Shopping Guaranteed</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">
                  You May Also <span className="text-gradient-gold">Like</span>
                </h2>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />

      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        action={authAction}
      />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        productName={product.name}
        productUrl={window.location.href}
      />

      {/* Image Viewer */}
      <ImageViewer
        images={product.images}
        initialIndex={viewerImageIndex}
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
      />
    </div>
  );
};

export default ProductDetailPage;
