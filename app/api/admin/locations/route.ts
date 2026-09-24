import { NextResponse } from "next/server";
import { db } from "@/lib/db/db";
import { location } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export async function GET() {
  try {
    const locationsList = await db
      .select()
      .from(location)
      .orderBy(desc(location.createdAt));

    return NextResponse.json({ locations: locationsList });
  } catch (error: any) {
    console.error("GET /api/admin/locations error:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch locations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, category, floor } = body;

    if (!name) {
      return NextResponse.json({ error: "Location name is required" }, { status: 400 });
    }

    let slug = slugify(name);
    if (!slug) {
      slug = `loc-${Date.now()}`;
    }

    // Ensure unique slug
    const existing = await db.select().from(location).where(eq(location.slug, slug));
    if (existing.length > 0) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const id = "loc_" + Math.random().toString(36).substring(2, 11);

    const [newLocation] = await db.insert(location).values({
      id,
      name,
      slug,
      category: category || "Room",
      floor: floor || null,
      isActive: true,
    }).returning();

    return NextResponse.json({ location: newLocation });
  } catch (error: any) {
    console.error("POST /api/admin/locations error:", error);
    return NextResponse.json({ error: error?.message || "Failed to create location" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, category, floor, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Location ID is required" }, { status: 400 });
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (category !== undefined) updateData.category = category;
    if (floor !== undefined) updateData.floor = floor;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const [updatedLocation] = await db
      .update(location)
      .set(updateData)
      .where(eq(location.id, id))
      .returning();

    return NextResponse.json({ location: updatedLocation });
  } catch (error: any) {
    console.error("PUT /api/admin/locations error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update location" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Location ID is required" }, { status: 400 });
    }

    await db.delete(location).where(eq(location.id, id));

    return NextResponse.json({ success: true, message: "Location deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/admin/locations error:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete location" }, { status: 500 });
  }
}
