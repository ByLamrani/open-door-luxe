import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProductsByCategory, getProductsBySubcategory, Product } from "@/data/products";
import { supabase } from "@/integrations/supabase/client";

interface CategoryPageProps {
  category: string;
  subcategory?: string;
}

const CategoryPage = ({ category, subcategory }: CategoryPageProps) => {
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Static products
  const staticProducts = subcategory 
    ? getProductsBySubcategory(category, subcategory)
    : getProductsByCategory(category);

  useEffect(() => {
    const fetchDbProducts = async () => {
      let query = supabase.from("products").select("*");
      
      if (subcategory) {
        query = query.eq("category", category);
      } else {
        query = query.eq("category", category);
      }
      
      const { data } = await query;
      
      if (data) {
        const mapped: Product[] = data.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500",
          images: p.image ? [p.image] : [],
          category: p.category || category,
          description: p.description || "",
          isNew: p.is_new || false,
          isFeatured: p.is_featured || false,
        }));
        setDbProducts(mapped);
      }
      setLoading(false);
    };
    fetchDbProducts();
  }, [category, subcategory]);

  // Merge: static products + DB products (avoid duplicates by id)
  const staticIds = new Set(staticProducts.map(p => p.id));
  const uniqueDbProducts = dbProducts.filter(p => !staticIds.has(p.id));
  const products = [...staticProducts, ...uniqueDbProducts];

  const title = subcategory || category;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="font-body text-sm text-gold uppercase tracking-widest mb-2">
              {subcategory ? category : "Collection"}
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground">
              {title}
            </h1>
            <p className="font-body text-muted-foreground mt-4 max-w-xl mx-auto">
              Discover our curated selection of premium {title.toLowerCase()} products.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="font-body text-muted-foreground text-lg">
                {loading ? "Loading products..." : "No products found in this category."}
              </p>
              {!loading && (
                <p className="font-body text-sm text-muted-foreground/70 mt-2">
                  Check back soon for new arrivals!
                </p>
              )}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CategoryPage;
