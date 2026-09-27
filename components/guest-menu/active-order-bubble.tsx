"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Utensils } from "lucide-react";

interface ActiveOrderBubbleProps {
  placedOrderId: string | null;
  locationName: string;
  onOrderCompleted?: () => void;
}

export function ActiveOrderBubble({
  placedOrderId,
  onOrderCompleted,
}: ActiveOrderBubbleProps) {
  const router = useRouter();

  // Position state (initial: right edge, middle height)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number }>({
    x: 0,
    y: 0,
    posX: 0,
    posY: 0,
  });
  const hasDraggedRef = useRef(false);

  // Set initial default position near the right edge, middle height
  useEffect(() => {
    if (typeof window !== "undefined") {
      const initialX = window.innerWidth - 64;
      const initialY = window.innerHeight * 0.45;
      setPosition({ x: initialX, y: initialY });
    }
  }, []);

  // Poll order status to persist bubble until order is delivered or cancelled
  useEffect(() => {
    if (!placedOrderId) return;

    let isSubscribed = true;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${placedOrderId}`);
        if (!isSubscribed) return;

        if (!res.ok) {
          if (res.status === 404) {
            onOrderCompleted?.();
          }
          return;
        }

        const data = await res.json();
        if (!isSubscribed) return;

        if (data?.order?.status === "delivered" || data?.order?.status === "cancelled") {
          onOrderCompleted?.();
        }
      } catch (err) {
        console.error("Error checking active order status:", err);
      }
    };

    checkStatus();

    const interval = setInterval(checkStatus, 8000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [placedOrderId, onOrderCompleted]);

  if (!placedOrderId || !position) return null;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasDraggedRef.current = true;
    }

    const newX = Math.max(10, Math.min(window.innerWidth - 58, dragStartRef.current.posX + dx));
    const newY = Math.max(70, Math.min(window.innerHeight - 80, dragStartRef.current.posY + dy));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // pointer capture release fallback
    }

    // If tap/click without dragging, navigate to order tracking page
    if (!hasDraggedRef.current) {
      router.push(`/order/${placedOrderId}`);
    }
  };

  return (
    <div
      ref={dragRef}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="fixed top-0 left-0 z-50 touch-none select-none cursor-grab active:cursor-grabbing transition-transform duration-75"
      title={`Active Order #${placedOrderId} - Tap to track, drag to move`}
    >
      <div className="relative group">
        {/* Subtle glowing halo */}
        <div className="absolute -inset-1 rounded-full bg-stone-500/30 blur-xs group-hover:bg-stone-500/50 transition-all" />

        {/* Floating Bubble Badge */}
        <div className="relative w-13 h-13 rounded-full bg-black text-white flex items-center justify-center border-2 border-neutral-700 hover:bg-neutral-900 hover:scale-105 active:scale-95 transition-all">
          <Utensils className="w-5.5 h-5.5 text-white" />

          {/* Pulsing Red Notification Dot */}
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5 -mt-0.5 -mr-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500 border-2 border-black" />
          </span>
        </div>
      </div>
    </div>
  );
}
