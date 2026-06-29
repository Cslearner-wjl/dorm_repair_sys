import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import type { ToastMessage } from "../types";
import { cn } from "../utils";

export function ToastBar({
  toast,
  onClose,
}: {
  toast: ToastMessage;
  onClose: () => void;
}) {
  return (
    <div className={cn("toast", toast.type)}>
      {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
      <span>{toast.message}</span>
      <button onClick={onClose}><X size={15} /></button>
    </div>
  );
}
