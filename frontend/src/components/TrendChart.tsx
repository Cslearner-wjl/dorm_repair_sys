import type { DailyStatisticVO } from "../types";

export function TrendChart({ data }: { data: DailyStatisticVO[] }) {
  const max = Math.max(1, ...data.map((item) => Math.max(item.createdCount, item.completedCount)));
  const totalCreated = data.reduce((sum, item) => sum + item.createdCount, 0);
  const totalCompleted = data.reduce((sum, item) => sum + item.completedCount, 0);
  const completionRate = totalCreated ? `${Math.round((totalCompleted / totalCreated) * 100)}%` : "-";
  const peakDay = data.reduce<DailyStatisticVO | null>((best, item) => {
    if (!best || item.createdCount > best.createdCount) return item;
    return best;
  }, null);
  const peakLabel = peakDay && peakDay.createdCount > 0 ? `${peakDay.date.slice(5)} ${peakDay.createdCount}单` : "暂无峰值";
  const barHeight = (count: number) => (count > 0 ? Math.max(8, (count / max) * 100) : 0);
  const metrics = [
    { label: "7天新增", value: `${totalCreated}单`, tone: "created" },
    { label: "7天完成", value: `${totalCompleted}单`, tone: "completed" },
    { label: "完成率", value: completionRate, tone: "rate" },
    { label: "峰值日", value: peakLabel, tone: "peak" },
  ];

  return (
    <div className="trend-chart">
      <div className="trend-metrics">
        {metrics.map((item) => (
          <div key={item.label} className={`trend-metric ${item.tone}`}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>

      <div className="trend-toolbar">
        <div className="trend-legend" aria-label="趋势图例">
          <span><i className="trend-legend-dot created" /> 创建</span>
          <span><i className="trend-legend-dot completed" /> 完成</span>
        </div>
        <small>柱顶数字为当日数量</small>
      </div>

      {data.length ? (
        <div className="trend-plot">
          {data.map((item) => (
            <div key={item.date} className="trend-day">
              <div className="bar-pair">
                <div className="bar-slot" title={`${item.date} 创建 ${item.createdCount} 单`}>
                  {item.createdCount > 0 && (
                    <span className="bar created" style={{ height: `${barHeight(item.createdCount)}%` }}>
                      <span className="bar-value">{item.createdCount}</span>
                    </span>
                  )}
                </div>
                <div className="bar-slot" title={`${item.date} 完成 ${item.completedCount} 单`}>
                  {item.completedCount > 0 && (
                    <span className="bar completed" style={{ height: `${barHeight(item.completedCount)}%` }}>
                      <span className="bar-value">{item.completedCount}</span>
                    </span>
                  )}
                </div>
              </div>
              <small>{item.date.slice(5)}</small>
            </div>
          ))}
        </div>
      ) : (
        <div className="trend-empty">暂无趋势数据</div>
      )}
    </div>
  );
}
