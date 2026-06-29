import { CheckCircle2 } from "lucide-react";
import type { RepairDetailVO, RepairStatus } from "../types";
import { cn, formatFullDateTime, statusLabel } from "../utils";

export function Timeline({
  records,
  status,
}: {
  records: RepairDetailVO["records"];
  status: RepairStatus;
}) {
  if (!records?.length) {
    return (
      <div className="timeline">
        <div className="timeline-item active">
          <span><CheckCircle2 size={16} /></span>
          <div><strong>{statusLabel(status)}</strong><p>暂无处理记录明细</p></div>
        </div>
      </div>
    );
  }
  return (
    <div className="timeline">
      {records.map((record, index) => (
        <div key={record.id} className={cn("timeline-item", index === records.length - 1 && "active")}>
          <span><CheckCircle2 size={16} /></span>
          <div>
            <strong>{record.action}</strong>
            <p>{record.content}</p>
            <small>{record.operatorName} · {formatFullDateTime(record.createdAt)}</small>
          </div>
        </div>
      ))}
    </div>
  );
}
