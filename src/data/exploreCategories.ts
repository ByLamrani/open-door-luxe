export interface ExploreItem {
  name: string;
  path: string;
  translationKey?: string;
}

export interface ExploreCluster {
  cluster: string;
  translationKey: string;
  items: ExploreItem[];
}

export const exploreCategories: ExploreCluster[] = [
  {
    cluster: "Luxury & Lifestyle",
    translationKey: "explore.cluster.luxury",
    items: [
      { name: "Fragrance Vault", path: "/fragrances", translationKey: "explore.item.fragranceVault" },
      { name: "Wellness Rituals", path: "/self-care/spa", translationKey: "explore.item.wellnessRituals" },
      { name: "Executive Gift Sets", path: "/collections", translationKey: "explore.item.giftSets" },
      { name: "Limited Drops", path: "/new", translationKey: "explore.item.limitedDrops" },
    ],
  },
  {
    cluster: "Tech & Gear",
    translationKey: "explore.cluster.tech",
    items: [
      { name: "Smart Accessories", path: "/watches", translationKey: "explore.item.smartAccessories" },
      { name: "Horology & Time", path: "/watches/men", translationKey: "explore.item.horology" },
      { name: "Home Electronics", path: "/home-electronics", translationKey: "explore.item.homeElectronics" },
    ],
  },
  {
    cluster: "Wellness & Beauty",
    translationKey: "explore.cluster.wellness",
    items: [
      { name: "The Grooming Suite", path: "/self-care/tondeuse", translationKey: "explore.item.grooming" },
      { name: "Organic Apothecary", path: "/self-care/massage", translationKey: "explore.item.apothecary" },
      { name: "Personalized Self-Care", path: "/self-care", translationKey: "explore.item.selfCare" },
    ],
  },
  {
    cluster: "Art & Living",
    translationKey: "explore.cluster.art",
    items: [
      { name: "Atmospheric Living", path: "/air-diffusers", translationKey: "explore.item.atmospheric" },
      { name: "Home Decor", path: "/home-decor", translationKey: "explore.item.homeDecor" },
      { name: "Lighting & Ambience", path: "/lighting", translationKey: "explore.item.lighting" },
    ],
  },
  {
    cluster: "Home & Living",
    translationKey: "explore.cluster.home",
    items: [
      { name: "Housing Furniture", path: "/housing-furniture", translationKey: "explore.item.furniture" },
      { name: "Kitchen Tools", path: "/kitchen-tools", translationKey: "explore.item.kitchen" },
      { name: "Bedroom Essentials", path: "/bedroom", translationKey: "explore.item.bedroom" },
      { name: "Bath & Linen", path: "/bath-linen", translationKey: "explore.item.bath" },
    ],
  },
  {
    cluster: "Fashion & Accessories",
    translationKey: "explore.cluster.fashion",
    items: [
      { name: "Bags & Leather", path: "/bags", translationKey: "explore.item.bags" },
      { name: "Jewelry", path: "/jewelry", translationKey: "explore.item.jewelry" },
      { name: "Eyewear", path: "/eyewear", translationKey: "explore.item.eyewear" },
    ],
  },
];
