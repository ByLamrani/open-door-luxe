import { catalog } from "./catalog";

export interface ExploreItem {
  name: string;
  path: string;
  translationKey?: string;
}

export interface ExploreCluster {
  cluster: string;
  translationKey: string;
  path: string;
  items: ExploreItem[];
}

// Derived from the single catalog source so navbar, homepage and footer stay in sync.
export const exploreCategories: ExploreCluster[] = catalog.map((c) => ({
  cluster: c.cluster,
  translationKey: c.translationKey,
  path: c.path,
  items: c.items.map((i) => ({ name: i.name, path: i.path })),
}));
