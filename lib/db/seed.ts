import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/db";
import { category, menuItem, location } from "@/lib/db/schema";
import { config } from "dotenv";

config({ path: ".env.local" });

const categoriesData = [
  {
    id: "cat_africana_soups",
    name: "Africana Soups & Swallow",
    slug: "africana-soups",
    description: "Authentic Nigerian soups prepared with traditional spices, served with your choice of swallow (Semo, Pounded Yam, or Garri).",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "cat_rice_dishes",
    name: "Rice Dishes & Specialties",
    slug: "rice-dishes",
    description: "Richly seasoned Nigerian & continental rice dishes served with premium protein choices.",
    sortOrder: 2,
    isActive: true,
  },
  {
    id: "cat_pasta",
    name: "Pasta & Noodles",
    slug: "pasta-noodles",
    description: "Hearty spaghetti and Indomie creations prepared with savory sauces and toppings.",
    sortOrder: 3,
    isActive: true,
  },
  {
    id: "cat_breakfast_eggs",
    name: "Breakfast, Eggs & Yam Dishes",
    slug: "breakfast-eggs",
    description: "Freshly made omelettes, yam platters, plantains, and savory egg sauces.",
    sortOrder: 4,
    isActive: true,
  },
  {
    id: "cat_hangout_peppersoup",
    name: "African Hangout & Pepper Soups",
    slug: "hangout-peppersoup",
    description: "Signature Nkwobi, Ugba, whole roasted catfish & chicken, and steaming herbal pepper soups.",
    sortOrder: 5,
    isActive: true,
  },
  {
    id: "cat_proteins",
    name: "Proteins & Extra Portions",
    slug: "proteins",
    description: "Standalone extra portions of seasoned beef, goat meat, chicken, snail, and fish.",
    sortOrder: 6,
    isActive: true,
  },
  {
    id: "cat_chips_snacks_salads",
    name: "Chips, Pastries & Fresh Salads",
    slug: "chips-snacks-salads",
    description: "Golden chips combos, freshly baked meat pies, toasted bread, and vibrant salads.",
    sortOrder: 7,
    isActive: true,
  },
  {
    id: "cat_hot_beverages",
    name: "Hot Beverages",
    slug: "hot-beverages",
    description: "Freshly brewed coffee, hot tea, and warm cocoa beverages.",
    sortOrder: 8,
    isActive: true,
  },
  {
    id: "cat_softdrinks_beers",
    name: "Chilled Drinks & Beers",
    slug: "softdrinks-beers",
    description: "Ice-cold soft drinks, premium juices, energy drinks, and lagers.",
    sortOrder: 9,
    isActive: true,
  },
  {
    id: "cat_wines_spirits",
    name: "Fine Wines & Premium Spirits",
    slug: "wines-spirits",
    description: "Curated fine wines, single malt whiskies, cognac, and classic spirits.",
    sortOrder: 10,
    isActive: true,
  },
  {
    id: "cat_champagne_sparkling",
    name: "Champagne & Sparkling Wines",
    slug: "champagne-sparkling",
    description: "Exclusive champagnes and sparkling wines perfect for celebrations.",
    sortOrder: 11,
    isActive: true,
  },
  {
    id: "cat_cream_liqueurs",
    name: "Cream Liqueurs",
    slug: "cream-liqueurs",
    description: "Decadent Irish creams and dessert liqueurs.",
    sortOrder: 12,
    isActive: true,
  },
];

const menuItemsData = [
  // 1. Africana Soups
  { id: "item_soup_01", categoryId: "cat_africana_soups", title: "Fisherman Soup", subtitle: "Rich coastal soup loaded with fresh ocean seafood, fish, and local herbs.", price: 22000, prepTime: "25-30 mins", imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80", isAvailable: true },
  { id: "item_soup_02", categoryId: "cat_africana_soups", title: "Seafood Okro Soup", subtitle: "Fresh okra cooked with jumbo prawns, crabs, and fish in authentic broth.", price: 20000, prepTime: "25 mins", imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80", isAvailable: true },
  { id: "item_soup_03", categoryId: "cat_africana_soups", title: "Okro Soup & Swallow (Big Chicken)", subtitle: "Fresh okra soup served with big chicken and your choice of Semo, Pounded Yam, or Garri.", price: 10000, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_04", categoryId: "cat_africana_soups", title: "Okro Soup & Swallow (Small Chicken)", subtitle: "Okra soup with tender small chicken and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_05", categoryId: "cat_africana_soups", title: "Okro Soup & Swallow (Goat Meat)", subtitle: "Okra soup with slow-cooked goat meat and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_06", categoryId: "cat_africana_soups", title: "Okro Soup & Swallow (Beef)", subtitle: "Okra soup with braised beef and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_07", categoryId: "cat_africana_soups", title: "Okro Soup & Swallow (Cowleg)", subtitle: "Okra soup with tender cowleg and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_08", categoryId: "cat_africana_soups", title: "Okro Soup & Swallow (Cowtail)", subtitle: "Okra soup with rich cowtail meat and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },

  { id: "item_soup_09", categoryId: "cat_africana_soups", title: "Vegetable Soup & Swallow (Big Chicken)", subtitle: "Fresh leaf vegetable stewed with palm oil, big chicken, and swallow.", price: 10000, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_10", categoryId: "cat_africana_soups", title: "Vegetable Soup & Swallow (Small Chicken)", subtitle: "Fresh leaf vegetable soup with chicken and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_11", categoryId: "cat_africana_soups", title: "Vegetable Soup & Swallow (Goat Meat)", subtitle: "Fresh vegetable soup with goat meat and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_12", categoryId: "cat_africana_soups", title: "Vegetable Soup & Swallow (Beef)", subtitle: "Fresh vegetable soup with beef and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_13", categoryId: "cat_africana_soups", title: "Vegetable Soup & Swallow (Cowleg)", subtitle: "Fresh vegetable soup with cowleg and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_14", categoryId: "cat_africana_soups", title: "Vegetable Soup & Swallow (Cowtail)", subtitle: "Fresh vegetable soup with cowtail and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },

  { id: "item_soup_15", categoryId: "cat_africana_soups", title: "Uha Soup & Swallow (Big Chicken)", subtitle: "Traditional Oha leaf soup thickened with cocoyam, big chicken & swallow.", price: 10000, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_16", categoryId: "cat_africana_soups", title: "Uha Soup & Swallow (Small Chicken)", subtitle: "Traditional Oha soup with small chicken and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_17", categoryId: "cat_africana_soups", title: "Uha Soup & Swallow (Goat Meat)", subtitle: "Traditional Oha soup with goat meat and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_18", categoryId: "cat_africana_soups", title: "Uha Soup & Swallow (Beef)", subtitle: "Traditional Oha soup with beef and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_19", categoryId: "cat_africana_soups", title: "Uha Soup & Swallow (Cowleg)", subtitle: "Traditional Oha soup with cowleg and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_20", categoryId: "cat_africana_soups", title: "Uha Soup & Swallow (Cowtail)", subtitle: "Traditional Oha soup with cowtail and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },

  { id: "item_soup_21", categoryId: "cat_africana_soups", title: "Egusi Soup & Swallow (Big Chicken)", subtitle: "Rich melon seed soup with bitterleaf/spinach, big chicken & swallow.", price: 10000, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_22", categoryId: "cat_africana_soups", title: "Egusi Soup & Swallow (Small Chicken)", subtitle: "Egusi soup with chicken and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_23", categoryId: "cat_africana_soups", title: "Egusi Soup & Swallow (Goat Meat)", subtitle: "Egusi soup with goat meat and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_24", categoryId: "cat_africana_soups", title: "Egusi Soup & Swallow (Beef)", subtitle: "Egusi soup with beef and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_25", categoryId: "cat_africana_soups", title: "Egusi Soup & Swallow (Cowleg)", subtitle: "Egusi soup with cowleg and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_26", categoryId: "cat_africana_soups", title: "Egusi Soup & Swallow (Cowtail)", subtitle: "Egusi soup with cowtail and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },

  { id: "item_soup_27", categoryId: "cat_africana_soups", title: "Ofe Owerri & Swallow (Big Chicken)", subtitle: "Royal Igbo soup cooked with stockfish, local spices, big chicken & swallow.", price: 10000, prepTime: "25 mins", isAvailable: true },
  { id: "item_soup_28", categoryId: "cat_africana_soups", title: "Ofe Owerri & Swallow (Small Chicken)", subtitle: "Ofe Owerri soup with chicken and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_29", categoryId: "cat_africana_soups", title: "Ofe Owerri & Swallow (Goat Meat)", subtitle: "Ofe Owerri soup with goat meat and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_30", categoryId: "cat_africana_soups", title: "Ofe Owerri & Swallow (Beef)", subtitle: "Ofe Owerri soup with beef and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_31", categoryId: "cat_africana_soups", title: "Ofe Owerri & Swallow (Cowleg)", subtitle: "Ofe Owerri soup with cowleg and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_32", categoryId: "cat_africana_soups", title: "Ofe Owerri & Swallow (Cowtail)", subtitle: "Ofe Owerri soup with cowtail and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },

  { id: "item_soup_33", categoryId: "cat_africana_soups", title: "Afang Soup & Swallow (Big Chicken)", subtitle: "Nutritious Ukazi leaf soup stewed in palm oil with big chicken & swallow.", price: 10000, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_34", categoryId: "cat_africana_soups", title: "Afang Soup & Swallow (Small Chicken)", subtitle: "Afang soup with chicken and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_35", categoryId: "cat_africana_soups", title: "Afang Soup & Swallow (Goat Meat)", subtitle: "Afang soup with goat meat and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_36", categoryId: "cat_africana_soups", title: "Afang Soup & Swallow (Beef)", subtitle: "Afang soup with beef and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_37", categoryId: "cat_africana_soups", title: "Afang Soup & Swallow (Cowleg)", subtitle: "Afang soup with cowleg and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },
  { id: "item_soup_38", categoryId: "cat_africana_soups", title: "Afang Soup & Swallow (Cowtail)", subtitle: "Afang soup with cowtail and swallow.", price: 8500, prepTime: "20 mins", isAvailable: true },

  // 2. Rice Dishes
  { id: "item_rice_01", categoryId: "cat_rice_dishes", title: "Jollof Rice & Big Chicken", subtitle: "Smoky Nigerian party jollof rice served with fried big chicken.", price: 10000, prepTime: "15-20 mins", imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80", isAvailable: true },
  { id: "item_rice_02", categoryId: "cat_rice_dishes", title: "Jollof Rice & Chicken", subtitle: "Smoky party jollof rice with chicken.", price: 8000, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_03", categoryId: "cat_rice_dishes", title: "Jollof Rice & Cowleg", subtitle: "Party jollof rice served with peppered cowleg.", price: 8000, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_04", categoryId: "cat_rice_dishes", title: "Jollof Rice & Beef", subtitle: "Party jollof rice served with tender seasoned beef.", price: 8000, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_05", categoryId: "cat_rice_dishes", title: "Jollof Rice & Goat Meat", subtitle: "Party jollof rice served with savory goat meat.", price: 8000, prepTime: "15 mins", isAvailable: true },

  { id: "item_rice_06", categoryId: "cat_rice_dishes", title: "Fried Rice & Big Chicken", subtitle: "Seasoned vegetable fried rice served with big chicken.", price: 10500, prepTime: "15-20 mins", isAvailable: true },
  { id: "item_rice_07", categoryId: "cat_rice_dishes", title: "Fried Rice & Chicken", subtitle: "Vegetable fried rice with chicken.", price: 8500, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_08", categoryId: "cat_rice_dishes", title: "Fried Rice & Cowleg", subtitle: "Vegetable fried rice with peppered cowleg.", price: 8500, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_09", categoryId: "cat_rice_dishes", title: "Fried Rice & Beef", subtitle: "Vegetable fried rice with beef.", price: 8500, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_10", categoryId: "cat_rice_dishes", title: "Fried Rice & Goat Meat", subtitle: "Vegetable fried rice with goat meat.", price: 8500, prepTime: "15 mins", isAvailable: true },

  { id: "item_rice_11", categoryId: "cat_rice_dishes", title: "Coconut Rice & Big Chicken", subtitle: "Fragrant rice infusing rich coconut milk served with big chicken.", price: 10500, prepTime: "20 mins", isAvailable: true },
  { id: "item_rice_12", categoryId: "cat_rice_dishes", title: "Coconut Rice & Chicken", subtitle: "Coconut infused rice with chicken.", price: 8500, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_13", categoryId: "cat_rice_dishes", title: "Coconut Rice & Cowleg", subtitle: "Coconut infused rice with cowleg.", price: 8500, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_14", categoryId: "cat_rice_dishes", title: "Coconut Rice & Beef", subtitle: "Coconut infused rice with beef.", price: 8500, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_15", categoryId: "cat_rice_dishes", title: "Coconut Rice & Goat Meat", subtitle: "Coconut infused rice with goat meat.", price: 8500, prepTime: "15 mins", isAvailable: true },

  { id: "item_rice_16", categoryId: "cat_rice_dishes", title: "Native Rice & Big Chicken", subtitle: "Ofada style palm oil rice with crayfish, locust beans & big chicken.", price: 10000, prepTime: "20 mins", isAvailable: true },
  { id: "item_rice_17", categoryId: "cat_rice_dishes", title: "Native Rice & Chicken", subtitle: "Native palm oil rice with chicken.", price: 8000, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_18", categoryId: "cat_rice_dishes", title: "Native Rice & Cowleg", subtitle: "Native palm oil rice with cowleg.", price: 8000, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_19", categoryId: "cat_rice_dishes", title: "Native Rice & Beef", subtitle: "Native palm oil rice with beef.", price: 8000, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_20", categoryId: "cat_rice_dishes", title: "Native Rice & Assorted Meat", subtitle: "Native palm oil rice with assorted meats.", price: 7000, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_21", categoryId: "cat_rice_dishes", title: "Native Rice & Goat Meat", subtitle: "Native palm oil rice with goat meat.", price: 8500, prepTime: "15 mins", isAvailable: true },

  { id: "item_rice_22", categoryId: "cat_rice_dishes", title: "Chinese Fried Rice & Big Chicken", subtitle: "Wok-fried egg and vegetable rice served with big chicken.", price: 10500, prepTime: "20 mins", isAvailable: true },
  { id: "item_rice_23", categoryId: "cat_rice_dishes", title: "Chinese Fried Rice & Chicken", subtitle: "Wok-fried rice with chicken.", price: 8500, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_24", categoryId: "cat_rice_dishes", title: "Chinese Fried Rice & Cowleg", subtitle: "Wok-fried rice with cowleg.", price: 8500, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_25", categoryId: "cat_rice_dishes", title: "Chinese Fried Rice & Beef", subtitle: "Wok-fried rice with beef.", price: 8500, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_26", categoryId: "cat_rice_dishes", title: "Chinese Fried Rice & Goat Meat", subtitle: "Wok-fried rice with goat meat.", price: 8500, prepTime: "15 mins", isAvailable: true },

  { id: "item_rice_27", categoryId: "cat_rice_dishes", title: "Basmati Rice & Big Chicken", subtitle: "Long grain aromatic basmati rice cooked with herbs & big chicken.", price: 12000, prepTime: "20 mins", isAvailable: true },
  { id: "item_rice_28", categoryId: "cat_rice_dishes", title: "Basmati Rice & Chicken", subtitle: "Basmati rice dish served with chicken.", price: 10500, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_29", categoryId: "cat_rice_dishes", title: "Basmati Rice & Cowleg", subtitle: "Basmati rice dish served with cowleg.", price: 10500, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_30", categoryId: "cat_rice_dishes", title: "Basmati Rice & Beef", subtitle: "Basmati rice dish served with beef.", price: 10500, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_31", categoryId: "cat_rice_dishes", title: "Basmati Rice & Goat Meat", subtitle: "Basmati rice dish served with goat meat.", price: 10500, prepTime: "15 mins", isAvailable: true },

  { id: "item_rice_32", categoryId: "cat_rice_dishes", title: "White Rice & Big Chicken", subtitle: "Steamed white rice served with stew and big chicken.", price: 10000, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_33", categoryId: "cat_rice_dishes", title: "White Rice & Chicken", subtitle: "Steamed white rice with stew and chicken.", price: 8000, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_34", categoryId: "cat_rice_dishes", title: "White Rice & Cowleg", subtitle: "Steamed white rice with stew and cowleg.", price: 8000, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_35", categoryId: "cat_rice_dishes", title: "White Rice & Beef", subtitle: "Steamed white rice with stew and beef.", price: 8000, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_36", categoryId: "cat_rice_dishes", title: "White Rice & Assorted Meat", subtitle: "Steamed white rice with stew and assorted meat.", price: 7000, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_37", categoryId: "cat_rice_dishes", title: "White Rice & Goat Meat", subtitle: "Steamed white rice with stew and goat meat.", price: 7000, prepTime: "15 mins", isAvailable: true },

  { id: "item_rice_38", categoryId: "cat_rice_dishes", title: "White Rice, Vegetable Sauce & Catfish", subtitle: "Steamed white rice paired with savory vegetable sauce and fresh catfish.", price: 12000, prepTime: "25 mins", isAvailable: true },
  { id: "item_rice_39", categoryId: "cat_rice_dishes", title: "White Rice, Vegetable Sauce & Cowtail", subtitle: "Steamed white rice served with rich vegetable sauce and cowtail.", price: 11000, prepTime: "20 mins", isAvailable: true },
  { id: "item_rice_40", categoryId: "cat_rice_dishes", title: "Vegetable Sauce & Cowtail (Only)", subtitle: "Fresh vegetable sauce with tender cowtail.", price: 7000, prepTime: "15 mins", isAvailable: true },
  { id: "item_rice_41", categoryId: "cat_rice_dishes", title: "Vegetable Sauce & Goat Meat (Only)", subtitle: "Fresh vegetable sauce with goat meat.", price: 7000, prepTime: "15 mins", isAvailable: true },

  // 3. Pasta & Noodles
  { id: "item_pasta_01", categoryId: "cat_pasta", title: "Spaghetti Bolognese & Chicken", subtitle: "Italian style spaghetti in rich tomato meat sauce served with chicken.", price: 10000, prepTime: "20 mins", imageUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80", isAvailable: true },
  { id: "item_pasta_02", categoryId: "cat_pasta", title: "Spaghetti Bolognese & Goat Meat", subtitle: "Spaghetti Bolognese served with spiced goat meat.", price: 10000, prepTime: "20 mins", isAvailable: true },
  { id: "item_pasta_03", categoryId: "cat_pasta", title: "Spaghetti Jollof & Big Chicken", subtitle: "Savory stir-fried Nigerian spaghetti jollof with big chicken.", price: 10000, prepTime: "20 mins", isAvailable: true },
  { id: "item_pasta_04", categoryId: "cat_pasta", title: "Spaghetti Jollof & Chicken", subtitle: "Spaghetti jollof with regular chicken portion.", price: 7500, prepTime: "15 mins", isAvailable: true },
  { id: "item_pasta_05", categoryId: "cat_pasta", title: "Spaghetti Jollof & Goat Meat", subtitle: "Spaghetti jollof served with goat meat.", price: 7500, prepTime: "15 mins", isAvailable: true },
  { id: "item_pasta_06", categoryId: "cat_pasta", title: "Spaghetti Jollof & Beef", subtitle: "Spaghetti jollof served with seasoned beef.", price: 7500, prepTime: "15 mins", isAvailable: true },
  { id: "item_pasta_07", categoryId: "cat_pasta", title: "Spaghetti & Boiled Egg", subtitle: "Spaghetti jollof topped with hard-boiled egg.", price: 5000, prepTime: "15 mins", isAvailable: true },
  { id: "item_pasta_08", categoryId: "cat_pasta", title: "Spaghetti & Fried Egg", subtitle: "Spaghetti jollof served with fried egg.", price: 5000, prepTime: "15 mins", isAvailable: true },
  { id: "item_pasta_09", categoryId: "cat_pasta", title: "Indomie & Fried Egg", subtitle: "Stir-fried Indomie noodles garnished with fried egg.", price: 3500, prepTime: "10-15 mins", isAvailable: true },
  { id: "item_pasta_10", categoryId: "cat_pasta", title: "Indomie & Boiled Egg", subtitle: "Stir-fried Indomie noodles garnished with boiled egg.", price: 3500, prepTime: "10-15 mins", isAvailable: true },

  // 4. Breakfast, Eggs & Yam Dishes
  { id: "item_egg_01", categoryId: "cat_breakfast_eggs", title: "Spanish Omelette", subtitle: "Fluffy eggs folded with peppers, onions, tomatoes, and herbs.", price: 5000, prepTime: "15 mins", imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80", isAvailable: true },
  { id: "item_egg_02", categoryId: "cat_breakfast_eggs", title: "Corned Beef Omelette", subtitle: "Savory omelette stuffed with seasoned corned beef.", price: 5000, prepTime: "15 mins", isAvailable: true },
  { id: "item_egg_03", categoryId: "cat_breakfast_eggs", title: "Plantain Omelette", subtitle: "Delicious fusion omelette loaded with diced sweet plantains.", price: 5000, prepTime: "15 mins", isAvailable: true },
  { id: "item_egg_04", categoryId: "cat_breakfast_eggs", title: "Sardine Omelette", subtitle: "Classic breakfast omelette made with rich sardine flakes.", price: 5000, prepTime: "15 mins", isAvailable: true },
  { id: "item_egg_05", categoryId: "cat_breakfast_eggs", title: "Tomatoes Omelette", subtitle: "Fresh tomato & onion pan-fried egg omelette.", price: 5000, prepTime: "15 mins", isAvailable: true },
  { id: "item_egg_06", categoryId: "cat_breakfast_eggs", title: "Scrambled Eggs", subtitle: "Creamy butter-scrambled organic eggs.", price: 5000, prepTime: "10 mins", isAvailable: true },
  { id: "item_egg_07", categoryId: "cat_breakfast_eggs", title: "Fresh Egg Sauce", subtitle: "Rich peppered egg sauce side.", price: 3000, prepTime: "10 mins", isAvailable: true },
  { id: "item_egg_08", categoryId: "cat_breakfast_eggs", title: "Boiled Yam & Egg Sauce", subtitle: "Tender boiled white yam slices served with warm egg sauce.", price: 6000, prepTime: "15-20 mins", isAvailable: true },
  { id: "item_egg_09", categoryId: "cat_breakfast_eggs", title: "Fried or Boiled Plantain & Egg Sauce", subtitle: "Sweet plantains (fried or boiled) paired with savory egg sauce.", price: 6000, prepTime: "15 mins", isAvailable: true },
  { id: "item_egg_10", categoryId: "cat_breakfast_eggs", title: "Potato Chips with Egg Sauce", subtitle: "Golden crispy potato fries served with egg dip sauce.", price: 5000, prepTime: "15 mins", isAvailable: true },
  { id: "item_egg_11", categoryId: "cat_breakfast_eggs", title: "Kidney & Liver Sauce", subtitle: "Richly spiced organ meat sauce.", price: 4000, prepTime: "15 mins", isAvailable: true },
  { id: "item_egg_12", categoryId: "cat_breakfast_eggs", title: "Yam Pottage", subtitle: "Traditional Asaro cooked with palm oil, peppers, and crayfish.", price: 5000, prepTime: "20 mins", isAvailable: true },

  // 5. African Hangout & Pepper Soups
  { id: "item_hangout_01", categoryId: "cat_hangout_peppersoup", title: "Full Roasted Chicken Platter", subtitle: "Whole charcoal roasted chicken seasoned with local spices & pepper dip.", price: 25000, prepTime: "30-40 mins", imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80", isAvailable: true },
  { id: "item_hangout_02", categoryId: "cat_hangout_peppersoup", title: "Full Roasted Catfish", subtitle: "Whole roasted point-and-kill catfish served with spicy pepper sauce & onions.", price: 22000, prepTime: "35-45 mins", isAvailable: true },
  { id: "item_hangout_03", categoryId: "cat_hangout_peppersoup", title: "Roasted Catfish Portion", subtitle: "Generous portion of roasted catfish with pepper dip.", price: 6000, prepTime: "20 mins", isAvailable: true },
  { id: "item_hangout_04", categoryId: "cat_hangout_peppersoup", title: "Nkwobi & Ugba Special", subtitle: "Traditional spicy cow foot tossed in potash palm oil sauce, garnished with Ugba & Utazi leaves.", price: 6000, prepTime: "20 mins", isAvailable: true },
  { id: "item_hangout_05", categoryId: "cat_hangout_peppersoup", title: "Nkwobi (Spicy Cow Foot)", subtitle: "Classic Eastern delicacy of cow foot chunks in palm oil emulsion.", price: 5500, prepTime: "20 mins", isAvailable: true },
  { id: "item_hangout_06", categoryId: "cat_hangout_peppersoup", title: "Ugba Only", subtitle: "Shredded oil bean seeds seasoned with palm oil, chili, and utazi.", price: 4000, prepTime: "15 mins", isAvailable: true },
  { id: "item_hangout_07", categoryId: "cat_hangout_peppersoup", title: "Fresh Fish Pepper Soup", subtitle: "Steaming catfish broth infused with aromatic pepper soup spices.", price: 6500, prepTime: "20 mins", isAvailable: true },
  { id: "item_hangout_08", categoryId: "cat_hangout_peppersoup", title: "Goat Meat Pepper Soup", subtitle: "Spicy herbal soup with tender goat meat chunks.", price: 5500, prepTime: "20 mins", isAvailable: true },
  { id: "item_hangout_09", categoryId: "cat_hangout_peppersoup", title: "Chicken Pepper Soup", subtitle: "Hot chicken broth with traditional medicinal spices.", price: 5500, prepTime: "20 mins", isAvailable: true },
  { id: "item_hangout_10", categoryId: "cat_hangout_peppersoup", title: "Kidney Pepper Soup", subtitle: "Herbal spicy soup loaded with beef kidney.", price: 5500, prepTime: "20 mins", isAvailable: true },

  // 6. Proteins & Extra Portions
  { id: "item_prot_01", categoryId: "cat_proteins", title: "Big Fried / Grilled Chicken", subtitle: "Large quarter leg fried or grilled chicken.", price: 7000, prepTime: "15 mins", imageUrl: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80", isAvailable: true },
  { id: "item_prot_02", categoryId: "cat_proteins", title: "Peppered Snail Portion", subtitle: "Giant African land snail sautéed in spicy pepper sauce.", price: 7000, prepTime: "20 mins", isAvailable: true },
  { id: "item_prot_03", categoryId: "cat_proteins", title: "Fresh Catfish Portion", subtitle: "Fried or boiled catfish cutlet.", price: 6000, prepTime: "15 mins", isAvailable: true },
  { id: "item_prot_04", categoryId: "cat_proteins", title: "Seasoned Chicken Portion", subtitle: "Regular fried chicken piece.", price: 5000, prepTime: "15 mins", isAvailable: true },
  { id: "item_prot_05", categoryId: "cat_proteins", title: "Spicy Goat Meat Portion", subtitle: "Peppered goat meat chunk.", price: 5000, prepTime: "15 mins", isAvailable: true },
  { id: "item_prot_06", categoryId: "cat_proteins", title: "Tender Cowtail Portion", subtitle: "Braised cowtail portion.", price: 5000, prepTime: "15 mins", isAvailable: true },
  { id: "item_prot_07", categoryId: "cat_proteins", title: "Braised Beef Portion", subtitle: "Seasoned fried beef portion.", price: 5000, prepTime: "15 mins", isAvailable: true },
  { id: "item_prot_08", categoryId: "cat_proteins", title: "Peppered Cowleg Portion", subtitle: "Slow-cooked spicy cowleg chunk.", price: 5000, prepTime: "15 mins", isAvailable: true },
  { id: "item_prot_09", categoryId: "cat_proteins", title: "Grilled Tilapia Fish Portion", subtitle: "Peppered tilapia cutlet.", price: 5000, prepTime: "20 mins", isAvailable: true },
  { id: "item_prot_10", categoryId: "cat_proteins", title: "Suya Beef Kebab", subtitle: "Beef skewers coated in spicy suya nut spice.", price: 5000, prepTime: "15 mins", isAvailable: true },
  { id: "item_prot_11", categoryId: "cat_proteins", title: "Peppered Gizzard Portion", subtitle: "Crispy peppered chicken gizzards.", price: 4000, prepTime: "15 mins", isAvailable: true },

  // 7. Chips, Pastries & Fresh Salads
  { id: "item_snack_01", categoryId: "cat_chips_snacks_salads", title: "Chicken & Golden French Fries", subtitle: "Crispy french fries served with seasoned fried chicken.", price: 10000, prepTime: "15-20 mins", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80", isAvailable: true },
  { id: "item_snack_02", categoryId: "cat_chips_snacks_salads", title: "Potato Chips & Chicken", subtitle: "Crispy potato chips served with chicken.", price: 10000, prepTime: "15-20 mins", isAvailable: true },
  { id: "item_snack_03", categoryId: "cat_chips_snacks_salads", title: "Fresh Chicken Salad", subtitle: "Shredded chicken breast, sweetcorn, lettuce, cucumbers & creamy dressing.", price: 8500, prepTime: "15 mins", isAvailable: true },
  { id: "item_snack_04", categoryId: "cat_chips_snacks_salads", title: "Full Vegetable Salad", subtitle: "Garden salad with carrots, cabbage, cucumber, eggs & cream.", price: 4000, prepTime: "15 mins", isAvailable: true },
  { id: "item_snack_05", categoryId: "cat_chips_snacks_salads", title: "Fresh Fruit Salad", subtitle: "Seasonal tropical fruits served chilled.", price: 4000, prepTime: "10 mins", isAvailable: true },
  { id: "item_snack_06", categoryId: "cat_chips_snacks_salads", title: "Regular House Salad", subtitle: "Light side vegetable salad.", price: 2000, prepTime: "10 mins", isAvailable: true },
  { id: "item_snack_07", categoryId: "cat_chips_snacks_salads", title: "Freshly Baked Meat Pie", subtitle: "Flaky pastry stuffed with seasoned minced beef & potatoes.", price: 1500, prepTime: "5 mins", isAvailable: true },
  { id: "item_snack_08", categoryId: "cat_chips_snacks_salads", title: "Fresh Bread Loaf", subtitle: "Freshly baked soft bread.", price: 2500, prepTime: "5 mins", isAvailable: true },
  { id: "item_snack_09", categoryId: "cat_chips_snacks_salads", title: "Toasted Club Bread", subtitle: "Butter-toasted sandwich bread slices.", price: 2500, prepTime: "10 mins", isAvailable: true },
  { id: "item_snack_10", categoryId: "cat_chips_snacks_salads", title: "Steamed Moi Moi", subtitle: "Rich steamed bean pudding cooked with egg & fish.", price: 2500, prepTime: "10 mins", isAvailable: true },

  // 8. Hot Beverages
  { id: "item_hot_01", categoryId: "cat_hot_beverages", title: "Freshly Brewed Coffee", subtitle: "Hot rich roasted coffee.", price: 1500, prepTime: "5 mins", imageUrl: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80", isAvailable: true },
  { id: "item_hot_02", categoryId: "cat_hot_beverages", title: "Lipton Yellow Label Tea", subtitle: "Hot black tea served with sugar & milk option.", price: 1500, prepTime: "5 mins", isAvailable: true },
  { id: "item_hot_03", categoryId: "cat_hot_beverages", title: "Hot Milo Cocoa", subtitle: "Rich chocolate malt drink.", price: 1500, prepTime: "5 mins", isAvailable: true },
  { id: "item_hot_04", categoryId: "cat_hot_beverages", title: "Tin Milk Portion", subtitle: "Evaporated milk tin addition.", price: 2000, prepTime: "2 mins", isAvailable: true },

  // 9. Chilled Drinks & Beers
  { id: "item_drink_01", categoryId: "cat_softdrinks_beers", title: "Premium Natural Water", subtitle: "Chilled bottled table water.", price: 500, prepTime: "2 mins", imageUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=800&q=80", isAvailable: true },
  { id: "item_drink_02", categoryId: "cat_softdrinks_beers", title: "PET Soft Drink", subtitle: "Coca-Cola, Fanta, Sprite, or Pepsi 50cl bottle.", price: 1000, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_03", categoryId: "cat_softdrinks_beers", title: "Fayrouz Can", subtitle: "Sparkling apple or pineapple malt drink.", price: 1500, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_04", categoryId: "cat_softdrinks_beers", title: "Malt Drink", subtitle: "Maltina or Amstel Malt bottle/can.", price: 1500, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_05", categoryId: "cat_softdrinks_beers", title: "Action Bitters", subtitle: "Herbal alcoholic bitters bottle.", price: 2000, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_06", categoryId: "cat_softdrinks_beers", title: "Orijin Bitters", subtitle: "Herbal blend spirit bottle.", price: 2000, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_07", categoryId: "cat_softdrinks_beers", title: "Heineken Premium Beer", subtitle: "Chilled Heineken lager bottle.", price: 2000, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_08", categoryId: "cat_softdrinks_beers", title: "Hero Lager Beer", subtitle: "Chilled Hero lager bottle.", price: 2000, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_09", categoryId: "cat_softdrinks_beers", title: "Life Continental Beer", subtitle: "Chilled Life lager bottle.", price: 2000, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_10", categoryId: "cat_softdrinks_beers", title: "Star Lager Beer", subtitle: "Chilled Star lager bottle.", price: 2000, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_11", categoryId: "cat_softdrinks_beers", title: "Legend Extra Stout", subtitle: "Rich dark stout bottle.", price: 2000, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_12", categoryId: "cat_softdrinks_beers", title: "Budweiser King of Beers", subtitle: "Chilled Budweiser bottle.", price: 2000, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_13", categoryId: "cat_softdrinks_beers", title: "Desperados Tequila Beer", subtitle: "Tequila-flavored beer bottle.", price: 2000, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_14", categoryId: "cat_softdrinks_beers", title: "Guinness Medium Stout", subtitle: "Classic Guinness foreign extra stout.", price: 2000, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_15", categoryId: "cat_softdrinks_beers", title: "Gulder Ultimate Beer", subtitle: "Chilled Gulder lager bottle.", price: 2000, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_16", categoryId: "cat_softdrinks_beers", title: "Flying Fish Flavored Beer", subtitle: "Chilled lemon flavored beer.", price: 2000, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_17", categoryId: "cat_softdrinks_beers", title: "Tiger Crystal Beer", subtitle: "Chilled Tiger beer bottle.", price: 2000, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_18", categoryId: "cat_softdrinks_beers", title: "33 Export Lager", subtitle: "Chilled 33 Export lager bottle.", price: 2000, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_19", categoryId: "cat_softdrinks_beers", title: "Smirnoff Ice", subtitle: "Chilled vodka beverage bottle.", price: 2000, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_20", categoryId: "cat_softdrinks_beers", title: "Hollandia Yoghurt (1L)", subtitle: "Chilled plain/strawberry yoghurt carton.", price: 3500, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_21", categoryId: "cat_softdrinks_beers", title: "Chivita 100% Juice (1L)", subtitle: "Premium 1L fruit juice carton.", price: 3500, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_22", categoryId: "cat_softdrinks_beers", title: "Chi Exotic Juice (1L)", subtitle: "Tropical fruit nectar juice carton.", price: 3500, prepTime: "2 mins", isAvailable: true },
  { id: "item_drink_23", categoryId: "cat_softdrinks_beers", title: "Vitamilk Soy Drink", subtitle: "Rich soya bean milk bottle.", price: 3500, prepTime: "2 mins", isAvailable: true },

  // 10. Fine Wines & Premium Spirits
  { id: "item_wine_01", categoryId: "cat_wines_spirits", title: "Hennessy VSOP (70cl)", subtitle: "Harmonious and structured Cognac bottle.", price: 750000, prepTime: "5 mins", imageUrl: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80", isAvailable: true },
  { id: "item_wine_02", categoryId: "cat_wines_spirits", title: "Glenfiddich 21 Years Single Malt", subtitle: "Exquisite Caribbean rum cask finished Scotch whisky.", price: 550000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_03", categoryId: "cat_wines_spirits", title: "Hennessy XO Cognac", subtitle: "Iconic extra old prestige Cognac bottle.", price: 500000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_04", categoryId: "cat_wines_spirits", title: "Glenfiddich 15 Years Single Malt", subtitle: "Solera vat aged single malt Scotch.", price: 250000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_05", categoryId: "cat_wines_spirits", title: "Glenfiddich 12 Years Single Malt", subtitle: "Classic signature Speyside single malt.", price: 150000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_06", categoryId: "cat_wines_spirits", title: "Glenmorangie Original 10 Yrs", subtitle: "Highland single malt Scotch whisky bottle.", price: 150000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_07", categoryId: "cat_wines_spirits", title: "Teeling Irish Whiskey", subtitle: "Small batch rum cask finished Irish whiskey.", price: 100000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_08", categoryId: "cat_wines_spirits", title: "Singleton 12 Years Single Malt", subtitle: "Smooth and fruity Dufftown single malt.", price: 100000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_09", categoryId: "cat_wines_spirits", title: "Jameson Black Barrel", subtitle: "Double charred oak cask Irish whiskey.", price: 95000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_10", categoryId: "cat_wines_spirits", title: "Johnnie Walker Black Label", subtitle: "12 Year old blended Scotch whisky.", price: 80000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_11", categoryId: "cat_wines_spirits", title: "Jameson Green Triple Distilled", subtitle: "Classic smooth Irish whiskey (70cl).", price: 50000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_12", categoryId: "cat_wines_spirits", title: "Johnnie Walker Red Label", subtitle: "Pioneer blended Scotch whisky.", price: 40000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_13", categoryId: "cat_wines_spirits", title: "Jameson Irish Whiskey (Small)", subtitle: "Pocket size 20cl Jameson bottle.", price: 20000, prepTime: "5 mins", isAvailable: true },

  { id: "item_wine_14", categoryId: "cat_wines_spirits", title: "Silk & Spice Red Wine", subtitle: "Smooth Portuguese red wine bottle.", price: 30000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_15", categoryId: "cat_wines_spirits", title: "Escudo Rojo Baron Philippe", subtitle: "Premium Chilean Cabernet Sauvignon.", price: 30000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_16", categoryId: "cat_wines_spirits", title: "Campari Aperitif Bitter", subtitle: "Classic Italian red spirit bottle.", price: 30000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_17", categoryId: "cat_wines_spirits", title: "King Caicedo Red Wine", subtitle: "Full-bodied red table wine.", price: 25000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_18", categoryId: "cat_wines_spirits", title: "Toma Sweet Red Wine", subtitle: "Rich sweet red wine bottle.", price: 25000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_19", categoryId: "cat_wines_spirits", title: "Four Cousins Sweet Red Wine", subtitle: "Popular South African sweet red wine.", price: 25000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_20", categoryId: "cat_wines_spirits", title: "Agor (Asconi) Red Wine", subtitle: "Moldovan sweet red wine bottle.", price: 20000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_21", categoryId: "cat_wines_spirits", title: "Chamdor Sparkling Drink", subtitle: "Non-alcoholic grape sparkling drink.", price: 15000, prepTime: "5 mins", isAvailable: true },
  { id: "item_wine_22", categoryId: "cat_wines_spirits", title: "Pure Heaven Celebration Drink", subtitle: "Non-alcoholic sparkling juice bottle.", price: 15000, prepTime: "5 mins", isAvailable: true },

  // 11. Champagne & Sparkling Wines
  { id: "item_champ_01", categoryId: "cat_champagne_sparkling", title: "Moët & Chandon Rosé Impérial", subtitle: "Radiant, romantic champagne with vibrant berry aromas.", price: 45000, prepTime: "5 mins", imageUrl: "https://images.unsplash.com/photo-1569919659476-f0852f6834b7?auto=format&fit=crop&w=800&q=80", isAvailable: true },
  { id: "item_champ_02", categoryId: "cat_champagne_sparkling", title: "Veuve Clicquot Brut Champagne", subtitle: "Yellow label champagne with crisp citrus and brioche notes.", price: 40000, prepTime: "5 mins", isAvailable: true },
  { id: "item_champ_03", categoryId: "cat_champagne_sparkling", title: "André Brut Champagne", subtitle: "California sparkling champagne bottle.", price: 40000, prepTime: "5 mins", isAvailable: true },
  { id: "item_champ_04", categoryId: "cat_champagne_sparkling", title: "André Rosé Sparkling Wine", subtitle: "Crisp pink sparkling wine bottle.", price: 38500, prepTime: "5 mins", isAvailable: true },
  { id: "item_champ_05", categoryId: "cat_champagne_sparkling", title: "Gold Royale Sparkling Wine", subtitle: "Celebration sparkling wine bottle.", price: 38000, prepTime: "5 mins", isAvailable: true },

  // 12. Cream Liqueurs
  { id: "item_cream_01", categoryId: "cat_cream_liqueurs", title: "Baileys Original Irish Cream", subtitle: "Indulgent blend of aged Irish whiskey and rich dairy cream.", price: 50000, prepTime: "5 mins", imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80", isAvailable: true },
  { id: "item_cream_02", categoryId: "cat_cream_liqueurs", title: "Amarula Cream Liqueur (Small)", subtitle: "African marula fruit velvet cream liqueur.", price: 30000, prepTime: "5 mins", isAvailable: true },
  { id: "item_cream_03", categoryId: "cat_cream_liqueurs", title: "Best Cream Liqueur", subtitle: "Smooth dessert cream liqueur bottle.", price: 30000, prepTime: "5 mins", isAvailable: true },
  { id: "item_cream_04", categoryId: "cat_cream_liqueurs", title: "Wild Africa Cream Liqueur", subtitle: "Blend of fresh cream and spirit.", price: 25000, prepTime: "5 mins", isAvailable: true },
  { id: "item_cream_05", categoryId: "cat_cream_liqueurs", title: "Moscato / Casal Mendes / Carlo Rossi", subtitle: "Chilled house sweet dessert wine option.", price: 25000, prepTime: "5 mins", isAvailable: true },
];

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
      console.log("Admin account check:", error?.message || error);
    }
  }

  console.log("Cleaning up and re-seeding menu categories and items...");

  // Clear existing items and categories to ensure fresh catalog structure
  await db.delete(menuItem);
  await db.delete(category);

  // Insert categories
  console.log(`Inserting ${categoriesData.length} categories...`);
  await db.insert(category).values(categoriesData);

  // Insert menu items in batches
  console.log(`Inserting ${menuItemsData.length} menu items...`);
  const chunkSize = 25;
  for (let i = 0; i < menuItemsData.length; i += chunkSize) {
    const chunk = menuItemsData.slice(i, i + chunkSize);
    await db.insert(menuItem).values(chunk);
  }

  console.log("Categories and menu items seeded successfully!");

  console.log("Checking locations...");
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
  }

  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
