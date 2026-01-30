// Product images imports
import tondeuse1 from "@/assets/products/tondeuse-1.jpeg";
import tondeuse2 from "@/assets/products/tondeuse-2.jpeg";
import tondeuse3 from "@/assets/products/tondeuse-3.jpg";
import tondeuse4 from "@/assets/products/tondeuse-4.jpg";
import tondeuse5 from "@/assets/products/tondeuse-5.jpeg";
import diffuser1 from "@/assets/products/diffuser-1.png";
import diffuser2 from "@/assets/products/diffuser-2.png";
import diffuser3 from "@/assets/products/diffuser-3.png";
import diffuser4 from "@/assets/products/diffuser-4.png";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images: string[];
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
    image: tondeuse1,
    images: [
      tondeuse1,
      tondeuse2,
      tondeuse3,
      tondeuse4,
      tondeuse5,
    ],
    category: "Self-Care",
    subcategory: "Tondeuse",
    description: "Premium gold-plated trimmer with precision blades for the perfect grooming experience. Features adjustable length settings and a powerful motor for smooth, even cuts.",
    isNew: true,
    isFeatured: true,
  },
  {
    id: "tondeuse-2",
    name: "Precision Beard Sculpt",
    price: 89.99,
    image: tondeuse3,
    images: [
      tondeuse3,
      tondeuse1,
      tondeuse2,
      tondeuse4,
      tondeuse5,
    ],
    category: "Self-Care",
    subcategory: "Tondeuse",
    description: "Advanced beard sculpting tool with multiple attachments for versatile styling. Ergonomic design for comfortable grip and precise control.",
    isFeatured: true,
  },
  // Self-Care - SPA
  {
    id: "spa-1",
    name: "Luxury SPA Home Kit",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500",
    images: [
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800",
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800",
      "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800",
    ],
    category: "Self-Care",
    subcategory: "Pack de Soin/SPA",
    description: "Complete home spa experience with premium oils, salts, and aromatherapy essentials. Transform your bathroom into a luxurious retreat.",
    isNew: true,
    isFeatured: true,
  },
  {
    id: "spa-2",
    name: "Rejuvenating Face Set",
    price: 179.99,
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500",
    images: [
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800",
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800",
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800",
      "https://images.unsplash.com/photo-1620756236308-65c3ef5d25f3?w=800",
      "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800",
    ],
    category: "Self-Care",
    subcategory: "Pack de Soin/SPA",
    description: "Anti-aging facial care set with natural ingredients for radiant skin. Includes cleanser, serum, moisturizer, and eye cream.",
  },
  // Self-Care - Massage
  {
    id: "massage-1",
    name: "Deep Tissue Massager",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=500",
    images: [
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800",
      "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800",
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
    ],
    category: "Self-Care",
    subcategory: "Articles de Massage",
    description: "Professional-grade deep tissue massager for muscle relief and relaxation. Multiple speed settings and interchangeable heads.",
    isFeatured: true,
  },
  {
    id: "massage-2",
    name: "Hot Stone Set",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=500",
    images: [
      "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800",
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800",
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
      "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800",
    ],
    category: "Self-Care",
    subcategory: "Articles de Massage",
    description: "Authentic volcanic hot stones for therapeutic massage therapy. Includes heating bag and essential oils.",
  },
  // Fragrances - Men
  {
    id: "frag-men-1",
    name: "Noir Intense EDP",
    price: 189.99,
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=500",
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800",
      "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800",
      "https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=800",
      "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=800",
    ],
    category: "Fragrances",
    subcategory: "For Men",
    description: "Bold and mysterious fragrance with notes of oud, leather, and amber. Long-lasting scent that commands attention.",
    isNew: true,
    isFeatured: true,
  },
  {
    id: "frag-men-2",
    name: "Ocean Breeze Cologne",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=500",
    images: [
      "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=800",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800",
      "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=800",
    ],
    category: "Fragrances",
    subcategory: "For Men",
    description: "Fresh aquatic scent with marine notes and citrus undertones. Perfect for everyday wear.",
  },
  // Fragrances - Women
  {
    id: "frag-women-1",
    name: "Rose Élégante",
    price: 219.99,
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500",
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800",
      "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800",
      "https://images.unsplash.com/photo-1595535873420-a599195b3f4a?w=800",
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800",
    ],
    category: "Fragrances",
    subcategory: "For Women",
    description: "Sophisticated floral bouquet with Moroccan rose and jasmine. An elegant fragrance for the modern woman.",
    isFeatured: true,
  },
  {
    id: "frag-women-2",
    name: "Mystic Amber",
    price: 179.99,
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=500",
    images: [
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800",
      "https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800",
      "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800",
    ],
    category: "Fragrances",
    subcategory: "For Women",
    description: "Warm and sensual fragrance with amber, vanilla, and sandalwood. Perfect for evening occasions.",
    isNew: true,
  },
  // Air Diffusers
  {
    id: "diffuser-1",
    name: "Ceramic Aroma Diffuser",
    price: 79.99,
    image: diffuser1,
    images: [
      diffuser1,
      diffuser2,
      diffuser3,
      diffuser4,
    ],
    category: "Air Diffusers",
    description: "Elegant ceramic diffuser with mood lighting and whisper-quiet operation. Covers up to 500 sq ft.",
    isFeatured: true,
  },
  {
    id: "diffuser-2",
    name: "Smart Home Diffuser",
    price: 149.99,
    image: diffuser2,
    images: [
      diffuser2,
      diffuser1,
      diffuser3,
      diffuser4,
    ],
    category: "Air Diffusers",
    description: "App-controlled smart diffuser with scheduling and intensity settings. Voice assistant compatible.",
    isNew: true,
  },
  {
    id: "diffuser-3",
    name: "Cherry Reed Diffuser",
    price: 49.99,
    image: diffuser3,
    images: [
      diffuser3,
      diffuser1,
      diffuser2,
      diffuser4,
    ],
    category: "Air Diffusers",
    description: "Premium reed diffuser with rich cherry fragrance. Long-lasting scent that fills any room.",
  },
  {
    id: "diffuser-4",
    name: "Peach Paradise Diffuser",
    price: 54.99,
    image: diffuser4,
    images: [
      diffuser4,
      diffuser1,
      diffuser2,
      diffuser3,
    ],
    category: "Air Diffusers",
    description: "Fresh peach-scented reed diffuser with elegant design. Perfect for living rooms and bedrooms.",
    isNew: true,
  },
  // Watches - Men
  {
    id: "watch-men-1",
    name: "Executive Chronograph",
    price: 599.99,
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500",
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800",
    ],
    category: "Watches",
    subcategory: "For Men",
    description: "Swiss-movement chronograph with sapphire crystal and genuine leather strap. Water resistant to 100m.",
    isFeatured: true,
  },
  {
    id: "watch-men-2",
    name: "Minimalist Steel",
    price: 349.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=800",
      "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800",
    ],
    category: "Watches",
    subcategory: "For Men",
    description: "Clean, minimalist design with brushed stainless steel case. Japanese quartz movement.",
    isNew: true,
  },
  // Watches - Women
  {
    id: "watch-women-1",
    name: "Diamond Elegance",
    price: 799.99,
    image: "https://images.unsplash.com/photo-1549972574-8e3e1ed6a347?w=500",
    images: [
      "https://images.unsplash.com/photo-1549972574-8e3e1ed6a347?w=800",
      "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800",
      "https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=800",
      "https://images.unsplash.com/photo-1518131672697-613becd4fab5?w=800",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800",
    ],
    category: "Watches",
    subcategory: "For Women",
    description: "Exquisite timepiece adorned with genuine diamonds and mother of pearl dial. A statement of luxury.",
    isFeatured: true,
  },
  {
    id: "watch-women-2",
    name: "Rose Gold Classic",
    price: 449.99,
    image: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=500",
    images: [
      "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=800",
      "https://images.unsplash.com/photo-1549972574-8e3e1ed6a347?w=800",
      "https://images.unsplash.com/photo-1548169874-53e85f753f1e?w=800",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800",
      "https://images.unsplash.com/photo-1518131672697-613becd4fab5?w=800",
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800",
    ],
    category: "Watches",
    subcategory: "For Women",
    description: "Timeless rose gold design with mesh bracelet and slim profile. Elegant for any occasion.",
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
export const getProductById = (id: string) => products.find(p => p.id === id);
export const getRelatedProducts = (product: Product) => 
  products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
export const getDiverseProducts = () => {
  // Get products from different categories
  const categories = [...new Set(products.map(p => p.category))];
  const diverse: Product[] = [];
  
  categories.forEach(cat => {
    const catProducts = products.filter(p => p.category === cat);
    diverse.push(...catProducts.slice(0, 2));
  });
  
  return diverse.slice(0, 8);
};
