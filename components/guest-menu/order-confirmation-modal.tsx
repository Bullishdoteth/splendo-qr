"use client";

import Link from "next/link";
import { CheckCircle, ChevronRight } from "lucide-react";

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
  if (!isOpen || !placedOrderId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-[#E5E3DB] animate-in zoom-in-95 duration-200">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#183B32] flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl font-bold text-stone-900">
            Order #{placedOrderId} Placed!
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Your room service order has been sent to the executive kitchen for
            delivery to{" "}
            <strong className="text-stone-900">{locationName}</strong>.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Link
            href={`/order/${placedOrderId}`}
            className="w-full py-3 rounded-full bg-[#183B32] text-white font-semibold text-xs hover:bg-[#112D26] transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <span>Track Order Status</span>
            <ChevronRight className="w-4 h-4" />
          </Link>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full border border-[#E5E3DB] bg-white text-stone-600 font-semibold text-xs hover:bg-stone-50 transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
