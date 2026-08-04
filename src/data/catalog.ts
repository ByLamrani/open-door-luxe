// Single source of truth for the storefront category structure.
// The 6 "Explore" clusters and their sub-categories are used by the navbar,
// the homepage, the footer and the router.

export interface CatalogSub {
  name: string;
  path: string;
  /** Product category used in src/data/products.ts */
  category: string;
  subcategory?: string;
}

export interface CatalogCluster {
  cluster: string;
  path: string;
  translationKey: string;
  image: string;
  items: CatalogSub[];
}

const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const catalog: CatalogCluster[] = [
  {
    cluster: "Luxury & Lifestyle",
    path: "/luxury-lifestyle",
    translationKey: "explore.cluster.luxury",
    image: u("photo-1541643600914-78b084683601"),
    items: [
      { name: "Fragrance Vault", path: "/fragrances", category: "Fragrances" },
      { name: "Fragrances for Men", path: "/fragrances/men", category: "Fragrances", subcategory: "For Men" },
      { name: "Fragrances for Women", path: "/fragrances/women", category: "Fragrances", subcategory: "For Women" },
      { name: "Wellness Rituals", path: "/self-care/spa", category: "Self-Care", subcategory: "Pack de Soin/SPA" },
    ],
  },
  {
    cluster: "Tech & Gear",
    path: "/tech-gear",
    translationKey: "explore.cluster.tech",
    image: u("photo-1524592094714-0f0654e20314"),
    items: [
      { name: "Watches", path: "/watches", category: "Watches" },
      { name: "Watches for Men", path: "/watches/men", category: "Watches", subcategory: "For Men" },
      { name: "Watches for Women", path: "/watches/women", category: "Watches", subcategory: "For Women" },
      { name: "Home Electronics", path: "/home-electronics", category: "Home Electronics" },
    ],
  },
  {
    cluster: "Wellness & Beauty",
    path: "/wellness-beauty",
    translationKey: "explore.cluster.wellness",
    image: u("photo-1544161515-4ab6ce6db874"),
    items: [
      { name: "Self-Care", path: "/self-care", category: "Self-Care" },
      { name: "The Grooming Suite", path: "/self-care/tondeuse", category: "Self-Care", subcategory: "Tondeuse" },
      { name: "Massage & Recovery", path: "/self-care/massage", category: "Self-Care", subcategory: "Articles de Massage" },
    ],
  },
  {
    cluster: "Art & Living",
    path: "/art-living",
    translationKey: "explore.cluster.art",
    image: u("photo-1608571423902-eed4a5ad8108"),
    items: [
      { name: "Air Diffusers", path: "/air-diffusers", category: "Air Diffusers" },
      { name: "Home Decor", path: "/home-decor", category: "Home Decor" },
      { name: "Lighting & Ambience", path: "/lighting", category: "Lighting" },
    ],
  },
  {
    cluster: "Home & Living",
    path: "/home-living",
    translationKey: "explore.cluster.home",
    image: u("photo-1567538096630-e0c55bd6374c"),
    items: [
      { name: "Housing Furniture", path: "/housing-furniture", category: "Housing Furniture" },
      { name: "Kitchen Tools", path: "/kitchen-tools", category: "Kitchen Tools" },
      { name: "Bedroom Essentials", path: "/bedroom", category: "Bedroom" },
      { name: "Bath & Linen", path: "/bath-linen", category: "Bath & Linen" },
    ],
  },
  {
    cluster: "Fashion & Accessories",
    path: "/fashion-accessories",
    translationKey: "explore.cluster.fashion",
    image: u("photo-1553062407-98eeb64c6a62"),
    items: [
      { name: "Jewelry", path: "/jewelry", category: "Jewelry" },
      { name: "Bags & Leather", path: "/bags", category: "Bags" },
      { name: "Eyewear", path: "/eyewear", category: "Eyewear" },
    ],
  },
];

/** All product categories that belong to a cluster (used by cluster landing pages). */
export const clusterCategories = (path: string): string[] => {
  const c = catalog.find((x) => x.path === path);
  return c ? Array.from(new Set(c.items.map((i) => i.category))) : [];
};

/** Flat list of every leaf category route, for the router. */
export const catalogRoutes = catalog.flatMap((c) => c.items);
