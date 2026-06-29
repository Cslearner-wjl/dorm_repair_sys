import type { ReactNode } from "react";
import { cn } from "../utils";

export function StatCard({
  icon,
  tone,
  label,
  value,
  suffix,
  meta,
}: {
  icon: ReactNode;
  tone: "blue" | "orange" | "green" | "amber" | "red";
  label: string;
  value: string | number;
  suffix?: string;
  meta?: string;
}) {
  return (
    <div className="stat-card">
      <span className={cn("stat-icon", tone)}>{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}<small>{suffix}</small></strong>
        {meta && <p>{meta}</p>}
      </div>
    </div>
  );
}
