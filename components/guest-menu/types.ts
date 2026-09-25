export interface MenuItem {
  id: string;
  categoryId: string;
  title: string;
  subtitle: string | null;
  price: number;
  prepTime: string;
  imageUrl: string | null;
  isAvailable: boolean;
  isFeatured?: boolean;
}

export interface CategoryWithItems {
  id: string;
  name: string;
  description: string | null;
  items: MenuItem[];
}

export interface LocationInfo {
  id: string;
  name: string;
  slug: string;
  category: string;
  floor: string | null;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export const formatPrice = (val: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(val);
};
