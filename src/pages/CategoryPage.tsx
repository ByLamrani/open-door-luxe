import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { getProductsByCategory, getProductsBySubcategory, products as allProducts, Product } from "@/data/products";
import { catalog, findClusterByItemPath } from "@/data/catalog";

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
  const location = useLocation();

  const cluster = clusterPath ? catalog.find((c) => c.path === clusterPath) : undefined;
  /** Cluster that owns the current leaf page, so sibling chips stay visible. */
  const parentCluster = cluster ?? findClusterByItemPath(location.pathname);
  const currentItem = parentCluster?.items.find((i) => i.path === location.pathname);


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

  const title = cluster ? cluster.cluster : currentItem?.name || subcategory || category || "";
  const eyebrow = cluster ? "Explore" : parentCluster ? parentCluster.cluster : subcategory ? category : "Collection";
  const blurb =
    (cluster ? cluster.blurb : currentItem?.blurb) ||
    `Discover our curated selection of premium ${title.toLowerCase()} pieces.`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <p className="font-body text-sm text-gold uppercase tracking-widest mb-2">{eyebrow}</p>
            <h1 className="font-display text-4xl md:text-5xl text-foreground">{title}</h1>
            <p className="font-body text-muted-foreground mt-4 max-w-xl mx-auto">{blurb}</p>

            {parentCluster && (
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {parentCluster.items.map((i) => {
                  const active = i.path === location.pathname;
                  return (
                    <Link
                      key={i.path}
                      to={i.path}
                      aria-current={active ? "page" : undefined}
                      className={`px-4 py-1.5 rounded-full border text-xs font-body transition-colors ${
                        active
                          ? "bg-foreground text-background border-foreground"
                          : "border-border text-foreground/80 hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {i.name}
                    </Link>
                  );
                })}
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
