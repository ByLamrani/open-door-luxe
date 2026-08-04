import type { Product } from "./products";

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

interface Seed {
  name: string;
  price: number;
  photos: string[];
  description: string;
  isNew?: boolean;
  isFeatured?: boolean;
  subcategory?: string;
}

const build = (category: string, slug: string, seeds: Seed[]): Product[] =>
  seeds.map((s, i) => ({
    id: `${slug}-${i + 1}`,
    name: s.name,
    price: s.price,
    image: img(s.photos[0]),
    images: s.photos.map((p) => img(p)),
    category,
    subcategory: s.subcategory,
    description: s.description,
    isNew: s.isNew,
    isFeatured: s.isFeatured,
  }));

export const jewelryProducts = build("Jewelry", "jewelry", [
  {
    name: "Obsidian Signet Ring",
    price: 189.99,
    photos: ["photo-1603561591411-07134e71a2a9", "photo-1611591437281-460bfbe1220a"],
    description: "A hand-finished signet ring in blackened sterling silver with a polished obsidian face. Weighted, timeless, and made to be worn every day.",
    isFeatured: true,
    isNew: true,
    subcategory: "Rings",
  },
  {
    name: "Lamra Pearl Drop Earrings",
    price: 149.0,
    photos: ["photo-1535632066927-ab7c9ab60908", "photo-1596944924616-7b38e7cfac36"],
    description: "Freshwater pearls suspended from a slim gold-plated bar. Light enough for all day, striking enough for the evening.",
    isFeatured: true,
    subcategory: "Earrings",
  },
  {
    name: "Monogram Chain Necklace",
    price: 219.5,
    photos: ["photo-1599643478518-a784e5dc4c8f", "photo-1611652022419-a9419f74343d"],
    description: "A fine 18k gold-plated curb chain with the LX monogram pendant. Adjustable 45–50 cm length with a secure lobster clasp.",
    isNew: true,
    subcategory: "Necklaces",
  },
  {
    name: "Brushed Steel Cuff Bracelet",
    price: 129.99,
    photos: ["photo-1611085583191-a3b181a88401", "photo-1602173574767-37ac01994b2a"],
    description: "A minimal open cuff in brushed surgical steel. Hypoallergenic, water resistant and sized to sit flush against the wrist.",
    subcategory: "Bracelets",
  },
]);

export const extraProducts: Product[] = [
  ...jewelryProducts,

  ...build("Bags", "bags", [
    {
      name: "Noir Leather Weekender",
      price: 389.0,
      photos: ["photo-1553062407-98eeb64c6a62", "photo-1547949003-9792a18a2601"],
      description: "Full-grain leather weekender with a suede-lined interior, brass hardware and a detachable shoulder strap.",
      isFeatured: true,
    },
    { name: "Structured Tote in Onyx", price: 249.0, photos: ["photo-1584917865442-de89df76afd3", "photo-1594223274512-ad4803739b7c"], description: "A clean-lined tote that holds a 15\" laptop without losing its shape. Magnetic closure and interior organiser pockets." },
    { name: "Minimal Crossbody Pouch", price: 139.0, photos: ["photo-1591561954557-26941169b49e", "photo-1548036328-c9fa89d128fa"], description: "Compact everyday crossbody in pebbled leather with an adjustable webbing strap.", isNew: true },
    { name: "Executive Slim Briefcase", price: 429.0, photos: ["photo-1590874103328-eac38a683ce7", "photo-1524498250077-390f9e378fc0"], description: "A slim profile briefcase in matte leather, built for documents, a laptop and very little else." },
  ]),

  ...build("Eyewear", "eyewear", [
    { name: "Aviator Noir Sunglasses", price: 179.0, photos: ["photo-1572635196237-14b3f281503f", "photo-1511499767150-a48a237f0083"], description: "Classic aviator silhouette with polarised grey lenses and a matte black titanium frame.", isFeatured: true },
    { name: "Acetate Round Frames", price: 149.0, photos: ["photo-1574258495973-f010dfbb5371", "photo-1508296695146-257a814070b4"], description: "Hand-polished acetate rounds with anti-reflective, blue-light filtering lenses.", isNew: true },
    { name: "Sculpted Cat-Eye", price: 195.0, photos: ["photo-1577803645773-f96470509666", "photo-1473496169904-658ba7c44d8a"], description: "A softly sculpted cat-eye in tortoiseshell acetate with gradient lenses." },
    { name: "Titanium Reading Glasses", price: 119.0, photos: ["photo-1591076482161-42ce6da69f67", "photo-1620331311520-246422fd82f9"], description: "Featherweight titanium readers with flexible hinges and a slim protective case." },
  ]),

  ...build("Home Electronics", "home-electronics", [
    { name: "Acoustic Linen Speaker", price: 299.0, photos: ["photo-1545454675-3531b543be5d", "photo-1608043152269-423dbba4e7e1"], description: "A room-filling wireless speaker wrapped in woven linen, with 20-hour battery life and multi-room pairing.", isFeatured: true },
    { name: "Ambient Sound Machine", price: 129.0, photos: ["photo-1558089687-f282ffcbc126", "photo-1546435770-a3e426bf472b"], description: "Twenty-four natural soundscapes with a warm night light and gentle wake-up mode.", isNew: true },
    { name: "Smart Espresso Kettle", price: 219.0, photos: ["photo-1517668808822-9ebb02f2a0e6", "photo-1495474472287-4d71bcdd2085"], description: "Precise temperature control to the degree with a gooseneck spout for pour-over control." },
    { name: "Charging Valet Station", price: 149.0, photos: ["photo-1585123334904-845d60e97b29", "photo-1610945415295-d9bbf067e59c"], description: "Walnut and leather charging dock for phone, watch and earbuds — cables hidden underneath." },
  ]),

  ...build("Home Decor", "home-decor", [
    { name: "Hand-Thrown Stoneware Vase", price: 119.0, photos: ["photo-1578500494198-246f612d3b3d", "photo-1602874801007-bd458bb1b8b6"], description: "A matte stoneware vase thrown by hand, each with slight variations in glaze and form.", isFeatured: true },
    { name: "Marble & Brass Tray", price: 99.0, photos: ["photo-1616486338812-3dadae4b4ace", "photo-1567016432779-094069958ea5"], description: "Carrara marble serving tray with slim brass handles for the entryway or bar cart." },
    { name: "Woven Wall Hanging", price: 159.0, photos: ["photo-1513519245088-0e12902e5a38", "photo-1615529182904-14819c35db37"], description: "Hand-woven wool wall piece in undyed ivory and charcoal on an oak dowel.", isNew: true },
    { name: "Sculptural Bookends", price: 89.0, photos: ["photo-1524758631624-e2822e304c36", "photo-1493663284031-b7e3aefcae8e"], description: "A pair of solid cast bookends with a soft-touch matte finish and felted base." },
  ]),

  ...build("Lighting", "lighting", [
    { name: "Alabaster Table Lamp", price: 239.0, photos: ["photo-1507473885765-e6ed057f782c", "photo-1543198126-a4d9c5d3bfe2"], description: "A softly glowing alabaster shade on a blackened brass base, dimmable to candlelight.", isFeatured: true },
    { name: "Linear Pendant Light", price: 329.0, photos: ["photo-1524484485831-a92ffc0de03f", "photo-1565814329452-e1efa11c5b89"], description: "A slim linear pendant for dining tables and kitchen islands, with warm 2700K LEDs." },
    { name: "Portable Ember Lantern", price: 129.0, photos: ["photo-1513506003901-1e6a229e2d15", "photo-1519710164239-da123dc03ef4"], description: "Rechargeable cordless lantern with three warmth settings and up to 12 hours of light.", isNew: true },
    { name: "Arc Floor Lamp", price: 449.0, photos: ["photo-1540932239986-30128078f3c5", "photo-1517991104123-1d56a6e81ed9"], description: "A sweeping arc floor lamp in matte black with a marble counterweight base." },
  ]),

  ...build("Housing Furniture", "housing-furniture", [
    { name: "Boucle Lounge Chair", price: 899.0, photos: ["photo-1567538096630-e0c55bd6374c", "photo-1586023492125-27b2c045efd7"], description: "A deep-seated lounge chair upholstered in ivory bouclé on a solid oak frame.", isFeatured: true },
    { name: "Solid Oak Console", price: 749.0, photos: ["photo-1533090161767-e6ffed986c88", "photo-1538688525198-9b88f6f53126"], description: "A slim console in solid white oak with hand-cut joinery and a hard-wax oil finish." },
    { name: "Travertine Coffee Table", price: 1090.0, photos: ["photo-1555041469-a586c61ea9bc", "photo-1493663284031-b7e3aefcae8e"], description: "A monolithic travertine coffee table, honed smooth and sealed for daily use.", isNew: true },
    { name: "Cane Sideboard", price: 980.0, photos: ["photo-1550226891-ef816aed4a98", "photo-1503602642458-232111445657"], description: "Walnut sideboard with woven cane doors and soft-close adjustable shelving." },
  ]),

  ...build("Kitchen Tools", "kitchen-tools", [
    { name: "Damascus Chef's Knife", price: 289.0, photos: ["photo-1593618998160-e34014e67546", "photo-1566454419290-57a0589c9b17"], description: "67-layer Damascus steel chef's knife with a stabilised wood handle and a 15° edge.", isFeatured: true },
    { name: "Cast Iron Braiser", price: 219.0, photos: ["photo-1585515320310-259814833e62", "photo-1584990347449-a40a8dd6142b"], description: "Enamelled cast iron braiser that moves from stovetop to oven to table." },
    { name: "Olive Wood Board Set", price: 99.0, photos: ["photo-1591261730799-ee4e6c2d16d7", "photo-1556910103-1c02745aae4d"], description: "A trio of olive wood boards for prep, cheese and bread — each grain pattern unique.", isNew: true },
    { name: "Precision Pour Scale", price: 89.0, photos: ["photo-1516684669134-de6f7c473a2a", "photo-1495474472287-4d71bcdd2085"], description: "0.1g precision kitchen scale with built-in brew timer and a wipe-clean glass top." },
  ]),

  ...build("Bedroom", "bedroom", [
    { name: "Washed Linen Duvet Set", price: 279.0, photos: ["photo-1522771739844-6a9f6d5f14af", "photo-1560448204-e02f11c3d0e2"], description: "Stonewashed European flax linen duvet cover with two pillowcases. Softer with every wash.", isFeatured: true },
    { name: "Cloud Down Pillow", price: 129.0, photos: ["photo-1584100936595-c0654b55a2e6", "photo-1631049307264-da0ec9d70304"], description: "Responsibly sourced down pillow with a 400-thread-count cotton sateen shell." },
    { name: "Oak Nightstand", price: 349.0, photos: ["photo-1595428774223-ef52624120d2", "photo-1540518614846-7eded433c457"], description: "A compact oak nightstand with a single soft-close drawer and a cable pass-through.", isNew: true },
    { name: "Weighted Cotton Throw", price: 189.0, photos: ["photo-1616486338812-3dadae4b4ace", "photo-1543248939-4296e1fea89b"], description: "A 7kg knitted weighted throw in breathable cotton for calmer, deeper rest." },
  ]),

  ...build("Bath & Linen", "bath-linen", [
    { name: "Turkish Cotton Towel Set", price: 149.0, photos: ["photo-1600369672770-985fd30004eb", "photo-1620916566398-39f1143ab7be"], description: "Long-staple Turkish cotton towels — quick drying, extra absorbent, and beautifully heavy.", isFeatured: true },
    { name: "Waffle Weave Bathrobe", price: 169.0, photos: ["photo-1631889993959-41b4e9c6e3c5", "photo-1585421514738-01798e348b17"], description: "A lightweight waffle-weave robe in organic cotton with deep patch pockets." },
    { name: "Stone Soap Dish & Dispenser", price: 79.0, photos: ["photo-1584305574647-0cc949a2bb9f", "photo-1596178060810-72f53ce9a65c"], description: "Matching soap dish and pump in honed grey stone with a non-slip base.", isNew: true },
    { name: "Ribbed Bath Mat", price: 89.0, photos: ["photo-1620916297893-e4b9b0c1a8a5", "photo-1584622650111-993a426fbf0a"], description: "A dense ribbed cotton bath mat with a grippy backing that stays put." },
  ]),
];
