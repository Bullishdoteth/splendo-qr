"use client";

import Link from "next/link";
import { CheckCircle, ChevronRight, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";

interface OrderConfirmationModalProps {
  isOpen: boolean;
  placedOrderId: string | null;
  locationName: string;
  onClose: () => void;
}

export function OrderConfirmationModal({
  isOpen,
  placedOrderId,
  locationName,
  onClose,
}: OrderConfirmationModalProps) {
  return (
    <Drawer
      open={isOpen && Boolean(placedOrderId)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      showSwipeHandle
    >
      <DrawerContent className="max-w-md mx-auto p-6 space-y-5 font-sans text-center overflow-y-auto">
        <div className="flex justify-end -mr-2 -mt-2">
          <DrawerClose
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close confirmation"
          >
            <X className="w-5 h-5" />
          </DrawerClose>
        </div>

        <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#183B32] flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-9 h-9" />
        </div>

        <div className="space-y-1.5">
          <DrawerTitle className="text-xl font-bold text-stone-900 text-center">
            Order #{placedOrderId} Placed!
          </DrawerTitle>
          <DrawerDescription className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto text-center">
            Your room service order has been sent to the executive kitchen for
            delivery to{" "}
            <strong className="text-stone-900">{locationName}</strong>.
          </DrawerDescription>
        </div>

        <div className="space-y-2.5 pt-2">
          <Link
            href={`/order/${placedOrderId}`}
            className="w-full py-3.5 rounded-full bg-[#183B32] text-white font-semibold text-xs hover:bg-[#112D26] transition-colors shadow-md flex items-center justify-center gap-1.5"
          >
            <span>Track Order Status</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <DrawerClose
            onClick={onClose}
            className="w-full py-3 rounded-full border border-[#E5E3DB] bg-white text-stone-600 font-semibold text-xs hover:bg-stone-50 transition-colors cursor-pointer"
          >
            Back to Menu
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
