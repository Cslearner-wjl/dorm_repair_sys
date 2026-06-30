import { Gauge, Settings, UsersRound } from "lucide-react";

const SLOGAN_FEATURES = [
  {
    icon: <Settings size={28} />,
    title: "快速响应",
    description: "报修提交后快速流转，减少线下沟通成本",
  },
  {
    icon: <Gauge size={28} />,
    title: "透明进度",
    description: "处理状态清晰可见，维修过程实时跟踪",
  },
  {
    icon: <UsersRound size={28} />,
    title: "多角色协同",
    description: "学生、管理员、维修员分工明确，高效协作",
  },
];

export function AuthSlogan() {
  return (
    <div className="auth-copy">
      <h1>
        欢迎使用
        <br />
        宿舍报修管理系统
      </h1>
      <p>学生报修、进度跟踪、管理员协同，一体化完成。</p>
      <ul className="auth-feature-list" aria-label="系统能力">
        {SLOGAN_FEATURES.map((feature) => (
          <li className="auth-feature-item" key={feature.title}>
            <span className="auth-feature-icon" aria-hidden="true">{feature.icon}</span>
            <span className="auth-feature-copy">
              <strong>{feature.title}</strong>
              <span>{feature.description}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
