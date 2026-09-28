import { unstable_cache } from "next/cache";
import { db } from "@/lib/db/db";
import { category, menuItem } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export interface MenuItemData {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string | null;
  price: number;
  prepTime: string;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  items: MenuItemData[];
}

/**
 * Aggressively caches menu data on the Next.js server level using `unstable_cache`.
 * A guest request will serve this cached menu payload with zero database queries.
 * Invalidated via `revalidateTag("menu-data")` whenever an admin modifies items or categories.
 */
const fetchDirectMenuData = async (): Promise<CategoryData[]> => {
  const categoriesList = await db
    .select()
    .from(category)
    .where(eq(category.isActive, true))
    .orderBy(asc(category.sortOrder));

  const itemsList = await db
    .select()
    .from(menuItem)
    .where(eq(menuItem.isAvailable, true))
    .orderBy(asc(menuItem.sortOrder));

  const hasImage = (url: string | null | undefined) =>
    Boolean(url && url.trim().length > 0);

  return categoriesList.map((cat) => {
    const catItems = itemsList.filter((item) => item.categoryId === cat.id);
    catItems.sort((a, b) => {
      const imgA = hasImage(a.imageUrl);
      const imgB = hasImage(b.imageUrl);
      if (imgA && !imgB) return -1;
      if (!imgA && imgB) return 1;
      return a.sortOrder - b.sortOrder;
    });

    return {
      ...cat,
      items: catItems,
    };
  });
};

/**
 * Aggressively caches menu data on the Next.js server level using `unstable_cache`.
 * A guest request will serve this cached menu payload with zero database queries.
 * Invalidated via `revalidateTag("menu-data")` whenever an admin modifies items or categories.
 */
export const getCachedMenuData = unstable_cache(
  fetchDirectMenuData,
  ["guest-active-menu-data"],
  {
    revalidate: 3600, // 1 hour SWR fallback
    tags: ["menu-data"],
  }
);

/**
 * Safe wrapper that attempts cached menu retrieval and falls back to direct DB queries
 * if Next.js data cache exceeds memory limits (2MB) or socket disconnects occur.
 */
export async function getMenuData(): Promise<CategoryData[]> {
  try {
    return await getCachedMenuData();
  } catch (error) {
    console.warn("unstable_cache bypass/fallback to direct database query:", error);
    return await fetchDirectMenuData();
  }
}

