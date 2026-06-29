import { Search } from "lucide-react";
import { REPAIR_FILTER_CATEGORIES, REPAIR_STATUS_LABELS, REPAIR_STATUS_OPTIONS } from "../constants";
import type { RepairQueryDTO, RepairStatus } from "../types";

export function FilterBar({
  query,
  onChange,
  showCategory,
}: {
  query: RepairQueryDTO;
  onChange: (query: RepairQueryDTO) => void;
  showCategory?: boolean;
}) {
  return (
    <div className="filter-bar">
      <div className="search-box">
        <Search size={16} />
        <input
          value={query.keyword ?? ""}
          onChange={(event) => onChange({ ...query, keyword: event.target.value, page: 1 })}
          placeholder="搜索工单编号或问题标题"
        />
      </div>
      {showCategory && (
        <select value={query.category ?? ""} onChange={(event) => onChange({ ...query, category: event.target.value, page: 1 })}>
          <option value="">全部类型</option>
          {REPAIR_FILTER_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
        </select>
      )}
      <select value={query.status ?? ""} onChange={(event) => onChange({ ...query, status: event.target.value as RepairStatus | "", page: 1 })}>
        <option value="">全部状态</option>
        {REPAIR_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{REPAIR_STATUS_LABELS[status]}</option>)}
      </select>
    </div>
  );
}
