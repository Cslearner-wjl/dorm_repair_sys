import { Phone, UserRound } from "lucide-react";
import { ROLE_LABELS } from "../constants";
import type { ToastMessage, UserVO } from "../types";
import { maskPhone } from "../utils";
import { InfoItem } from "../components/InfoItem";
import { PanelTitle } from "../components/PanelTitle";

export function ProfilePage({
  user,
  onToast,
}: {
  user: UserVO;
  onToast: (toast: ToastMessage | null) => void;
}) {
  return (
    <div className="space-y">
      <section className="profile-hero panel">
        <div className="avatar large">{user.realName.slice(0, 1)}</div>
        <div>
          <h1>{user.realName}</h1>
          <p>{ROLE_LABELS[user.role]} · {user.username}</p>
          <p>{maskPhone(user.phone)}</p>
        </div>
        <button className="secondary-button" onClick={() => onToast({ type: "success", message: "资料已同步" })}>同步资料</button>
      </section>
      <div className="two-column">
        <section className="panel">
          <PanelTitle icon={<UserRound />} title="个人信息" subtitle="当前账号基础资料" />
          <div className="info-grid">
            <InfoItem label="账号" value={user.username} />
            <InfoItem label="姓名" value={user.realName} />
            <InfoItem label="角色" value={ROLE_LABELS[user.role]} />
            <InfoItem label="手机号" value={maskPhone(user.phone)} />
            <InfoItem label="账号状态" value={user.status === 1 ? "启用" : "禁用"} />
          </div>
        </section>
        <section className="panel">
          <PanelTitle icon={<Phone />} title="常用联系电话" subtitle="校园宿舍维修服务" />
          <div className="phone-list">
            <span>宿舍管理员 <strong>138 8888 1234</strong></span>
            <span>后勤维修中心 <strong>0755-1234 5678</strong></span>
            <span>校园服务热线 <strong>0755-1234 0000</strong></span>
          </div>
        </section>
      </div>
    </div>
  );
}
