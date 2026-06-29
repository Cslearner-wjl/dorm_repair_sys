import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, ClipboardCheck, ClipboardList, Home, LogOut, Megaphone, Send, UserRound, Users, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { MessageIcon } from "./MessageIcon";
import { ROLE_LABELS } from "../constants";
import type { UserVO } from "../types";
import { cn, roleHome } from "../utils";

export function AppShell({
  user,
  onLogout,
  children,
}: {
  user: UserVO;
  onLogout: () => void;
  children: ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const nav = useMemo(() => {
    if (user.role === "ADMIN") {
      return [
        { path: "/admin", label: "首页总览", icon: <Home size={18} /> },
        { path: "/admin/orders", label: "工单管理", icon: <ClipboardList size={18} /> },
        { path: "/admin/dispatch", label: "派单调度", icon: <Send size={18} /> },
        { path: "/admin/users", label: "维修人员", icon: <Users size={18} /> },
        { path: "/announcements", label: "通知公告", icon: <Megaphone size={18} /> },
        { path: "/profile", label: "个人中心", icon: <UserRound size={18} /> },
      ] as Array<{ path: string; label: string; icon: ReactNode }>;
    }
    if (user.role === "REPAIR") {
      return [
        { path: "/repairer/tasks", label: "我的工单", icon: <ClipboardCheck size={18} /> },
        { path: "/announcements", label: "通知公告", icon: <Megaphone size={18} /> },
        { path: "/profile", label: "个人中心", icon: <UserRound size={18} /> },
      ] as Array<{ path: string; label: string; icon: ReactNode }>;
    }
    return [
      { path: "/", label: "首页", icon: <Home size={18} /> },
      { path: "/create-repair", label: "我要报修", icon: <Wrench size={18} /> },
      { path: "/my-repairs", label: "我的报修", icon: <ClipboardList size={18} /> },
      { path: "/tracking", label: "进度跟踪", icon: <MessageIcon /> },
      { path: "/announcements", label: "通知公告", icon: <Megaphone size={18} /> },
      { path: "/profile", label: "个人中心", icon: <UserRound size={18} /> },
    ] as Array<{ path: string; label: string; icon: ReactNode }>;
  }, [user.role]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => navigate(roleHome(user.role))}>
          <span className="brand-mark"><Wrench size={24} /></span>
          <span>宿舍报修管理系统</span>
        </button>
        <nav className="nav-tabs" aria-label="主导航">
          {nav.map((item) => (
            <button
              key={item.path}
              className={cn("nav-item", isActive(item.path) && "active")}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="top-actions">
          <button className="icon-button" title="通知">
            <Bell size={19} />
          </button>
          <div className="user-chip">
            <span className="avatar">{user.realName.slice(0, 1)}</span>
            <span className="user-meta">
              <strong>{user.realName}</strong>
              <small>{ROLE_LABELS[user.role]}</small>
            </span>
          </div>
          <button className="icon-button" title="退出登录" onClick={onLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <main className="page">{children}</main>
    </div>
  );
}
