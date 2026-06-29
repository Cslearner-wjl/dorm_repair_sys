import { useNavigate } from "react-router-dom";
import { CheckCircle2, ClipboardList, Gauge, Plus, Star, Wrench } from "lucide-react";
import CATEGORY_ICONS from "../icons";
import { HERO_IMAGE, REPAIR_CATEGORIES } from "../constants";
import type { UserVO } from "../types";
import { countByStatus, formatDateTime } from "../utils";
import { repairApi } from "../api";
import { useAsyncData } from "../hooks/useAsyncData";
import { DataState } from "../components/DataState";
import { PanelTitle } from "../components/PanelTitle";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";

const quickCategoryLabel = (category: string) => category.replace("维修", "");

export function StudentHome({ user }: { user: UserVO }) {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsyncData(() => repairApi.my({ page: 1, pageSize: 100 }), []);
  const orders = data?.items ?? [];
  const recent = orders.slice(0, 5);
  const completed = countByStatus(orders, "COMPLETED");
  const pending = countByStatus(orders, "PENDING");
  const scoreLabel = "-";

  return (
    <div className="space-y">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">松园宿舍服务中心</p>
          <h1>欢迎回来，{user.realName}</h1>
          <p>有问题随时报修，处理进度会跟随工单状态实时更新。</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => navigate("/create-repair")}><Plus size={18} /> 我要报修</button>
            <button className="secondary-button" onClick={() => navigate("/my-repairs")}><ClipboardList size={18} /> 查看记录</button>
          </div>
        </div>
        <img src={HERO_IMAGE} alt="宿舍楼与维修工具" />
      </section>

      <section className="stats-grid four">
        <StatCard icon={<ClipboardList />} tone="blue" label="我的报修" value={orders.length} suffix="单" meta="当前账号记录" />
        <StatCard icon={<Gauge />} tone="orange" label="待处理" value={pending} suffix="单" meta="等待管理员受理" />
        <StatCard icon={<CheckCircle2 />} tone="green" label="已完成" value={completed} suffix="单" meta="已闭环工单" />
        <StatCard icon={<Star />} tone="amber" label="满意度" value={scoreLabel} suffix="" meta="评价后统计" />
      </section>

      <div className="two-column">
        <section className="panel">
          <PanelTitle icon={<Wrench />} title="快速报修" subtitle="选择类型后进入提交页面" action={<button className="link-button" onClick={() => navigate("/create-repair")}>新增工单</button>} />
          <div className="category-grid">
            {REPAIR_CATEGORIES.slice(0, 6).map((category) => (
              <button key={category} className="category-tile" title={category} onClick={() => navigate("/create-repair")}>
                {CATEGORY_ICONS[category] ?? <Wrench size={22} />}
                <span>{quickCategoryLabel(category)}</span>
              </button>
            ))}
          </div>
          <div className="soft-note">紧急情况请联系宿管值班电话：123-4567-8900</div>
        </section>
        <section className="panel">
          <PanelTitle icon={<ClipboardList />} title="我的报修" subtitle="最近提交的工单" action={<button className="link-button" onClick={() => navigate("/my-repairs")}>全部报修</button>} />
          <DataState loading={loading} error={error} empty={!recent.length} onRetry={reload} emptyText="暂无报修记录">
            <div className="compact-list">
              {recent.map((order) => (
                <button key={order.id} className="repair-row-card" onClick={() => navigate(`/repair/${order.id}`)}>
                  <StatusBadge status={order.status} />
                  <strong>{order.title}</strong>
                  <span>{order.dormBuilding} {order.roomNo}</span>
                  <small>{formatDateTime(order.createdAt)}</small>
                </button>
              ))}
            </div>
          </DataState>
        </section>
      </div>
    </div>
  );
}
