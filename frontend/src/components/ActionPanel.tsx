import { CheckCircle2, PlayCircle, RotateCcw, Send, Star, Trash2, XCircle } from "lucide-react";
import { isAssignableStatus } from "../api";
import type { RepairDetailVO, UserVO } from "../types";

export function ActionPanel({
  user,
  order,
  saving,
  onApprove,
  onCancel,
  onDelete,
  onConfirm,
  onStart,
  onModal,
}: {
  user: UserVO;
  order: RepairDetailVO;
  saving: boolean;
  onApprove: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onConfirm: () => void;
  onStart: () => void;
  onModal: (modal: "reject" | "assign" | "finish" | "reassign" | "feedback") => void;
}) {
  return (
    <div className="action-panel">
      {user.role === "STUDENT" && order.status === "PENDING" && (
        <>
          <button disabled={saving} className="secondary-button" onClick={onCancel}><XCircle size={16} /> 撤销报修</button>
          <button disabled={saving} className="danger-button" onClick={onDelete}><Trash2 size={16} /> 删除</button>
        </>
      )}
      {user.role === "STUDENT" && order.status === "WAIT_CONFIRM" && (
        <button disabled={saving} className="primary-button" onClick={onConfirm}><CheckCircle2 size={16} /> 确认完成</button>
      )}
      {user.role === "STUDENT" && order.status === "COMPLETED" && !order.feedback && (
        <button disabled={saving} className="primary-button" onClick={() => onModal("feedback")}><Star size={16} /> 提交评价</button>
      )}
      {user.role === "ADMIN" && order.status === "PENDING" && (
        <>
          <button disabled={saving} className="primary-button" onClick={onApprove}><CheckCircle2 size={16} /> 受理</button>
          <button disabled={saving} className="secondary-button" onClick={() => onModal("reject")}><XCircle size={16} /> 驳回</button>
        </>
      )}
      {user.role === "ADMIN" && isAssignableStatus(order.status) && (
        <button disabled={saving} className="primary-button" onClick={() => onModal("assign")}><Send size={16} /> 派单</button>
      )}
      {user.role === "ADMIN" && (
        <button disabled={saving} className="danger-button" onClick={onDelete}><Trash2 size={16} /> 删除工单</button>
      )}
      {user.role === "REPAIR" && order.status === "ASSIGNED" && (
        <button disabled={saving} className="primary-button" onClick={onStart}><PlayCircle size={16} /> 开始维修</button>
      )}
      {user.role === "REPAIR" && order.status === "PROCESSING" && (
        <button disabled={saving} className="primary-button" onClick={() => onModal("finish")}><CheckCircle2 size={16} /> 完成维修</button>
      )}
      {user.role === "REPAIR" && (order.status === "ASSIGNED" || order.status === "PROCESSING") && (
        <button disabled={saving} className="secondary-button" onClick={() => onModal("reassign")}><RotateCcw size={16} /> 申请转派</button>
      )}
    </div>
  );
}
