export interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  locationName: string;
  totalAmount: number;
  status: "received" | "in_kitchen" | "delivering" | "delivered" | "cancelled";
  specialInstructions: string | null;
  createdAt: string;
  items: OrderItem[];
}

export const formatPrice = (val: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(val);
};

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "received":
      return {
        label: "Order Received",
        style: "bg-black text-white border-black",
      };
    case "in_kitchen":
      return {
        label: "Preparing",
        style: "bg-amber-100/80 text-amber-900 border-amber-200/80",
      };
    case "delivering":
      return {
        label: "In Transit",
        style: "bg-blue-100/80 text-blue-900 border-blue-200/80",
      };
    case "delivered":
      return {
        label: "Delivered",
        style: "bg-stone-100 text-stone-700 border-stone-200",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        style: "bg-red-100 text-red-700 border-red-200",
      };
    default:
      return {
        label: status,
        style: "bg-stone-100 text-stone-700 border-stone-200",
      };
  }
};
