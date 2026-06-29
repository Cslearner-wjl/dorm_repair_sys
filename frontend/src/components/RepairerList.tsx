import type { RepairerStatisticVO } from "../types";

export function RepairerList({ data }: { data: RepairerStatisticVO[] }) {
  if (!data.length) return <div className="empty-inline">暂无维修员统计</div>;
  return (
    <div className="repairer-list">
      {data.map((item) => (
        <div key={item.repairerId} className="repairer-row">
          <span className="avatar">{item.repairerName.slice(0, 1)}</span>
          <strong>{item.repairerName}</strong>
          <span>进行中 {item.activeCount} 单</span>
          <span>已完成 {item.completedCount} 单</span>
          <span>评分 {item.averageScore ?? "-"}</span>
        </div>
      ))}
    </div>
  );
}
