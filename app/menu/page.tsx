import { redirect } from "next/navigation";
import { db } from "@/lib/db/db";
import { location } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function MenuIndexPage() {
  let targetSlug = "room-208";

  try {
    const [firstLocation] = await db
      .select()
      .from(location)
      .where(eq(location.isActive, true))
      .limit(1);

    if (firstLocation?.slug) {
      targetSlug = firstLocation.slug;
    }
  } catch (err) {
    console.error("Error fetching default menu location:", err);
  }

  redirect(`/menu/${targetSlug}`);
}


