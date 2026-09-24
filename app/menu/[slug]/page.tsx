import { db } from "@/lib/db/db";
import { location, category, menuItem } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import GuestMenuClient from "./guest-menu-client";
import { Utensils } from "lucide-react";
import Link from "next/link";

export default async function GuestMenuPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!slug) {
    return <OrderingPointInactive error="Invalid ordering QR code." />;
  }

  try {
    // 1. Fetch location from database
    const [foundLocation] = await db
      .select()
      .from(location)
      .where(eq(location.slug, slug));

    if (!foundLocation) {
      return <OrderingPointInactive error={`Ordering point for '${slug}' was not found or is inactive.`} />;
    }

    // 2. Fetch categories ordered by sortOrder
    const categoriesList = await db
      .select()
      .from(category)
      .orderBy(asc(category.sortOrder));

    // 3. Fetch available menu items
    const itemsList = await db
      .select()
      .from(menuItem)
      .where(eq(menuItem.isAvailable, true));

    // 4. Group items by category
    const menuWithItems = categoriesList.map((cat) => ({
      ...cat,
      items: itemsList.filter((item) => item.categoryId === cat.id),
    }));

    return (
      <GuestMenuClient
        initialLocation={foundLocation}
        initialCategories={menuWithItems}
      />
    );
  } catch (err: any) {
    console.error("Error loading guest menu on server:", err);
    return <OrderingPointInactive error="Unable to load room service menu at this time. Please try again later." />;
  }
}

function OrderingPointInactive({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-[#F7F6F2] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="bg-white p-8 rounded-3xl border border-[#E5E3DB] shadow-md max-w-sm w-full space-y-4">
        <Utensils className="w-12 h-12 text-[#183B32] mx-auto" />
        <h2 className="text-xl font-serif font-bold text-stone-900">Ordering Point Inactive</h2>
        <p className="text-xs text-stone-500">{error}</p>
        <Link
          href="/admin/overview"
          className="inline-block px-5 py-2.5 rounded-full bg-[#183B32] text-white text-xs font-semibold shadow-sm"
        >
          Staff Portal Overview
        </Link>
      </div>
    </div>
  );
}
