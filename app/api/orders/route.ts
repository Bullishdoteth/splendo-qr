import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { guestOrder, guestOrderItem, location, menuItem } from "@/lib/db/schema";
import { desc, eq, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const ordersList = await db
      .select()
      .from(guestOrder)
      .orderBy(desc(guestOrder.createdAt));

    const ordersWithItems = await Promise.all(
      ordersList.map(async (ord) => {
        const items = await db
          .select()
          .from(guestOrderItem)
          .where(eq(guestOrderItem.orderId, ord.id));
        return {
          ...ord,
          items,
        };
      })
    );

    return NextResponse.json({ orders: ordersWithItems });
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { locationId, locationName, items, notes, specialInstructions } = body;

    const guestNotes = notes || specialInstructions || null;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order items are required" }, { status: 400 });
    }

    // 1. Validate Location
    let foundLocationName = locationName || "Room Service";
    let validLocationId: string | null = locationId || null;

    if (locationId) {
      const [locRecord] = await db
        .select()
        .from(location)
        .where(eq(location.id, locationId));

      if (!locRecord) {
        // Fallback check by slug
        const [locBySlug] = await db
          .select()
          .from(location)
          .where(eq(location.slug, locationId));
        if (locBySlug) {
          validLocationId = locBySlug.id;
          foundLocationName = locBySlug.name;
        } else {
          return NextResponse.json({ error: "Invalid or inactive hotel location" }, { status: 400 });
        }
      } else {
        foundLocationName = locRecord.name;
        validLocationId = locRecord.id;
      }
    }

    // 2. Extract item requests
    const itemRequests: { menuItemId: string; quantity: number; title?: string }[] = items.map((i: any) => ({
      menuItemId: i.menuItemId || i.id || i.itemId,
      quantity: Math.max(1, parseInt(String(i.quantity || 1), 10)),
      title: i.title,
    }));

    const menuItemIds = itemRequests
      .map((i) => i.menuItemId)
      .filter((id): id is string => Boolean(id));

    // Fetch authoritative menu items from database
    const dbMenuItems = menuItemIds.length > 0
      ? await db.select().from(menuItem).where(inArray(menuItem.id, menuItemIds))
      : [];

    const dbItemsMap = new Map(dbMenuItems.map((item) => [item.id, item]));

    // 3. Revalidate Availability and Price Integrity
    let calculatedSubtotal = 0;
    const validatedOrderItems: {
      menuItemId: string;
      title: string;
      price: number;
      quantity: number;
      subtotal: number;
    }[] = [];

    for (const reqItem of itemRequests) {
      let dbItem = dbItemsMap.get(reqItem.menuItemId);

      // Fallback lookup by title if menuItemId wasn't matched directly
      if (!dbItem && reqItem.title) {
        const [matchedByTitle] = await db
          .select()
          .from(menuItem)
          .where(eq(menuItem.title, reqItem.title));
        if (matchedByTitle) dbItem = matchedByTitle;
      }

      if (!dbItem) {
        return NextResponse.json(
          { error: `Menu item '${reqItem.title || reqItem.menuItemId}' was not found in active catalog.` },
          { status: 400 }
        );
      }

      if (!dbItem.isAvailable) {
        return NextResponse.json(
          { error: `Item '${dbItem.title}' is currently unavailable. Please review your order.` },
          { status: 400 }
        );
      }

      const authoritativePrice = dbItem.price;
      const itemSubtotal = authoritativePrice * reqItem.quantity;
      calculatedSubtotal += itemSubtotal;

      validatedOrderItems.push({
        menuItemId: dbItem.id,
        title: dbItem.title,
        price: authoritativePrice,
        quantity: reqItem.quantity,
        subtotal: itemSubtotal,
      });
    }

    const calculatedTotal = calculatedSubtotal;

    // 4. Create Order Records (Neon HTTP driver compatible)
    const orderId = `SP-${Math.floor(1000 + Math.random() * 9000)}`;

    const [newOrder] = await db
      .insert(guestOrder)
      .values({
        id: orderId,
        locationId: validLocationId,
        locationName: foundLocationName,
        subtotal: calculatedSubtotal,
        totalAmount: calculatedTotal,
        status: "received",
        specialInstructions: guestNotes,
      })
      .returning();

    const itemsToInsert = validatedOrderItems.map((item) => ({
      id: "item_" + Math.random().toString(36).substring(2, 9),
      orderId,
      menuItemId: item.menuItemId,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const insertedItems = await db
      .insert(guestOrderItem)
      .values(itemsToInsert)
      .returning();

    return NextResponse.json({
      order: newOrder,
      items: insertedItems,
    });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create order. Please try again." },
      { status: 500 }
    );
  }
}
