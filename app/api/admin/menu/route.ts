import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db/db";
import { category, menuItem } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

// GET all categories and menu items
export async function GET() {
  try {
    const categoriesList = await db
      .select()
      .from(category)
      .orderBy(asc(category.sortOrder));

    const itemsList = await db
      .select()
      .from(menuItem)
      .orderBy(asc(menuItem.sortOrder));

    return NextResponse.json({
      categories: categoriesList,
      items: itemsList,
    });
  } catch (error: any) {
    console.error("GET /api/admin/menu error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch menu data" }, { status: 500 });
  }
}

// POST create category or menu item
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.type === "category") {
      const { name, description, sortOrder } = body;
      if (!name) {
        return NextResponse.json({ error: "Category name is required" }, { status: 400 });
      }

      const id = "cat_" + Date.now();
      const [newCategory] = await db.insert(category).values({
        id,
        name,
        description: description || null,
        sortOrder: sortOrder !== undefined ? parseInt(String(sortOrder), 10) : 99,
      }).returning();

      revalidateTag("menu-data", "max");
      return NextResponse.json({ category: newCategory });
    }

    // Creating menu item
    const { categoryId, title, subtitle, price, prepTime, imageUrl, isAvailable, isFeatured, sortOrder } = body;

    if (!categoryId || !title || price === undefined) {
      return NextResponse.json({ error: "Category, title, and price are required" }, { status: 400 });
    }

    const id = "item_" + Math.random().toString(36).substring(2, 11);
    const parsedPrice = parseInt(String(price), 10);

    const [newItem] = await db.insert(menuItem).values({
      id,
      categoryId,
      title,
      subtitle: subtitle || null,
      price: isNaN(parsedPrice) ? 0 : parsedPrice,
      prepTime: prepTime || "15-20 mins",
      imageUrl: imageUrl || null,
      isAvailable: isAvailable ?? true,
      isFeatured: isFeatured ?? false,
      sortOrder: sortOrder !== undefined ? parseInt(String(sortOrder), 10) : 0,
    }).returning();

    revalidateTag("menu-data", "max");
    return NextResponse.json({ item: newItem });
  } catch (error: any) {
    console.error("POST /api/admin/menu error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create menu resource" }, { status: 500 });
  }
}

// PUT update menu item
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, subtitle, price, prepTime, imageUrl, isAvailable, isFeatured, sortOrder, categoryId } = body;

    if (!id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (title !== undefined) updateData.title = title;
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (price !== undefined) updateData.price = parseInt(String(price), 10);
    if (prepTime !== undefined) updateData.prepTime = prepTime;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(String(sortOrder), 10);
    if (categoryId !== undefined) updateData.categoryId = categoryId;

    const [updatedItem] = await db
      .update(menuItem)
      .set(updateData)
      .where(eq(menuItem.id, id))
      .returning();

    revalidateTag("menu-data", "max");
    return NextResponse.json({ item: updatedItem });
  } catch (error: any) {
    console.error("PUT /api/admin/menu error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update menu item" }, { status: 500 });
  }
}

// DELETE menu item or category
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "item";

    if (!id) {
      return NextResponse.json({ error: "Resource ID is required" }, { status: 400 });
    }

    if (type === "category") {
      await db.delete(category).where(eq(category.id, id));
    } else {
      await db.delete(menuItem).where(eq(menuItem.id, id));
    }

    revalidateTag("menu-data", "max");
    return NextResponse.json({ success: true, message: `${type} deleted successfully` });
  } catch (error: any) {
    console.error("DELETE /api/admin/menu error:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete resource" }, { status: 500 });
  }
}

