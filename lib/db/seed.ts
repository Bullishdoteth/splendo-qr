import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/db";
import { category, menuItem, location } from "@/lib/db/schema";
import { config } from "dotenv";

config({ path: ".env.local" });

async function seedDatabase() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (email && password) {
    console.log(`Seeding admin account for: ${email}...`);
    try {
      await auth.api.signUpEmail({
        body: {
          email,
          password,
          name: "Splendo Admin",
        },
      });
      console.log("Admin account created successfully.");
    } catch (error: any) {
      console.log("Admin account already exists or notice:", error?.message || error);
    }
  }

  console.log("Seeding categories and menu items...");

  const existingCategories = await db.select().from(category);
  if (existingCategories.length === 0) {
    const catBreakfastId = "cat_breakfast_" + Date.now();
    const catMainsId = "cat_mains_" + Date.now();
    const catDrinksId = "cat_drinks_" + Date.now();

    await db.insert(category).values([
      {
        id: catBreakfastId,
        name: "Breakfast & Morning Specials",
        description: "Artisanal breakfast sets, fresh pastries, and gourmet morning starters.",
        sortOrder: 1,
      },
      {
        id: catMainsId,
        name: "All-Day Dining & Mains",
        description: "Exquisite main courses prepared by our executive culinary team.",
        sortOrder: 2,
      },
      {
        id: catDrinksId,
        name: "Wines & Artisanal Cocktails",
        description: "Curated fine wines, vintage champagne, and signature craft cocktails.",
        sortOrder: 3,
      },
    ]);

    await db.insert(menuItem).values([
      {
        id: "item_" + Math.random().toString(36).substr(2, 9),
        categoryId: catBreakfastId,
        title: "Champagne Caviar Breakfast Set",
        subtitle: "Imperial caviar, poached organic eggs, freshly baked croissants & vintage Brut.",
        price: 185000,
        prepTime: "20-25 mins",
        imageUrl: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
        isAvailable: true,
      },
      {
        id: "item_" + Math.random().toString(36).substr(2, 9),
        categoryId: catBreakfastId,
        title: "Avocado & Smoked Salmon Tartine",
        subtitle: "Hass avocado smash, wild Scottish smoked salmon, capers on toasted sourdough.",
        price: 28000,
        prepTime: "15 mins",
        imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
        isAvailable: true,
      },
      {
        id: "item_" + Math.random().toString(36).substr(2, 9),
        categoryId: catBreakfastId,
        title: "Fluffy Brioche French Toast",
        subtitle: "Hand-cut brioche, Madagascar vanilla bean cream, organic maple syrup & berries.",
        price: 24000,
        prepTime: "15-20 mins",
        imageUrl: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=800&q=80",
        isAvailable: true,
      },
      {
        id: "item_" + Math.random().toString(36).substr(2, 9),
        categoryId: catMainsId,
        title: "A5 Wagyu Beef Burger",
        subtitle: "Mouth-watering Wagyu beef patty, aged truffle cheddar, caramelized onion relish on brioche.",
        price: 32000,
        prepTime: "20 mins",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        isAvailable: true,
      },
      {
        id: "item_" + Math.random().toString(36).substr(2, 9),
        categoryId: catMainsId,
        title: "Pan-Seared Chilean Sea Bass",
        subtitle: "Sustainably caught sea bass, saffron emulsion, asparagus spears, crushed new potatoes.",
        price: 48000,
        prepTime: "25-30 mins",
        imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
        isAvailable: true,
      },
      {
        id: "item_" + Math.random().toString(36).substr(2, 9),
        categoryId: catDrinksId,
        title: "Smoked Old Fashioned",
        subtitle: "Single barrel bourbon, Angostura bitters, white oak smoke infusion.",
        price: 22000,
        prepTime: "10 mins",
        imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80",
        isAvailable: true,
      },
    ]);
    console.log("Categories and menu items seeded successfully.");
  } else {
    console.log("Categories already exist, skipping category seeding.");
  }

  console.log("Seeding locations...");
  const existingLocations = await db.select().from(location);
  if (existingLocations.length === 0) {
    await db.insert(location).values([
      {
        id: "loc_suite_401",
        name: "Suite 401",
        slug: "suite-401",
        category: "Executive Suite",
        floor: "4th Floor",
        isActive: true,
      },
      {
        id: "loc_suite_402",
        name: "Suite 402",
        slug: "suite-402",
        category: "Presidential Suite",
        floor: "4th Floor",
        isActive: true,
      },
      {
        id: "loc_room_305",
        name: "Room 305",
        slug: "room-305",
        category: "Deluxe King",
        floor: "3rd Floor",
        isActive: true,
      },
      {
        id: "loc_room_215",
        name: "Room 215",
        slug: "room-215",
        category: "Standard Double",
        floor: "2nd Floor",
        isActive: true,
      },
    ]);
    console.log("Locations seeded successfully.");
  } else {
    console.log("Locations already exist, skipping location seeding.");
  }

  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
