import { useNavigate } from "react-router-dom";
import { AlertTriangle, BarChart3, CheckCircle2, ClipboardList, Droplets, Gauge, Send, Users, Wrench } from "lucide-react";
import { formatDateTime } from "../utils";
import { repairApi, statisticsApi } from "../api";
import { useAsyncData } from "../hooks/useAsyncData";
import { DataState } from "../components/DataState";
import { PanelTitle } from "../components/PanelTitle";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { TrendChart } from "../components/TrendChart";
import { Distribution } from "../components/Distribution";
import { RepairerList } from "../components/RepairerList";

export function AdminHome() {
  const navigate = useNavigate();
  const { data: overview, loading, error, reload } = useAsyncData(() => statisticsApi.overview(), []);
  const { data: daily } = useAsyncData(() => statisticsApi.daily(7), []);
  const { data: urgent } = useAsyncData(() => repairApi.all({ page: 1, pageSize: 6, status: "PENDING" }), []);
  const categories = overview?.categoryStats ?? [];
  const repairers = overview?.repairerStats ?? [];

  return (
    <div className="space-y">
      <section className="panel admin-heading">
        <div>
          <p className="eyebrow">管理端工作台</p>
          <h1>报修管理总览</h1>
          <p>集中查看待处理工单、维修进度和人员工作量。</p>
        </div>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => navigate("/admin/orders")}><ClipboardList size={18} /> 工单管理</button>
          <button className="secondary-button" onClick={() => navigate("/admin/dispatch")}><Send size={18} /> 快速派单</button>
        </div>
      </section>

      <DataState loading={loading} error={error} empty={!overview} onRetry={reload} emptyText="暂无统计数据">
        {overview && (
          <>
            <section className="stats-grid four">
              <StatCard icon={<ClipboardList />} tone="blue" label="今日/累计工单" value={overview.totalOrders} suffix="单" meta="报修总数" />
              <StatCard icon={<Gauge />} tone="orange" label="待受理" value={overview.pendingOrders} suffix="单" meta="需要审核" />
              <StatCard icon={<Wrench />} tone="blue" label="处理中" value={overview.processingOrders} suffix="单" meta="维修流程中" />
              <StatCard icon={<CheckCircle2 />} tone="green" label="已完成" value={overview.completedOrders} suffix="单" meta={`均分 ${overview.averageScore ?? "-"}`} />
            </section>
            <div className="dashboard-grid">
              <section className="panel chart-panel">
                <PanelTitle icon={<BarChart3 />} title="近 7 天报修趋势" subtitle="创建与完成数量" />
                <TrendChart data={daily ?? []} />
              </section>
              <section className="panel chart-panel">
                <PanelTitle icon={<Droplets />} title="报修类型分布" subtitle="按分类统计" />
                <Distribution data={categories} />
              </section>
              <section className="panel table-panel">
                <PanelTitle icon={<AlertTriangle />} title="待受理工单" subtitle="优先处理新提交工单" action={<button className="link-button" onClick={() => navigate("/admin/orders")}>查看全部</button>} />
                <div className="compact-list">
                  {(urgent?.items ?? []).map((order) => (
                    <button key={order.id} className="repair-row-card" onClick={() => navigate(`/repair/${order.id}`)}>
                      <StatusBadge status={order.status} />
                      <strong>{order.title}</strong>
                      <span>{order.studentName || "-"} · {order.dormBuilding} {order.roomNo}</span>
                      <small>{formatDateTime(order.createdAt)}</small>
                    </button>
                  ))}
                  {!(urgent?.items ?? []).length && <div className="empty-inline">暂无待受理工单</div>}
                </div>
              </section>
              <section className="panel">
                <PanelTitle icon={<Users />} title="维修人员状态" subtitle="工作量与完成数量" action={<button className="link-button" onClick={() => navigate("/admin/dispatch")}>进入派单</button>} />
                <RepairerList data={repairers} />
              </section>
            </div>
          </>
        )}
      </DataState>
    </div>
  );
}
