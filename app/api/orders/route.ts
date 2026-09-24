import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { guestOrder, guestOrderItem } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

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
    const { locationId, locationName, items, totalAmount, specialInstructions } = body;

    if (!locationName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Location name and items are required" }, { status: 400 });
    }

    // Generate readable order ID e.g. "SP-2658"
    const orderId = `SP-${Math.floor(1000 + Math.random() * 9000)}`;

    const [newOrder] = await db.insert(guestOrder).values({
      id: orderId,
      locationId: locationId || null,
      locationName,
      totalAmount: totalAmount || 0,
      status: "received",
      specialInstructions: specialInstructions || null,
    }).returning();

    // Insert order items
    const insertedItems = await Promise.all(
      items.map(async (item: { title: string; price: number; quantity: number }) => {
        const itemId = "item_" + Math.random().toString(36).substring(2, 9);
        const [inserted] = await db.insert(guestOrderItem).values({
          id: itemId,
          orderId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
        }).returning();
        return inserted;
      })
    );

    return NextResponse.json({
      order: newOrder,
      items: insertedItems,
    });
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create order" }, { status: 500 });
  }
}
