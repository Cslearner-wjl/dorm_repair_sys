import type { StatisticItemVO } from "../types";
import { buildDonut, chartColor } from "../utils";

export function Distribution({ data }: { data: StatisticItemVO[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  return (
    <div className="distribution">
      <div className="donut" style={{ background: buildDonut(data, total) }}>
        <strong>{total}</strong>
        <span>总计</span>
      </div>
      <div className="legend">
        {data.map((item, index) => (
          <span key={item.name}><i style={{ background: chartColor(index) }} /> {item.name} <strong>{item.count}</strong></span>
        ))}
        {!data.length && <div className="empty-inline">暂无分类统计</div>}
      </div>
    </div>
  );
}
