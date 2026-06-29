import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ClipboardList, Eye, Gauge, RefreshCw, Wrench } from "lucide-react";
import type { RepairOrderVO, RepairQueryDTO, ToastMessage } from "../types";
import { repairApi } from "../api";
import { useAsyncData } from "../hooks/useAsyncData";
import { DataState } from "../components/DataState";
import { FilterBar } from "../components/FilterBar";
import { PanelTitle } from "../components/PanelTitle";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { CategoryPill } from "../components/CategoryPill";
import { Pagination } from "../components/Pagination";
import { emptyPage, formatDateTime } from "../utils";

export function RepairListPage({
  mode,
  onToast,
}: {
  mode: "student" | "admin" | "repairer";
  onToast: (toast: ToastMessage | null) => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState<RepairQueryDTO>({ page: 1, pageSize: 10, status: "", category: "", keyword: "" });
  const [refreshKey, setRefreshKey] = useState(0);
  const [quickActionId, setQuickActionId] = useState<number | null>(null);
  const loader = useCallback(() => {
    if (mode === "admin") return repairApi.all(query);
    if (mode === "repairer") return repairApi.repairerMy(query);
    return repairApi.my(query);
  }, [mode, query]);
  const { data, loading, error, reload } = useAsyncData(loader, [loader, refreshKey]);
  const page = data ?? emptyPage<RepairOrderVO>();
  const orders = page.items;

  const runQuick = async (order: RepairOrderVO, action: "approve" | "start") => {
    setQuickActionId(order.id);
    try {
      if (action === "approve") await repairApi.approve(order.id);
      if (action === "start") await repairApi.start(order.id);
      onToast({ type: "success", message: "工单状态已更新" });
      setRefreshKey((key) => key + 1);
    } catch (error) {
      onToast({ type: "error", message: error instanceof Error ? error.message : "操作失败" });
    } finally {
      setQuickActionId(null);
    }
  };

  const pageTitle = mode === "admin" ? "工单管理" : mode === "repairer" ? "我的维修任务" : "我的报修记录";
  const pageSubtitle =
    mode === "admin" ? "查看、审核、派单和跟踪全部报修工单" : mode === "repairer" ? "处理分配给你的维修任务" : "查看并跟踪你提交的报修工单";

  return (
    <div className="space-y">
      <section className="panel">
        <PanelTitle icon={<ClipboardList />} title={pageTitle} subtitle={pageSubtitle} action={<button className="secondary-button compact" onClick={reload}><RefreshCw size={16} /> 刷新</button>} />
        <FilterBar query={query} onChange={setQuery} showCategory />
      </section>

      <section className="stats-grid four">
        <StatCard icon={<ClipboardList />} tone="blue" label="当前列表" value={page.total} suffix="单" meta="按筛选条件" />
        <StatCard icon={<Gauge />} tone="orange" label="待受理" value={orders.filter((o) => o.status === "PENDING").length} suffix="单" meta="当前页" />
        <StatCard icon={<Wrench />} tone="blue" label="处理中" value={orders.filter((o) => o.status === "PROCESSING").length} suffix="单" meta="当前页" />
        <StatCard icon={<CheckCircle2 />} tone="green" label="已完成" value={orders.filter((o) => o.status === "COMPLETED").length} suffix="单" meta="当前页" />
      </section>

      <section className="panel table-panel">
        <DataState loading={loading} error={error} empty={!orders.length} onRetry={reload} emptyText="暂无工单数据">
          <table className="data-table">
            <thead>
              <tr>
                <th>工单编号</th>
                <th>问题标题</th>
                <th>报修类型</th>
                {mode === "admin" && <th>报修人</th>}
                <th>报修位置</th>
                <th>提交时间</th>
                <th>当前状态</th>
                <th>维修人员</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNo}</td>
                  <td>
                    <strong>{order.title}</strong>
                    <small>{order.category}</small>
                  </td>
                  <td><CategoryPill category={order.category} /></td>
                  {mode === "admin" && <td>{order.studentName || "-"}</td>}
                  <td>{order.dormBuilding} {order.roomNo}</td>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>{order.repairerName || "-"}</td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => navigate(`/repair/${order.id}`)}><Eye size={15} /> 详情</button>
                      {mode === "admin" && order.status === "PENDING" && (
                        <button disabled={quickActionId === order.id} onClick={() => runQuick(order, "approve")}>受理</button>
                      )}
                      {mode === "repairer" && order.status === "ASSIGNED" && (
                        <button disabled={quickActionId === order.id} onClick={() => runQuick(order, "start")}>开始</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} onPage={(next) => setQuery((current) => ({ ...current, page: next }))} />
        </DataState>
      </section>
    </div>
  );
}
