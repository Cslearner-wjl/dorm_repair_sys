import { useNavigate } from "react-router-dom";
import { HERO_IMAGE } from "../constants";
import { repairApi } from "../api";
import { useAsyncData } from "../hooks/useAsyncData";
import { DataState } from "../components/DataState";
import { CategoryPill } from "../components/CategoryPill";
import { StatusBadge } from "../components/StatusBadge";
import { MiniFlow } from "../components/MiniFlow";
import { formatDateTime } from "../utils";

export function TrackingPage() {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsyncData(() => repairApi.my({ page: 1, pageSize: 20 }), []);
  const orders = (data?.items ?? []).filter((order) => !["COMPLETED", "CANCELLED", "REJECTED"].includes(order.status));

  return (
    <div className="space-y">
      <section className="hero-panel compact-hero">
        <div className="hero-copy">
          <p className="eyebrow">进度跟踪</p>
          <h1>当前处理中工单</h1>
          <p>状态来自工单详情和处理记录，可继续进入详情查看完整时间线。</p>
        </div>
        <img src={HERO_IMAGE} alt="宿舍维修进度插画" />
      </section>
      <DataState loading={loading} error={error} empty={!orders.length} onRetry={reload} emptyText="暂无进行中的工单">
        <div className="tracking-grid">
          {orders.map((order) => (
            <button key={order.id} className="tracking-card panel" onClick={() => navigate(`/repair/${order.id}`)}>
              <div className="tracking-head">
                <CategoryPill category={order.category} />
                <StatusBadge status={order.status} />
              </div>
              <h3>{order.title}</h3>
              <p>{order.dormBuilding} {order.roomNo} · {formatDateTime(order.createdAt)}</p>
              <MiniFlow current={order.status} />
            </button>
          ))}
        </div>
      </DataState>
    </div>
  );
}
