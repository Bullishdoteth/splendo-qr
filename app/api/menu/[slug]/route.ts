import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { location, category, menuItem } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Fetch location
    const [foundLocation] = await db
      .select()
      .from(location)
      .where(eq(location.slug, slug));

    if (!foundLocation) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    // Fetch categories
    const categoriesList = await db
      .select()
      .from(category)
      .orderBy(asc(category.sortOrder));

    // Fetch available menu items
    const itemsList = await db
      .select()
      .from(menuItem)
      .where(eq(menuItem.isAvailable, true));

    // Group items by category
    const menuWithItems = categoriesList.map((cat) => {
      const catItems = itemsList.filter((item) => item.categoryId === cat.id);
      return {
        ...cat,
        items: catItems,
      };
    });

    return NextResponse.json({
      location: foundLocation,
      categories: menuWithItems,
    });
  } catch (error: any) {
    console.error("GET /api/menu/[slug] error:", error);
    return NextResponse.json({ error: error?.message || "Failed to load guest menu" }, { status: 500 });
  }
}
