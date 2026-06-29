import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Wrench } from "lucide-react";
import type { ToastMessage, UserVO } from "./types";
import { authApi, clearToken, getToken, setToken } from "./api";
import { roleHome } from "./utils";
import { AppShell } from "./components/AppShell";
import { ToastBar } from "./components/ToastBar";
import { AuthScreen } from "./pages/AuthScreen";
import { StudentHome } from "./pages/StudentHome";
import { RepairCreatePage } from "./pages/RepairCreatePage";
import { RepairListPage } from "./pages/RepairListPage";
import { TrackingPage } from "./pages/TrackingPage";
import { RepairDetailPage } from "./pages/RepairDetailPage";
import { AdminHome } from "./pages/AdminHome";
import { DispatchPage } from "./pages/DispatchPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AnnouncementsPage } from "./pages/AnnouncementsPage";

export function App() {
  const [currentUser, setCurrentUser] = useState<UserVO | null>(null);
  const [checking, setChecking] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function boot() {
      if (!getToken()) {
        setChecking(false);
        return;
      }
      try {
        const user = await authApi.me();
        if (!mounted) return;
        setCurrentUser(user);
        navigate(roleHome(user.role), { replace: true });
      } catch {
        clearToken();
      } finally {
        if (mounted) setChecking(false);
      }
    }
    boot();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleLogin = async (username: string, password: string) => {
    const result = await authApi.login({ username, password });
    setToken(result.token);
    setCurrentUser(result.user);
    navigate(roleHome(result.user.role), { replace: true });
    setToast({ type: "success", message: `欢迎回来，${result.user.realName}` });
  };

  const handleLogout = () => {
    clearToken();
    setCurrentUser(null);
    navigate("/", { replace: true });
  };

  if (checking) {
    return (
      <div className="boot-screen">
        <div className="brand-mark"><Wrench size={26} /></div>
        <p>正在连接宿舍报修系统</p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} onToast={setToast} toast={toast} />;
  }

  return (
    <AppShell user={currentUser} onLogout={handleLogout}>
      {toast && <ToastBar toast={toast} onClose={() => setToast(null)} />}
      <Routes>
        {/* 公共页面 */}
        <Route path="/" element={<StudentHome user={currentUser} />} />
        <Route path="/create-repair" element={<RepairCreatePage user={currentUser} onToast={setToast} />} />
        <Route path="/my-repairs" element={<RepairListPage mode="student" onToast={setToast} />} />
        <Route path="/tracking" element={<TrackingPage />} />
        <Route path="/announcements" element={<AnnouncementsPage />} />
        <Route path="/profile" element={<ProfilePage user={currentUser} onToast={setToast} />} />
        <Route path="/repair/:id" element={<RepairDetailPage user={currentUser} onToast={setToast} />} />

        {/* 管理员页面 */}
        {currentUser.role === "ADMIN" && (
          <>
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/admin/orders" element={<RepairListPage mode="admin" onToast={setToast} />} />
            <Route path="/admin/dispatch" element={<DispatchPage onToast={setToast} />} />
            <Route path="/admin/users" element={<UserManagementPage onToast={setToast} />} />
          </>
        )}

        {/* 维修员页面 */}
        {currentUser.role === "REPAIR" && (
          <Route path="/repairer/tasks" element={<RepairListPage mode="repairer" onToast={setToast} />} />
        )}
      </Routes>
    </AppShell>
  );
}
