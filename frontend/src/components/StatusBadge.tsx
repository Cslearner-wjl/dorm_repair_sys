import type { RepairStatus } from "../types";
import { cn, statusClass, statusLabel } from "../utils";

export function StatusBadge({
  status,
  large,
}: {
  status: RepairStatus;
  large?: boolean;
}) {
  return (
    <span className={cn("status-badge", statusClass(status), large ? "large" : "")}>
      {statusLabel(status)}
    </span>
  );
}
