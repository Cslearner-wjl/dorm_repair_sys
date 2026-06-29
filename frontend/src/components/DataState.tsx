import type { ReactNode } from "react";
import { AlertTriangle, FileText, RefreshCw } from "lucide-react";

export function DataState({
  loading,
  error,
  empty,
  emptyText,
  onRetry,
  children,
}: {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyText: string;
  onRetry?: () => void;
  children: ReactNode;
}) {
  if (loading) {
    return <div className="state-box"><RefreshCw className="spin" size={24} /> 正在加载数据</div>;
  }
  if (error) {
    return (
      <div className="state-box error">
        <AlertTriangle size={26} />
        <strong>接口请求失败</strong>
        <p>{error}</p>
        {onRetry && <button className="secondary-button" onClick={onRetry}>重试</button>}
      </div>
    );
  }
  if (empty) {
    return <div className="state-box"><FileText size={26} /> {emptyText}</div>;
  }
  return <>{children}</>;
}
