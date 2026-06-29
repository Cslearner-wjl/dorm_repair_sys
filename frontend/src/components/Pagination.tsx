import type { PageResult } from "../types";

export function Pagination<T>({
  page,
  onPage,
}: {
  page: PageResult<T>;
  onPage: (page: number) => void;
}) {
  const pageCount = Math.max(1, Math.ceil(page.total / page.pageSize));
  return (
    <div className="pagination">
      <span>共 {page.total} 条记录</span>
      <button disabled={page.page <= 1} onClick={() => onPage(page.page - 1)}>上一页</button>
      <strong>{page.page} / {pageCount}</strong>
      <button disabled={page.page >= pageCount} onClick={() => onPage(page.page + 1)}>下一页</button>
    </div>
  );
}
