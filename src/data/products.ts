export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  subcategory?: string;
  description: string;
  isNew?: boolean;
  isFeatured?: boolean;
}

export const products: Product[] = [
  // Self-Care - Tondeuse
  {
    id: "tondeuse-1",
    name: "Professional Gold Trimmer",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=500",
    category: "Self-Care",
    subcategory: "Tondeuse",
    description: "Premium gold-plated trimmer with precision blades for the perfect grooming experience.",
    isNew: true,
    isFeatured: true,
  },
  {
    id: "tondeuse-2",
    name: "Precision Beard Sculpt",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=500",
    category: "Self-Care",
    subcategory: "Tondeuse",
    description: "Advanced beard sculpting tool with multiple attachments for versatile styling.",
    isFeatured: true,
  },
  // Self-Care - SPA
  {
    id: "spa-1",
    name: "Luxury SPA Home Kit",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500",
    category: "Self-Care",
    subcategory: "Pack de Soin/SPA",
    description: "Complete home spa experience with premium oils, salts, and aromatherapy essentials.",
    isNew: true,
    isFeatured: true,
  },
  {
    id: "spa-2",
    name: "Rejuvenating Face Set",
    price: 179.99,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500",
    category: "Self-Care",
    subcategory: "Pack de Soin/SPA",
    description: "Anti-aging facial care set with natural ingredients for radiant skin.",
  },
  // Self-Care - Massage
  {
    id: "massage-1",
    name: "Deep Tissue Massager",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=500",
    category: "Self-Care",
    subcategory: "Articles de Massage",
    description: "Professional-grade deep tissue massager for muscle relief and relaxation.",
    isFeatured: true,
  },
  {
    id: "massage-2",
    name: "Hot Stone Set",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=500",
    category: "Self-Care",
    subcategory: "Articles de Massage",
    description: "Authentic volcanic hot stones for therapeutic massage therapy.",
  },
  // Fragrances - Men
  {
    id: "frag-men-1",
    name: "Noir Intense EDP",
    price: 189.99,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500",
    category: "Fragrances",
    subcategory: "For Men",
    description: "Bold and mysterious fragrance with notes of oud, leather, and amber.",
    isNew: true,
    isFeatured: true,
  },
  {
    id: "frag-men-2",
    name: "Ocean Breeze Cologne",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=500",
    category: "Fragrances",
    subcategory: "For Men",
    description: "Fresh aquatic scent with marine notes and citrus undertones.",
  },
  // Fragrances - Women
  {
    id: "frag-women-1",
    name: "Rose Élégante",
    price: 219.99,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500",
    category: "Fragrances",
    subcategory: "For Women",
    description: "Sophisticated floral bouquet with Moroccan rose and jasmine.",
    isFeatured: true,
  },
  {
    id: "frag-women-2",
    name: "Mystic Amber",
    price: 179.99,
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500",
    category: "Fragrances",
    subcategory: "For Women",
    description: "Warm and sensual fragrance with amber, vanilla, and sandalwood.",
    isNew: true,
  },
  // Air Diffusers
  {
    id: "diffuser-1",
    name: "Ceramic Aroma Diffuser",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500",
    category: "Air Diffusers",
    description: "Elegant ceramic diffuser with mood lighting and whisper-quiet operation.",
    isFeatured: true,
  },
  {
    id: "diffuser-2",
    name: "Smart Home Diffuser",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1602928309823-85c4e05ecc79?w=500",
    category: "Air Diffusers",
    description: "App-controlled smart diffuser with scheduling and intensity settings.",
    isNew: true,
  },
  // Watches - Men
  {
    id: "watch-men-1",
    name: "Executive Chronograph",
    price: 599.99,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500",
    category: "Watches",
    subcategory: "For Men",
    description: "Swiss-movement chronograph with sapphire crystal and leather strap.",
    isFeatured: true,
  },
  {
    id: "watch-men-2",
    name: "Minimalist Steel",
    price: 349.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    category: "Watches",
    subcategory: "For Men",
    description: "Clean, minimalist design with brushed stainless steel case.",
    isNew: true,
  },
  // Watches - Women
  {
    id: "watch-women-1",
    name: "Diamond Elegance",
    price: 799.99,
    image: "https://images.unsplash.com/photo-1549972574-8e3e1ed6a347?w=500",
    category: "Watches",
    subcategory: "For Women",
    description: "Exquisite timepiece adorned with genuine diamonds and mother of pearl dial.",
    isFeatured: true,
  },
  {
    id: "watch-women-2",
    name: "Rose Gold Classic",
    price: 449.99,
    image: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=500",
    category: "Watches",
    subcategory: "For Women",
    description: "Timeless rose gold design with mesh bracelet and slim profile.",
    isNew: true,
  },
];

export const getFeaturedProducts = () => products.filter(p => p.isFeatured);
export const getNewProducts = () => products.filter(p => p.isNew);
export const getProductsByCategory = (category: string) => 
  products.filter(p => p.category.toLowerCase() === category.toLowerCase());
export const getProductsBySubcategory = (category: string, subcategory: string) => 
  products.filter(p => 
    p.category.toLowerCase() === category.toLowerCase() && 
    p.subcategory?.toLowerCase() === subcategory.toLowerCase()
  );
