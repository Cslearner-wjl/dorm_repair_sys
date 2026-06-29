import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackageCheck, RefreshCw, Send, Users, Wrench } from "lucide-react";
import CATEGORY_ICONS from "../icons";
import type { RepairOrderVO, ToastMessage } from "../types";
import { cn, maskPhone } from "../utils";
import { repairApi, userApi } from "../api";
import { useAsyncData } from "../hooks/useAsyncData";
import { DataState } from "../components/DataState";
import { PanelTitle } from "../components/PanelTitle";
import { StatusBadge } from "../components/StatusBadge";

export function DispatchPage({
  onToast,
}: {
  onToast: (toast: ToastMessage | null) => void;
}) {
  const navigate = useNavigate();
  const { data: pending, loading, error, reload } = useAsyncData(
    () => repairApi.all({ page: 1, pageSize: 20, status: "APPROVED" }),
    [],
  );
  const { data: reassign, reload: reloadReassign } = useAsyncData(() => repairApi.all({ page: 1, pageSize: 20, status: "NEED_REASSIGN" }), []);
  const { data: repairers } = useAsyncData(() => userApi.repairers(), []);
  const [selectedOrder, setSelectedOrder] = useState<RepairOrderVO | null>(null);
  const [selectedRepairer, setSelectedRepairer] = useState<number | "">("");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const orders = [...(pending?.items ?? []), ...(reassign?.items ?? [])];

  useEffect(() => {
    if (!selectedOrder && orders.length) setSelectedOrder(orders[0]);
  }, [orders, selectedOrder]);

  const submit = async () => {
    if (!selectedOrder || !selectedRepairer) return;
    setSaving(true);
    try {
      await repairApi.assign(selectedOrder.id, Number(selectedRepairer), remark);
      onToast({ type: "success", message: "派单完成" });
      setSelectedOrder(null);
      setSelectedRepairer("");
      setRemark("");
      await reload();
      reloadReassign();
    } catch (error) {
      onToast({ type: "error", message: error instanceof Error ? error.message : "派单失败" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dispatch-layout">
      <section className="panel">
        <PanelTitle icon={<Send />} title="待派单报修单" subtitle="已受理或需重派的工单" action={<button className="secondary-button compact" onClick={reload}><RefreshCw size={16} /> 刷新</button>} />
        <DataState loading={loading} error={error} empty={!orders.length} onRetry={reload} emptyText="暂无待派单工单">
          <div className="dispatch-list">
            {orders.map((order) => (
              <button
                key={order.id}
                className={cn("dispatch-order", selectedOrder?.id === order.id && "selected")}
                onClick={() => setSelectedOrder(order)}
              >
                <span className="category-icon">{CATEGORY_ICONS[order.category] ?? <Wrench size={20} />}</span>
                <strong>{order.title}</strong>
                <span>{order.dormBuilding} {order.roomNo}</span>
                <StatusBadge status={order.status} />
              </button>
            ))}
          </div>
        </DataState>
      </section>

      <section className="panel">
        <PanelTitle icon={<Users />} title="维修人员" subtitle="选择合适人员进行派单" />
        <div className="repairer-grid">
          {(repairers ?? []).map((repairer) => (
            <button
              key={repairer.id}
              className={cn("repairer-card", selectedRepairer === repairer.id && "selected")}
              onClick={() => setSelectedRepairer(repairer.id)}
            >
              <span className="avatar">{repairer.realName.slice(0, 1)}</span>
              <strong>{repairer.realName}</strong>
              <small>{repairer.username}</small>
              <span>{maskPhone(repairer.phone)}</span>
            </button>
          ))}
        </div>
        <div className="confirm-box">
          <PanelTitle icon={<PackageCheck />} title="派单确认" subtitle={selectedOrder ? selectedOrder.title : "请选择报修单"} />
          <textarea value={remark} onChange={(event) => setRemark(event.target.value)} placeholder="备注（可选）" />
          <div className="form-actions">
            {selectedOrder && <button className="secondary-button" onClick={() => navigate(`/repair/${selectedOrder.id}`)}>查看详情</button>}
            <button className="primary-button" disabled={!selectedOrder || !selectedRepairer || saving} onClick={submit}>
              {saving ? "派单中..." : "确认派单"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
