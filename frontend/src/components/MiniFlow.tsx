import type { RepairStatus } from "../types";
import { cn, statusLabel } from "../utils";
import { STATUS_FLOW } from "../constants";

export function MiniFlow({ current }: { current: RepairStatus }) {
  const index = STATUS_FLOW.indexOf(current);
  return (
    <div className="mini-flow">
      {STATUS_FLOW.map((status, statusIndex) => (
        <span key={status} className={cn(statusIndex <= index && "done")} title={statusLabel(status)} />
      ))}
    </div>
  );
}
