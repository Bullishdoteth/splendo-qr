import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { guestOrder, guestOrderItem } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const [foundOrder] = await db
      .select()
      .from(guestOrder)
      .where(eq(guestOrder.id, orderId));

    if (!foundOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const items = await db
      .select()
      .from(guestOrderItem)
      .where(eq(guestOrderItem.orderId, foundOrder.id));

    return NextResponse.json({
      order: foundOrder,
      items,
    });
  } catch (error: any) {
    console.error("GET /api/orders/[orderId] error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch order details" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const [updatedOrder] = await db
      .update(guestOrder)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(guestOrder.id, orderId))
      .returning();

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const items = await db
      .select()
      .from(guestOrderItem)
      .where(eq(guestOrderItem.orderId, updatedOrder.id));

    return NextResponse.json({
      order: updatedOrder,
      items,
    });
  } catch (error: any) {
    console.error("PATCH /api/orders/[orderId] error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update order status" }, { status: 500 });
  }
}
