import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "warning" | "success";
};

const toneStyles = {
  default: "border-slate-200 bg-white text-slate-900",
  warning: "border-amber-200 bg-amber-50/50 text-amber-950",
  success: "border-emerald-200 bg-emerald-50/50 text-emerald-950",
};

const iconToneStyles = {
  default: "bg-slate-100 text-slate-600",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700",
};

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: MetricCardProps) {
  return (
    <div
      className={[
        "rounded-xl border p-5 shadow-sm",
        toneStyles[tone],
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          {hint && (
            <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
          )}
        </div>
        {Icon && (
          <div
            className={[
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              iconToneStyles[tone],
            ].join(" ")}
          >
            <Icon className="size-5" aria-hidden />
          </div>
        )}
      </div>
    </div>
  );
}
