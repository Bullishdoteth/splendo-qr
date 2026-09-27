"use client";

import { Bell, Utensils, Truck, CheckCircle2, Clock, LucideIcon } from "lucide-react";

interface OrderProgressProps {
  status: string;
}

interface Step {
  key: string;
  label: string;
  subtext: string;
  icon: LucideIcon;
}

export function OrderProgress({ status }: OrderProgressProps) {
  const statusSteps: Step[] = [
    {
      key: "received",
      label: "Order Received",
      subtext: "Kitchen notified",
      icon: Bell,
    },
    {
      key: "in_kitchen",
      label: "In Kitchen",
      subtext: "Chefs preparing meal",
      icon: Utensils,
    },
    {
      key: "delivering",
      label: "Out for Delivery",
      subtext: "Room service en route",
      icon: Truck,
    },
    {
      key: "delivered",
      label: "Delivered",
      subtext: "Meal delivered",
      icon: CheckCircle2,
    },
  ];

  const getStepIndex = (s: string) => {
    switch (s) {
      case "received":
        return 0;
      case "in_kitchen":
        return 1;
      case "delivering":
        return 2;
      case "delivered":
        return 3;
      default:
        return 0;
    }
  };

  const currentStepIdx = getStepIndex(status);

  // Percentage for progress line fill
  const progressPercentage = (currentStepIdx / (statusSteps.length - 1)) * 100;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E3DB] shadow-xs space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-[#E5E3DB] pb-3">
        <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#183B32]" />
          <span>Live Order Progress</span>
        </h2>
        <span className="text-xs font-semibold text-stone-500">
          Step {currentStepIdx + 1} of {statusSteps.length}
        </span>
      </div>

      {/* Line Roadmap Journey - Desktop & Tablet (Horizontal) */}
      <div className="hidden sm:block relative pt-2 pb-4">
        {/* Background Track Line */}
        <div className="absolute top-7 left-[8%] right-[8%] h-1 bg-stone-200 rounded-full -z-0" />

        {/* Filled Progress Line */}
        <div
          className="absolute top-7 left-[8%] h-1 bg-[#183B32] rounded-full transition-all duration-700 ease-out -z-0"
          style={{ width: `calc(${progressPercentage}% * 0.84)` }}
        />

        {/* Step Nodes */}
        <div className="flex justify-between items-start relative z-10 px-4">
          {statusSteps.map((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className="flex flex-col items-center text-center max-w-[130px]"
              >
                {/* Step Circle Icon Node */}
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-[#183B32] border-[#183B32] text-white shadow-md"
                      : "bg-[#FAF9F5] border-stone-300 text-stone-400"
                  } ${
                    isCurrent
                      ? "ring-4 ring-[#183B32]/20 scale-110"
                      : ""
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Step Text Info */}
                <div className="mt-3 space-y-0.5">
                  <p
                    className={`text-xs font-bold leading-tight ${
                      isCompleted ? "text-stone-900" : "text-stone-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-stone-500 leading-tight">
                    {step.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Line Roadmap Journey - Mobile (Vertical Timeline) */}
      <div className="block sm:hidden relative pl-2 py-2">
        {/* Vertical Background Line */}
        <div className="absolute left-6 top-6 bottom-6 w-1 bg-stone-200 rounded-full -z-0" />

        {/* Vertical Active Fill Line */}
        <div
          className="absolute left-6 top-6 w-1 bg-[#183B32] rounded-full transition-all duration-700 ease-out -z-0"
          style={{ height: `${progressPercentage}%` }}
        />

        {/* Mobile Step Nodes */}
        <div className="space-y-6 relative z-10">
          {statusSteps.map((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = idx === currentStepIdx;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                    isCompleted
                      ? "bg-[#183B32] border-[#183B32] text-white shadow-sm"
                      : "bg-[#FAF9F5] border-stone-300 text-stone-400"
                  } ${
                    isCurrent
                      ? "ring-4 ring-[#183B32]/20 scale-105"
                      : ""
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>

                <div className="space-y-0.5 min-w-0">
                  <p
                    className={`text-xs font-bold leading-tight ${
                      isCompleted ? "text-stone-900" : "text-stone-400"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-stone-500 leading-tight">
                    {step.subtext}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
