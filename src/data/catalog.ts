// Single source of truth for the storefront category structure.
// The 6 "Explore" clusters and their sub-categories are used by the navbar,
// the homepage, the footer and the router.

export interface CatalogSub {
  name: string;
  path: string;
  /** Product category used in src/data/products.ts */
  category: string;
  subcategory?: string;
  /** Short line shown under the page title */
  blurb?: string;
}

export interface CatalogCluster {
  cluster: string;
  path: string;
  translationKey: string;
  image: string;
  blurb: string;
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
    blurb: "Signature scents and refined rituals for those who treat every day as an occasion.",
    items: [
      { name: "Fragrance Vault", path: "/fragrances", category: "Fragrances", blurb: "A vault of rare perfumes — orientals, ouds and modern florals, bottled with intent." },
      { name: "Fragrances for Men", path: "/fragrances/men", category: "Fragrances", subcategory: "For Men", blurb: "Woody, spiced and leather-led compositions built for lasting presence." },
      { name: "Fragrances for Women", path: "/fragrances/women", category: "Fragrances", subcategory: "For Women", blurb: "Luminous florals, warm ambers and gourmand trails made to be remembered." },
      { name: "Wellness Rituals", path: "/self-care/spa", category: "Self-Care", subcategory: "Pack de Soin/SPA", blurb: "Complete spa packs that turn your bathroom into a private hammam." },
    ],
  },
  {
    cluster: "Tech & Gear",
    path: "/tech-gear",
    translationKey: "explore.cluster.tech",
    image: u("photo-1524592094714-0f0654e20314"),
    blurb: "Precision timepieces and smart home electronics engineered to be worn and used daily.",
    items: [
      { name: "Watches", path: "/watches", category: "Watches", blurb: "Automatic and quartz timepieces chosen for craftsmanship, not hype." },
      { name: "Watches for Men", path: "/watches/men", category: "Watches", subcategory: "For Men", blurb: "Bold cases, steel bracelets and dive-ready builds with everyday versatility." },
      { name: "Watches for Women", path: "/watches/women", category: "Watches", subcategory: "For Women", blurb: "Slim profiles, mother-of-pearl dials and jewellery-grade finishing." },
      { name: "Home Electronics", path: "/home-electronics", category: "Home Electronics", blurb: "Quietly powerful devices that make the home smarter without shouting about it." },
    ],
  },
  {
    cluster: "Wellness & Beauty",
    path: "/wellness-beauty",
    translationKey: "explore.cluster.wellness",
    image: u("photo-1544161515-4ab6ce6db874"),
    blurb: "Grooming tools and recovery essentials for a routine that actually feels like care.",
    items: [
      { name: "Self-Care", path: "/self-care", category: "Self-Care", blurb: "Everything your daily ritual needs, from grooming to deep recovery." },
      { name: "The Grooming Suite", path: "/self-care/tondeuse", category: "Self-Care", subcategory: "Tondeuse", blurb: "Professional clippers and trimmers with salon-grade blades and battery life." },
      { name: "Massage & Recovery", path: "/self-care/massage", category: "Self-Care", subcategory: "Articles de Massage", blurb: "Massage guns, rollers and therapy tools to release tension after long days." },
    ],
  },
  {
    cluster: "Art & Living",
    path: "/art-living",
    translationKey: "explore.cluster.art",
    image: u("photo-1608571423902-eed4a5ad8108"),
    blurb: "Scent, light and objects that shape the atmosphere of a room before anyone speaks.",
    items: [
      { name: "Air Diffusers", path: "/air-diffusers", category: "Air Diffusers", blurb: "Ultrasonic and nebulising diffusers that carry fragrance through every corner." },
      { name: "Home Decor", path: "/home-decor", category: "Home Decor", blurb: "Sculptural pieces and artisanal accents with a distinctly Moroccan soul." },
      { name: "Lighting & Ambience", path: "/lighting", category: "Lighting", blurb: "Warm, layered lighting designed to flatter a space from dusk onwards." },
    ],
  },
  {
    cluster: "Home & Living",
    path: "/home-living",
    translationKey: "explore.cluster.home",
    image: u("photo-1567538096630-e0c55bd6374c"),
    blurb: "Furniture, kitchen tools and linens selected for comfort that lasts years, not seasons.",
    items: [
      { name: "Housing Furniture", path: "/housing-furniture", category: "Housing Furniture", blurb: "Solid, considered furniture that anchors a room without crowding it." },
      { name: "Kitchen Tools", path: "/kitchen-tools", category: "Kitchen Tools", blurb: "Chef-grade tools and cookware that make cooking at home genuinely enjoyable." },
      { name: "Bedroom Essentials", path: "/bedroom", category: "Bedroom", blurb: "Everything that makes the bedroom the calmest room in the house." },
      { name: "Bath & Linen", path: "/bath-linen", category: "Bath & Linen", blurb: "Dense cotton towels and soft linens with a hotel-suite finish." },
    ],
  },
  {
    cluster: "Fashion & Accessories",
    path: "/fashion-accessories",
    translationKey: "explore.cluster.fashion",
    image: u("photo-1553062407-98eeb64c6a62"),
    blurb: "Jewellery, leather and eyewear that finish a look with quiet confidence.",
    items: [
      { name: "Jewelry", path: "/jewelry", category: "Jewelry", blurb: "Gold-toned, silver and stone-set pieces made to be layered and lived in." },
      { name: "Bags & Leather", path: "/bags", category: "Bags", blurb: "Full-grain leather goods that age beautifully with every journey." },
      { name: "Eyewear", path: "/eyewear", category: "Eyewear", blurb: "Frames and shades with sharp silhouettes and serious lens quality." },
    ],
  },
];

/** All product categories that belong to a cluster (used by cluster landing pages). */
export const clusterCategories = (path: string): string[] => {
  const c = catalog.find((x) => x.path === path);
  return c ? Array.from(new Set(c.items.map((i) => i.category))) : [];
};

/** Find the cluster that owns a given leaf path (used to keep sibling chips visible). */
export const findClusterByItemPath = (path: string): CatalogCluster | undefined =>
  catalog.find((c) => c.items.some((i) => i.path === path));

/** Flat list of every leaf category route, for the router. */
export const catalogRoutes = catalog.flatMap((c) => c.items);
