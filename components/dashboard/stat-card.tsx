import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-stone-400",
}: StatCardProps) {
  return (
    <div className="p-3.5 sm:p-5 rounded-2xl bg-white border border-[#E2E2DC] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-2 sm:space-y-3 min-w-0 font-sans">
      <div className="flex items-center justify-between text-stone-500">
        <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider truncate">
          {title}
        </span>
        <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
      </div>
      <p className="text-lg sm:text-2xl font-bold text-stone-900 truncate">
        {value}
      </p>
      <p className="text-[10px] sm:text-xs text-stone-500 font-medium truncate">
        {subtitle}
      </p>
    </div>
  );
}
