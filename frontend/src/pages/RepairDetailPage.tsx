import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClipboardCheck, Phone, Star, Wrench } from "lucide-react";
import CATEGORY_ICONS from "../icons";
import { HERO_IMAGE } from "../constants";
import type { ToastMessage, UserVO } from "../types";
import { maskPhone, formatFullDateTime, roleHome } from "../utils";
import { repairApi, userApi } from "../api";
import { useAsyncData } from "../hooks/useAsyncData";
import { DataState } from "../components/DataState";
import { PanelTitle } from "../components/PanelTitle";
import { StatusBadge } from "../components/StatusBadge";
import { Timeline } from "../components/Timeline";
import { InfoItem } from "../components/InfoItem";
import { ActionPanel } from "../components/ActionPanel";
import { TextModal } from "../components/TextModal";
import { AssignModal } from "../components/AssignModal";
import { FeedbackModal } from "../components/FeedbackModal";

export function RepairDetailPage({
  user,
  onToast,
}: {
  user: UserVO;
  onToast: (toast: ToastMessage | null) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const repairId = Number(id);
  const { data, loading, error, reload } = useAsyncData(() => repairApi.detail(repairId), [repairId]);
  const [modal, setModal] = useState<null | "reject" | "assign" | "finish" | "reassign" | "feedback">(null);
  const [repairers, setRepairers] = useState<UserVO[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user.role !== "ADMIN") return;
    userApi.repairers().then(setRepairers).catch(() => setRepairers([]));
  }, [user.role]);

  const run = async (label: string, action: () => Promise<unknown>) => {
    setSaving(true);
    try {
      await action();
      onToast({ type: "success", message: label });
      setModal(null);
      await reload();
    } catch (error) {
      onToast({ type: "error", message: error instanceof Error ? error.message : "操作失败" });
    } finally {
      setSaving(false);
    }
  };

  const order = data;

  return (
    <DataState loading={loading} error={error} empty={!order} onRetry={reload} emptyText="未找到工单详情">
      {order && (
        <div className="space-y">
          <button className="link-button" onClick={() => navigate(roleHome(user.role))}>返回工作台</button>
          <section className="detail-hero panel">
            <div className="detail-main">
              <div className="detail-icon">{CATEGORY_ICONS[order.category] ?? <Wrench size={32} />}</div>
              <div>
                <h1>{order.title}</h1>
                <p>工单编号：{order.orderNo}</p>
                <p>报修时间：{formatFullDateTime(order.createdAt)}</p>
                <p>报修位置：{order.dormBuilding} {order.roomNo}</p>
                <p>问题描述：{order.description}</p>
              </div>
            </div>
            <div className="detail-status">
              <span>当前状态</span>
              <StatusBadge status={order.status} large />
              <p>{order.repairerName ? `维修人员：${order.repairerName}` : "尚未分配维修人员"}</p>
            </div>
            <img src={HERO_IMAGE} alt="宿舍维修详情插画" />
          </section>

          <div className="detail-grid">
            <section className="panel">
              <PanelTitle icon={<ClipboardCheck />} title="处理进度" subtitle="后端处理记录时间线" />
              <Timeline records={order.records ?? []} status={order.status} />
            </section>
            <section className="panel">
              <PanelTitle icon={<Phone />} title="维修信息" subtitle="报修人与维修人员联系方式" />
              <div className="info-grid">
                <InfoItem label="报修类型" value={order.category} />
                <InfoItem label="联系电话" value={maskPhone(order.contactPhone)} />
                <InfoItem label="报修人" value={order.studentName || "-"} />
                <InfoItem label="维修人员" value={order.repairerName || "未派单"} />
                {order.rejectReason && <InfoItem label="驳回原因" value={order.rejectReason} />}
              </div>
              <ActionPanel
                user={user}
                order={order}
                saving={saving}
                onApprove={() => run("工单已受理", () => repairApi.approve(order.id))}
                onCancel={() => run("工单已撤销", () => repairApi.cancel(order.id))}
                onDelete={() => run("工单已删除", () => repairApi.remove(order.id))}
                onConfirm={() => run("已确认完成", () => repairApi.confirm(order.id))}
                onStart={() => run("已开始维修", () => repairApi.start(order.id))}
                onModal={setModal}
              />
            </section>
          </div>

          <section className="panel">
            <PanelTitle icon={<Star />} title="服务评价" subtitle="维修完成后由学生提交" />
            {order.feedback ? (
              <div className="feedback-box">
                <strong>{order.feedback.score}.0</strong>
                <span>{"★".repeat(order.feedback.score)}</span>
                <p>{order.feedback.comment || "暂无文字评价"}</p>
                <small>{formatFullDateTime(order.feedback.createdAt)}</small>
              </div>
            ) : (
              <div className="empty-inline">暂无评价</div>
            )}
          </section>

          {modal === "reject" && (
            <TextModal
              title="驳回报修"
              label="驳回原因"
              placeholder="请填写驳回原因"
              saving={saving}
              onClose={() => setModal(null)}
              onSubmit={(value) => run("工单已驳回", () => repairApi.reject(order.id, value))}
            />
          )}
          {modal === "assign" && (
            <AssignModal
              repairers={repairers}
              saving={saving}
              onClose={() => setModal(null)}
              onSubmit={(repairerId, remark) => run("工单已派发", () => repairApi.assign(order.id, repairerId, remark))}
            />
          )}
          {modal === "finish" && (
            <TextModal
              title="完成维修"
              label="维修说明"
              placeholder="请填写维修完成情况"
              saving={saving}
              onClose={() => setModal(null)}
              onSubmit={(value) => run("维修结果已提交", () => repairApi.finish(order.id, value))}
            />
          )}
          {modal === "reassign" && (
            <TextModal
              title="申请转派"
              label="转派原因"
              placeholder="请填写无法继续处理的原因"
              saving={saving}
              onClose={() => setModal(null)}
              onSubmit={(value) => run("转派申请已提交", () => repairApi.requestReassign(order.id, value))}
            />
          )}
          {modal === "feedback" && (
            <FeedbackModal
              saving={saving}
              onClose={() => setModal(null)}
              onSubmit={(score, comment) => run("评价已提交", () => repairApi.feedback(order.id, score, comment))}
            />
          )}
        </div>
      )}
    </DataState>
  );
}
