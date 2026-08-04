import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProductsByCategory, getProductsBySubcategory, products as allProducts, Product } from "@/data/products";
import { catalog } from "@/data/catalog";
import { supabase } from "@/integrations/supabase/client";

interface CategoryPageProps {
  /** Single product category */
  category?: string;
  subcategory?: string;
  /** Cluster mode: several product categories on one page */
  clusterPath?: string;
}

const CategoryPage = ({ category, subcategory, clusterPath }: CategoryPageProps) => {
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const cluster = clusterPath ? catalog.find((c) => c.path === clusterPath) : undefined;

  // Static products
  let staticProducts: Product[] = [];
  if (cluster) {
    const cats = Array.from(new Set(cluster.items.map((i) => i.category)));
    staticProducts = allProducts.filter((p) => cats.includes(p.category));
  } else if (category && subcategory) {
    staticProducts = getProductsBySubcategory(category, subcategory);
  } else if (category) {
    staticProducts = getProductsByCategory(category);
  }

  useEffect(() => {
    const fetchDbProducts = async () => {
      setLoading(true);
      const cats = cluster
        ? Array.from(new Set(cluster.items.map((i) => i.category)))
        : category
        ? [category]
        : [];
      if (cats.length === 0) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.from("products").select("*").in("category", cats);

      if (data) {
        const mapped: Product[] = data.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image || "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500",
          images: p.image ? [p.image] : [],
          category: p.category || category || "",
          description: p.description || "",
          isNew: p.is_new || false,
          isFeatured: p.is_featured || false,
        }));
        setDbProducts(mapped);
      }
      setLoading(false);
    };
    fetchDbProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, subcategory, clusterPath]);

  const staticIds = new Set(staticProducts.map((p) => p.id));
  const uniqueDbProducts = dbProducts.filter((p) => !staticIds.has(p.id));
  const products = [...staticProducts, ...uniqueDbProducts];

  const title = cluster ? cluster.cluster : subcategory || category || "";
  const eyebrow = cluster ? "Explore" : subcategory ? category : "Collection";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <p className="font-body text-sm text-gold uppercase tracking-widest mb-2">{eyebrow}</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground">{title}</h1>
            <p className="font-body text-muted-foreground mt-4 max-w-xl mx-auto">
              Discover our curated selection of premium {title.toLowerCase()} pieces.
            </p>

            {cluster && (
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {cluster.items.map((i) => (
                  <Link
                    key={i.path}
                    to={i.path}
                    className="px-4 py-1.5 rounded-full border border-border text-xs font-body text-foreground/80 hover:border-gold hover:text-gold transition-colors"
                  >
                    {i.name}
                  </Link>
                ))}
              </div>
            )}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <p className="font-body text-muted-foreground text-lg">
                {loading ? "Loading products..." : "No products found in this category."}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CategoryPage;
