import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Armchair,
  BarChart3,
  Bath,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  DoorOpen,
  Droplets,
  Eye,
  FileText,
  Gauge,
  Hammer,
  Home,
  KeyRound,
  LogOut,
  Mail,
  Megaphone,
  MoreHorizontal,
  PackageCheck,
  Phone,
  PlayCircle,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  UserRound,
  Users,
  Wifi,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import {
  authApi,
  clearToken,
  getToken,
  isAssignableStatus,
  repairApi,
  setToken,
  statisticsApi,
  uploadApi,
  userApi,
} from "./api";
import { BUILDINGS, DEMO_ACCOUNTS, REPAIR_CATEGORIES, REPAIR_STATUS_LABELS, REPAIR_STATUS_OPTIONS, ROLE_LABELS } from "./constants";
import type {
  DailyStatisticVO,
  PageResult,
  RepairDetailVO,
  RepairFormDTO,
  RepairOrderVO,
  RepairQueryDTO,
  RepairStatus,
  RepairerStatisticVO,
  StatisticItemVO,
  StatisticsOverviewVO,
  UserRole,
  UserVO,
} from "./types";
import {
  activeRepairCount,
  cn,
  countByStatus,
  formatDateTime,
  formatFullDateTime,
  maskPhone,
  roleHome,
  statusClass,
  statusLabel,
} from "./utils";

type View =
  | "student-home"
  | "create-repair"
  | "my-repairs"
  | "tracking"
  | "announcements"
  | "profile"
  | "admin-home"
  | "admin-orders"
  | "dispatch"
  | "users"
  | "repairer-tasks"
  | "repair-detail";

type Toast = { type: "success" | "error"; message: string } | null;

const heroImage = "/assets/dorm-repair-hero.png";

const CATEGORY_ICONS: Record<string, ReactNode> = {
  水电维修: <Droplets size={22} />,
  门窗维修: <DoorOpen size={22} />,
  家具维修: <Armchair size={22} />,
  网络维修: <Wifi size={22} />,
  卫生维修: <Bath size={22} />,
  电器维修: <Wrench size={22} />,
  公共设施: <Building2 size={22} />,
  其他维修: <MoreHorizontal size={22} />,
};

const STATUS_FLOW: RepairStatus[] = ["PENDING", "APPROVED", "ASSIGNED", "PROCESSING", "WAIT_CONFIRM", "COMPLETED"];

const emptyPage = <T,>(): PageResult<T> => ({ page: 1, pageSize: 10, total: 0, items: [] });

export function App() {
  const [currentUser, setCurrentUser] = useState<UserVO | null>(null);
  const [view, setView] = useState<View>("student-home");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);
  const [toast, setToast] = useState<Toast>(null);

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
        setView(roleHome(user.role) as View);
      } catch {
        clearToken();
      } finally {
        if (mounted) setChecking(false);
      }
    }
    boot();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const openDetail = useCallback((id: number) => {
    setDetailId(id);
    setView("repair-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const result = await authApi.login({ username, password });
    setToken(result.token);
    setCurrentUser(result.user);
    setView(roleHome(result.user.role) as View);
    setToast({ type: "success", message: `欢迎回来，${result.user.realName}` });
  };

  const handleLogout = () => {
    clearToken();
    setCurrentUser(null);
    setDetailId(null);
    setView("student-home");
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
    <AppShell user={currentUser} view={view} onView={setView} onLogout={handleLogout}>
      {toast && <ToastBar toast={toast} onClose={() => setToast(null)} />}
      {view === "student-home" && <StudentHome user={currentUser} onView={setView} onOpenDetail={openDetail} />}
      {view === "create-repair" && <RepairCreatePage user={currentUser} onToast={setToast} onView={setView} />}
      {view === "my-repairs" && <RepairListPage mode="student" onOpenDetail={openDetail} onToast={setToast} />}
      {view === "tracking" && <TrackingPage onOpenDetail={openDetail} />}
      {view === "announcements" && <AnnouncementsPage />}
      {view === "profile" && <ProfilePage user={currentUser} onToast={setToast} />}
      {view === "admin-home" && <AdminHome onView={setView} onOpenDetail={openDetail} />}
      {view === "admin-orders" && <RepairListPage mode="admin" onOpenDetail={openDetail} onToast={setToast} />}
      {view === "dispatch" && <DispatchPage onOpenDetail={openDetail} onToast={setToast} />}
      {view === "users" && <UserManagementPage onToast={setToast} />}
      {view === "repairer-tasks" && <RepairListPage mode="repairer" onOpenDetail={openDetail} onToast={setToast} />}
      {view === "repair-detail" && detailId && (
        <RepairDetailPage
          id={detailId}
          user={currentUser}
          onToast={setToast}
          onBack={() => setView(roleHome(currentUser.role) as View)}
        />
      )}
    </AppShell>
  );
}

function AppShell({
  user,
  view,
  onView,
  onLogout,
  children,
}: {
  user: UserVO;
  view: View;
  onView: (view: View) => void;
  onLogout: () => void;
  children: ReactNode;
}) {
  const nav = useMemo(() => {
    if (user.role === "ADMIN") {
      return [
        { id: "admin-home", label: "首页总览", icon: <Home size={18} /> },
        { id: "admin-orders", label: "工单管理", icon: <ClipboardList size={18} /> },
        { id: "dispatch", label: "派单调度", icon: <Send size={18} /> },
        { id: "users", label: "维修人员", icon: <Users size={18} /> },
        { id: "announcements", label: "通知公告", icon: <Megaphone size={18} /> },
        { id: "profile", label: "个人中心", icon: <UserRound size={18} /> },
      ] as Array<{ id: View; label: string; icon: ReactNode }>;
    }
    if (user.role === "REPAIR") {
      return [
        { id: "repairer-tasks", label: "我的工单", icon: <ClipboardCheck size={18} /> },
        { id: "announcements", label: "通知公告", icon: <Megaphone size={18} /> },
        { id: "profile", label: "个人中心", icon: <UserRound size={18} /> },
      ] as Array<{ id: View; label: string; icon: ReactNode }>;
    }
    return [
      { id: "student-home", label: "首页", icon: <Home size={18} /> },
      { id: "create-repair", label: "我要报修", icon: <Wrench size={18} /> },
      { id: "my-repairs", label: "我的报修", icon: <ClipboardList size={18} /> },
      { id: "tracking", label: "进度跟踪", icon: <MessageIcon /> },
      { id: "announcements", label: "通知公告", icon: <Megaphone size={18} /> },
      { id: "profile", label: "个人中心", icon: <UserRound size={18} /> },
    ] as Array<{ id: View; label: string; icon: ReactNode }>;
  }, [user.role]);

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => onView(roleHome(user.role) as View)}>
          <span className="brand-mark"><Wrench size={24} /></span>
          <span>宿舍报修管理系统</span>
        </button>
        <nav className="nav-tabs" aria-label="主导航">
          {nav.map((item) => (
            <button
              key={item.id}
              className={cn("nav-item", view === item.id && "active")}
              onClick={() => onView(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="top-actions">
          <button className="icon-button" title="通知">
            <Bell size={19} />
            <span className="dot">3</span>
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

function AuthScreen({
  onLogin,
  onToast,
  toast,
}: {
  onLogin: (username: string, password: string) => Promise<void>;
  onToast: (toast: Toast) => void;
  toast: Toast;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [roleHint, setRoleHint] = useState<UserRole>("STUDENT");
  const [username, setUsername] = useState("student001");
  const [password, setPassword] = useState("123456");
  const [realName, setRealName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (mode === "register") {
        await authApi.register({ username, password, realName, phone });
        await onLogin(username, password);
      } else {
        await onLogin(username, password);
      }
    } catch (error) {
      onToast({ type: "error", message: error instanceof Error ? error.message : "登录失败" });
    } finally {
      setSaving(false);
    }
  };

  const applyDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setMode("login");
    setRoleHint(account.role);
    setUsername(account.username);
    setPassword(account.password);
  };

  return (
    <div className="auth-page">
      {toast && <ToastBar toast={toast} onClose={() => onToast(null)} />}
      <div className="auth-shell">
        <section className="auth-visual">
          <div className="auth-brand">
            <span className="brand-mark"><Wrench size={24} /></span>
            <span>宿舍报修管理系统</span>
          </div>
          <h1>让宿舍维修更高效、更透明</h1>
          <p>一站式报修 · 进度可查 · 服务可评</p>
          <img src={heroImage} alt="宿舍维修插画" />
        </section>
        <section className="auth-card">
          <div className="auth-tabs">
            <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>账号登录</button>
            <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>学生注册</button>
          </div>
          <div className="role-tabs">
            {(["STUDENT", "ADMIN", "REPAIR"] as UserRole[]).map((role) => (
              <button key={role} className={roleHint === role ? "active" : ""} onClick={() => setRoleHint(role)}>
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>
          <form onSubmit={submit} className="form-stack">
            <label>
              <span>账号</span>
              <div className="input-with-icon">
                <UserRound size={18} />
                <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="请输入账号" required />
              </div>
            </label>
            {mode === "register" && (
              <>
                <label>
                  <span>姓名</span>
                  <div className="input-with-icon">
                    <UserRound size={18} />
                    <input value={realName} onChange={(event) => setRealName(event.target.value)} placeholder="请输入真实姓名" required />
                  </div>
                </label>
                <label>
                  <span>手机号</span>
                  <div className="input-with-icon">
                    <Phone size={18} />
                    <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="请输入 11 位手机号" required />
                  </div>
                </label>
              </>
            )}
            <label>
              <span>密码</span>
              <div className="input-with-icon">
                <KeyRound size={18} />
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="请输入密码" required />
              </div>
            </label>
            <button className="primary-button full" disabled={saving}>
              {saving ? "提交中..." : mode === "register" ? "注册并登录" : "登录系统"}
            </button>
          </form>
          <div className="demo-row">
            {DEMO_ACCOUNTS.map((account) => (
              <button key={account.username} onClick={() => applyDemo(account)}>{account.label}</button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StudentHome({
  user,
  onView,
  onOpenDetail,
}: {
  user: UserVO;
  onView: (view: View) => void;
  onOpenDetail: (id: number) => void;
}) {
  const { data, loading, error, reload } = useAsyncData(() => repairApi.my({ page: 1, pageSize: 100 }), []);
  const orders = data?.items ?? [];
  const recent = orders.slice(0, 5);
  const completed = countByStatus(orders, "COMPLETED");
  const pending = countByStatus(orders, "PENDING");
  const scoreLabel = "-";

  return (
    <div className="space-y">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">松园宿舍服务中心</p>
          <h1>欢迎回来，{user.realName}</h1>
          <p>有问题随时报修，处理进度会跟随工单状态实时更新。</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => onView("create-repair")}><Plus size={18} /> 我要报修</button>
            <button className="secondary-button" onClick={() => onView("my-repairs")}><ClipboardList size={18} /> 查看记录</button>
          </div>
        </div>
        <img src={heroImage} alt="宿舍楼与维修工具" />
      </section>

      <section className="stats-grid four">
        <StatCard icon={<ClipboardList />} tone="blue" label="我的报修" value={orders.length} suffix="单" meta="当前账号记录" />
        <StatCard icon={<Gauge />} tone="orange" label="待处理" value={pending} suffix="单" meta="等待管理员受理" />
        <StatCard icon={<CheckCircle2 />} tone="green" label="已完成" value={completed} suffix="单" meta="已闭环工单" />
        <StatCard icon={<Star />} tone="amber" label="满意度" value={scoreLabel} suffix="" meta="评价后统计" />
      </section>

      <div className="two-column">
        <section className="panel">
          <PanelTitle icon={<Wrench />} title="快速报修" subtitle="选择类型后进入提交页面" action={<button className="link-button" onClick={() => onView("create-repair")}>新增工单</button>} />
          <div className="category-grid">
            {REPAIR_CATEGORIES.slice(0, 6).map((category) => (
              <button key={category} className="category-tile" onClick={() => onView("create-repair")}>
                {CATEGORY_ICONS[category] ?? <Wrench size={22} />}
                <span>{category}</span>
              </button>
            ))}
          </div>
          <div className="soft-note">紧急情况请联系宿管值班电话：123-4567-8900</div>
        </section>
        <section className="panel">
          <PanelTitle icon={<ClipboardList />} title="我的报修" subtitle="最近提交的工单" action={<button className="link-button" onClick={() => onView("my-repairs")}>全部报修</button>} />
          <DataState loading={loading} error={error} empty={!recent.length} onRetry={reload} emptyText="暂无报修记录">
            <div className="compact-list">
              {recent.map((order) => (
                <button key={order.id} className="repair-row-card" onClick={() => onOpenDetail(order.id)}>
                  <StatusBadge status={order.status} />
                  <strong>{order.title}</strong>
                  <span>{order.dormBuilding} {order.roomNo}</span>
                  <small>{formatDateTime(order.createdAt)}</small>
                </button>
              ))}
            </div>
          </DataState>
        </section>
      </div>
    </div>
  );
}

function RepairCreatePage({
  user,
  onToast,
  onView,
}: {
  user: UserVO;
  onToast: (toast: Toast) => void;
  onView: (view: View) => void;
}) {
  const [form, setForm] = useState<RepairFormDTO>({
    dormBuilding: BUILDINGS[0],
    roomNo: "",
    category: REPAIR_CATEGORIES[0],
    title: "",
    description: "",
    contactPhone: user.phone || "",
    imageUrls: "",
  });
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const update = (key: keyof RepairFormDTO, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const next: string[] = [];
      for (const file of Array.from(files).slice(0, 3)) {
        const result = await uploadApi.image(file);
        next.push(result.url);
      }
      const merged = [...uploaded, ...next].slice(0, 3);
      setUploaded(merged);
      update("imageUrls", merged.join(","));
      onToast({ type: "success", message: "图片已上传" });
    } catch (error) {
      onToast({ type: "error", message: error instanceof Error ? error.message : "上传失败" });
    } finally {
      setUploading(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await repairApi.create(form);
      onToast({ type: "success", message: "报修申请已提交" });
      onView("my-repairs");
    } catch (error) {
      onToast({ type: "error", message: error instanceof Error ? error.message : "提交失败" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="create-layout">
      <section className="panel form-panel">
        <PanelTitle icon={<Wrench />} title="提交报修申请" subtitle="请填写准确的宿舍位置和故障描述" />
        <form className="repair-form" onSubmit={submit}>
          <div className="field-group full">
            <span className="field-label">报修类型</span>
            <div className="category-selector">
              {REPAIR_CATEGORIES.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={cn(form.category === category && "selected")}
                  onClick={() => update("category", category)}
                >
                  {CATEGORY_ICONS[category] ?? <Wrench size={20} />}
                  {category}
                </button>
              ))}
            </div>
          </div>
          <label className="field-group">
            <span className="field-label">宿舍楼栋</span>
            <select value={form.dormBuilding} onChange={(event) => update("dormBuilding", event.target.value)} required>
              {BUILDINGS.map((building) => <option key={building}>{building}</option>)}
            </select>
          </label>
          <label className="field-group">
            <span className="field-label">宿舍房间号</span>
            <input value={form.roomNo} onChange={(event) => update("roomNo", event.target.value)} placeholder="如：302" required />
          </label>
          <label className="field-group full">
            <span className="field-label">问题标题</span>
            <input value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="请概括问题，例如：水龙头漏水" required />
          </label>
          <label className="field-group full">
            <span className="field-label">问题描述</span>
            <textarea value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="请描述故障现象、发生时间和影响范围" minLength={10} required />
          </label>
          <label className="field-group full">
            <span className="field-label">联系电话</span>
            <input value={form.contactPhone} onChange={(event) => update("contactPhone", event.target.value)} placeholder="请输入 11 位手机号" required />
          </label>
          <div className="field-group full">
            <span className="field-label">上传照片</span>
            <label className="upload-card">
              <Upload size={22} />
              <span>{uploading ? "上传中..." : "选择图片，最多 3 张"}</span>
              <input type="file" accept="image/*" multiple onChange={(event) => handleUpload(event.target.files)} disabled={uploading} />
            </label>
            {!!uploaded.length && (
              <div className="uploaded-list">
                {uploaded.map((url) => (
                  <span key={url}>{url}</span>
                ))}
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={() => setForm({ ...form, roomNo: "", title: "", description: "", imageUrls: "" })}>重置</button>
            <button className="primary-button" disabled={saving}>{saving ? "提交中..." : "提交申请"}</button>
          </div>
        </form>
      </section>
      <aside className="panel side-guide">
        <PanelTitle icon={<ShieldCheck />} title="报修须知" subtitle="提交后管理员会按状态流转处理" />
        <ul className="guide-list">
          <li>描述越清晰，管理员越容易快速受理。</li>
          <li>可上传现场照片，方便维修人员判断问题。</li>
          <li>工单创建后默认进入“待受理”。</li>
          <li>维修完成后可在详情页确认并评价。</li>
        </ul>
        <img src={heroImage} alt="维修说明插画" />
      </aside>
    </div>
  );
}

function RepairListPage({
  mode,
  onOpenDetail,
  onToast,
}: {
  mode: "student" | "admin" | "repairer";
  onOpenDetail: (id: number) => void;
  onToast: (toast: Toast) => void;
}) {
  const [query, setQuery] = useState<RepairQueryDTO>({ page: 1, pageSize: 10, status: "", category: "", keyword: "" });
  const [refreshKey, setRefreshKey] = useState(0);
  const [quickActionId, setQuickActionId] = useState<number | null>(null);
  const loader = useCallback(() => {
    if (mode === "admin") return repairApi.all(query);
    if (mode === "repairer") return repairApi.repairerMy(query);
    return repairApi.my(query);
  }, [mode, query]);
  const { data, loading, error, reload } = useAsyncData(loader, [loader, refreshKey]);
  const page = data ?? emptyPage<RepairOrderVO>();
  const orders = page.items;

  const runQuick = async (order: RepairOrderVO, action: "approve" | "start") => {
    setQuickActionId(order.id);
    try {
      if (action === "approve") await repairApi.approve(order.id);
      if (action === "start") await repairApi.start(order.id);
      onToast({ type: "success", message: "工单状态已更新" });
      setRefreshKey((key) => key + 1);
    } catch (error) {
      onToast({ type: "error", message: error instanceof Error ? error.message : "操作失败" });
    } finally {
      setQuickActionId(null);
    }
  };

  const pageTitle = mode === "admin" ? "工单管理" : mode === "repairer" ? "我的维修任务" : "我的报修记录";
  const pageSubtitle =
    mode === "admin" ? "查看、审核、派单和跟踪全部报修工单" : mode === "repairer" ? "处理分配给你的维修任务" : "查看并跟踪你提交的报修工单";

  return (
    <div className="space-y">
      <section className="panel">
        <PanelTitle icon={<ClipboardList />} title={pageTitle} subtitle={pageSubtitle} action={<button className="secondary-button compact" onClick={reload}><RefreshCw size={16} /> 刷新</button>} />
        <FilterBar query={query} onChange={setQuery} showCategory />
      </section>

      <section className="stats-grid four">
        <StatCard icon={<ClipboardList />} tone="blue" label="当前列表" value={page.total} suffix="单" meta="按筛选条件" />
        <StatCard icon={<Gauge />} tone="orange" label="待受理" value={orders.filter((o) => o.status === "PENDING").length} suffix="单" meta="当前页" />
        <StatCard icon={<Wrench />} tone="blue" label="处理中" value={orders.filter((o) => o.status === "PROCESSING").length} suffix="单" meta="当前页" />
        <StatCard icon={<CheckCircle2 />} tone="green" label="已完成" value={orders.filter((o) => o.status === "COMPLETED").length} suffix="单" meta="当前页" />
      </section>

      <section className="panel table-panel">
        <DataState loading={loading} error={error} empty={!orders.length} onRetry={reload} emptyText="暂无工单数据">
          <table className="data-table">
            <thead>
              <tr>
                <th>工单编号</th>
                <th>问题标题</th>
                <th>报修类型</th>
                {mode === "admin" && <th>报修人</th>}
                <th>报修位置</th>
                <th>提交时间</th>
                <th>当前状态</th>
                <th>维修人员</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNo}</td>
                  <td>
                    <strong>{order.title}</strong>
                    <small>{order.category}</small>
                  </td>
                  <td><CategoryPill category={order.category} /></td>
                  {mode === "admin" && <td>{order.studentName || "-"}</td>}
                  <td>{order.dormBuilding} {order.roomNo}</td>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td>{order.repairerName || "-"}</td>
                  <td>
                    <div className="row-actions">
                      <button onClick={() => onOpenDetail(order.id)}><Eye size={15} /> 详情</button>
                      {mode === "admin" && order.status === "PENDING" && (
                        <button disabled={quickActionId === order.id} onClick={() => runQuick(order, "approve")}>受理</button>
                      )}
                      {mode === "repairer" && order.status === "ASSIGNED" && (
                        <button disabled={quickActionId === order.id} onClick={() => runQuick(order, "start")}>开始</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} onPage={(next) => setQuery((current) => ({ ...current, page: next }))} />
        </DataState>
      </section>
    </div>
  );
}

function TrackingPage({ onOpenDetail }: { onOpenDetail: (id: number) => void }) {
  const { data, loading, error, reload } = useAsyncData(() => repairApi.my({ page: 1, pageSize: 20 }), []);
  const orders = (data?.items ?? []).filter((order) => !["COMPLETED", "CANCELLED", "REJECTED"].includes(order.status));

  return (
    <div className="space-y">
      <section className="hero-panel compact-hero">
        <div className="hero-copy">
          <p className="eyebrow">进度跟踪</p>
          <h1>当前处理中工单</h1>
          <p>状态来自工单详情和处理记录，可继续进入详情查看完整时间线。</p>
        </div>
        <img src={heroImage} alt="宿舍维修进度插画" />
      </section>
      <DataState loading={loading} error={error} empty={!orders.length} onRetry={reload} emptyText="暂无进行中的工单">
        <div className="tracking-grid">
          {orders.map((order) => (
            <button key={order.id} className="tracking-card panel" onClick={() => onOpenDetail(order.id)}>
              <div className="tracking-head">
                <CategoryPill category={order.category} />
                <StatusBadge status={order.status} />
              </div>
              <h3>{order.title}</h3>
              <p>{order.dormBuilding} {order.roomNo} · {formatDateTime(order.createdAt)}</p>
              <MiniFlow current={order.status} />
            </button>
          ))}
        </div>
      </DataState>
    </div>
  );
}

function RepairDetailPage({
  id,
  user,
  onToast,
  onBack,
}: {
  id: number;
  user: UserVO;
  onToast: (toast: Toast) => void;
  onBack: () => void;
}) {
  const { data, loading, error, reload } = useAsyncData(() => repairApi.detail(id), [id]);
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
          <button className="link-button" onClick={onBack}>返回工作台</button>
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
            <img src={heroImage} alt="宿舍维修详情插画" />
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

function AdminHome({
  onView,
  onOpenDetail,
}: {
  onView: (view: View) => void;
  onOpenDetail: (id: number) => void;
}) {
  const { data: overview, loading, error, reload } = useAsyncData(() => statisticsApi.overview(), []);
  const { data: daily } = useAsyncData(() => statisticsApi.daily(7), []);
  const { data: urgent } = useAsyncData(() => repairApi.all({ page: 1, pageSize: 6, status: "PENDING" }), []);
  const categories = overview?.categoryStats ?? [];
  const repairers = overview?.repairerStats ?? [];

  return (
    <div className="space-y">
      <section className="panel admin-heading">
        <div>
          <p className="eyebrow">管理端工作台</p>
          <h1>报修管理总览</h1>
          <p>集中查看待处理工单、维修进度和人员工作量。</p>
        </div>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => onView("admin-orders")}><ClipboardList size={18} /> 工单管理</button>
          <button className="secondary-button" onClick={() => onView("dispatch")}><Send size={18} /> 快速派单</button>
        </div>
      </section>

      <DataState loading={loading} error={error} empty={!overview} onRetry={reload} emptyText="暂无统计数据">
        {overview && (
          <>
            <section className="stats-grid four">
              <StatCard icon={<ClipboardList />} tone="blue" label="今日/累计工单" value={overview.totalOrders} suffix="单" meta="报修总数" />
              <StatCard icon={<Gauge />} tone="orange" label="待受理" value={overview.pendingOrders} suffix="单" meta="需要审核" />
              <StatCard icon={<Wrench />} tone="blue" label="处理中" value={overview.processingOrders} suffix="单" meta="维修流程中" />
              <StatCard icon={<CheckCircle2 />} tone="green" label="已完成" value={overview.completedOrders} suffix="单" meta={`均分 ${overview.averageScore ?? "-"}`} />
            </section>
            <div className="dashboard-grid">
              <section className="panel chart-panel">
                <PanelTitle icon={<BarChart3 />} title="近 7 天报修趋势" subtitle="创建与完成数量" />
                <TrendChart data={daily ?? []} />
              </section>
              <section className="panel chart-panel">
                <PanelTitle icon={<Droplets />} title="报修类型分布" subtitle="按分类统计" />
                <Distribution data={categories} />
              </section>
              <section className="panel table-panel">
                <PanelTitle icon={<AlertTriangle />} title="待受理工单" subtitle="优先处理新提交工单" action={<button className="link-button" onClick={() => onView("admin-orders")}>查看全部</button>} />
                <div className="compact-list">
                  {(urgent?.items ?? []).map((order) => (
                    <button key={order.id} className="repair-row-card" onClick={() => onOpenDetail(order.id)}>
                      <StatusBadge status={order.status} />
                      <strong>{order.title}</strong>
                      <span>{order.studentName || "-"} · {order.dormBuilding} {order.roomNo}</span>
                      <small>{formatDateTime(order.createdAt)}</small>
                    </button>
                  ))}
                  {!(urgent?.items ?? []).length && <div className="empty-inline">暂无待受理工单</div>}
                </div>
              </section>
              <section className="panel">
                <PanelTitle icon={<Users />} title="维修人员状态" subtitle="工作量与完成数量" action={<button className="link-button" onClick={() => onView("dispatch")}>进入派单</button>} />
                <RepairerList data={repairers} />
              </section>
            </div>
          </>
        )}
      </DataState>
    </div>
  );
}

function DispatchPage({
  onOpenDetail,
  onToast,
}: {
  onOpenDetail: (id: number) => void;
  onToast: (toast: Toast) => void;
}) {
  const { data: pending, loading, error, reload } = useAsyncData(
    () => repairApi.all({ page: 1, pageSize: 20, status: "APPROVED" }),
    [],
  );
  const { data: reassign } = useAsyncData(() => repairApi.all({ page: 1, pageSize: 20, status: "NEED_REASSIGN" }), []);
  const { data: repairers } = useAsyncData(() => userApi.repairers(), []);
  const [selectedOrder, setSelectedOrder] = useState<RepairOrderVO | null>(null);
  const [selectedRepairer, setSelectedRepairer] = useState<number | "">("");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);
  const orders = [...(pending?.items ?? []), ...(reassign?.items ?? [])];

  useEffect(() => {
    if (!selectedOrder && orders.length) setSelectedOrder(orders[0]);
  }, [orders, selectedOrder]);

  const submit = async () => {
    if (!selectedOrder || !selectedRepairer) return;
    setSaving(true);
    try {
      await repairApi.assign(selectedOrder.id, Number(selectedRepairer), remark);
      onToast({ type: "success", message: "派单完成" });
      setSelectedOrder(null);
      setSelectedRepairer("");
      setRemark("");
      await reload();
    } catch (error) {
      onToast({ type: "error", message: error instanceof Error ? error.message : "派单失败" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dispatch-layout">
      <section className="panel">
        <PanelTitle icon={<Send />} title="待派单报修单" subtitle="已受理或需重派的工单" action={<button className="secondary-button compact" onClick={reload}><RefreshCw size={16} /> 刷新</button>} />
        <DataState loading={loading} error={error} empty={!orders.length} onRetry={reload} emptyText="暂无待派单工单">
          <div className="dispatch-list">
            {orders.map((order) => (
              <button
                key={order.id}
                className={cn("dispatch-order", selectedOrder?.id === order.id && "selected")}
                onClick={() => setSelectedOrder(order)}
              >
                <span className="category-icon">{CATEGORY_ICONS[order.category] ?? <Wrench size={20} />}</span>
                <strong>{order.title}</strong>
                <span>{order.dormBuilding} {order.roomNo}</span>
                <StatusBadge status={order.status} />
              </button>
            ))}
          </div>
        </DataState>
      </section>

      <section className="panel">
        <PanelTitle icon={<Users />} title="维修人员" subtitle="选择合适人员进行派单" />
        <div className="repairer-grid">
          {(repairers ?? []).map((repairer) => (
            <button
              key={repairer.id}
              className={cn("repairer-card", selectedRepairer === repairer.id && "selected")}
              onClick={() => setSelectedRepairer(repairer.id)}
            >
              <span className="avatar">{repairer.realName.slice(0, 1)}</span>
              <strong>{repairer.realName}</strong>
              <small>{repairer.username}</small>
              <span>{maskPhone(repairer.phone)}</span>
            </button>
          ))}
        </div>
        <div className="confirm-box">
          <PanelTitle icon={<PackageCheck />} title="派单确认" subtitle={selectedOrder ? selectedOrder.title : "请选择报修单"} />
          <textarea value={remark} onChange={(event) => setRemark(event.target.value)} placeholder="备注（可选）" />
          <div className="form-actions">
            {selectedOrder && <button className="secondary-button" onClick={() => onOpenDetail(selectedOrder.id)}>查看详情</button>}
            <button className="primary-button" disabled={!selectedOrder || !selectedRepairer || saving} onClick={submit}>
              {saving ? "派单中..." : "确认派单"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function UserManagementPage({ onToast }: { onToast: (toast: Toast) => void }) {
  const [query, setQuery] = useState({ page: 1, pageSize: 10, role: "" as UserRole | "", keyword: "" });
  const [refreshKey, setRefreshKey] = useState(0);
  const { data, loading, error, reload } = useAsyncData(() => userApi.list(query), [query, refreshKey]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ username: "", password: "123456", realName: "", phone: "", role: "REPAIR" as UserRole });

  const createUser = async (event: FormEvent) => {
    event.preventDefault();
    setCreating(true);
    try {
      await userApi.create(form);
      onToast({ type: "success", message: "用户已创建" });
      setForm({ username: "", password: "123456", realName: "", phone: "", role: "REPAIR" });
      setRefreshKey((key) => key + 1);
    } catch (error) {
      onToast({ type: "error", message: error instanceof Error ? error.message : "创建失败" });
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (user: UserVO) => {
    try {
      await userApi.updateStatus(user.id, user.status === 1 ? 0 : 1);
      onToast({ type: "success", message: "账号状态已更新" });
      setRefreshKey((key) => key + 1);
    } catch (error) {
      onToast({ type: "error", message: error instanceof Error ? error.message : "操作失败" });
    }
  };

  const page = data ?? emptyPage<UserVO>();

  return (
    <div className="user-layout">
      <section className="panel table-panel">
        <PanelTitle icon={<Users />} title="用户管理" subtitle="管理员可维护维修员和内部账号" action={<button className="secondary-button compact" onClick={reload}><RefreshCw size={16} /> 刷新</button>} />
        <div className="filter-bar">
          <div className="search-box"><Search size={16} /><input value={query.keyword} onChange={(event) => setQuery((current) => ({ ...current, keyword: event.target.value, page: 1 }))} placeholder="搜索账号或姓名" /></div>
          <select value={query.role} onChange={(event) => setQuery((current) => ({ ...current, role: event.target.value as UserRole | "", page: 1 }))}>
            <option value="">全部角色</option>
            {(["STUDENT", "ADMIN", "REPAIR"] as UserRole[]).map((role) => <option value={role} key={role}>{ROLE_LABELS[role]}</option>)}
          </select>
        </div>
        <DataState loading={loading} error={error} empty={!page.items.length} onRetry={reload} emptyText="暂无用户数据">
          <table className="data-table">
            <thead>
              <tr>
                <th>账号</th>
                <th>姓名</th>
                <th>手机号</th>
                <th>角色</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {page.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.username}</td>
                  <td>{item.realName}</td>
                  <td>{maskPhone(item.phone)}</td>
                  <td><span className="role-pill">{ROLE_LABELS[item.role]}</span></td>
                  <td>{item.status === 1 ? "启用" : "禁用"}</td>
                  <td><button className="table-button" onClick={() => updateStatus(item)}>{item.status === 1 ? "禁用" : "启用"}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} onPage={(next) => setQuery((current) => ({ ...current, page: next }))} />
        </DataState>
      </section>
      <section className="panel">
        <PanelTitle icon={<UserRound />} title="新增账号" subtitle="公开注册只创建学生，维修员由管理员创建" />
        <form className="form-stack" onSubmit={createUser}>
          <label><span>账号</span><input value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} required /></label>
          <label><span>姓名</span><input value={form.realName} onChange={(event) => setForm((current) => ({ ...current, realName: event.target.value }))} required /></label>
          <label><span>手机号</span><input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} required /></label>
          <label><span>初始密码</span><input value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required /></label>
          <label>
            <span>角色</span>
            <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}>
              <option value="REPAIR">维修员</option>
              <option value="ADMIN">管理员</option>
              <option value="STUDENT">学生</option>
            </select>
          </label>
          <button className="primary-button full" disabled={creating}>{creating ? "创建中..." : "创建账号"}</button>
        </form>
      </section>
    </div>
  );
}

function ProfilePage({ user, onToast }: { user: UserVO; onToast: (toast: Toast) => void }) {
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

function AnnouncementsPage() {
  return (
    <div className="space-y">
      <section className="hero-panel compact-hero">
        <div className="hero-copy">
          <p className="eyebrow">通知公告</p>
          <h1>校园维修公告</h1>
          <p>校园通知、维修安排和安全提醒将在这里集中展示。</p>
        </div>
        <img src={heroImage} alt="校园公告插画" />
      </section>
      <section className="panel">
        <PanelTitle icon={<Megaphone />} title="公告列表" subtitle="公告模块待开放" />
        <div className="empty-state">
          <Megaphone size={34} />
          <strong>暂无公告内容</strong>
          <p>后续可展示系统通知、维修通知和安全提醒。</p>
        </div>
      </section>
    </div>
  );
}

function ActionPanel({
  user,
  order,
  saving,
  onApprove,
  onCancel,
  onDelete,
  onConfirm,
  onStart,
  onModal,
}: {
  user: UserVO;
  order: RepairDetailVO;
  saving: boolean;
  onApprove: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onConfirm: () => void;
  onStart: () => void;
  onModal: (modal: "reject" | "assign" | "finish" | "reassign" | "feedback") => void;
}) {
  return (
    <div className="action-panel">
      {user.role === "STUDENT" && order.status === "PENDING" && (
        <>
          <button disabled={saving} className="secondary-button" onClick={onCancel}><XCircle size={16} /> 撤销报修</button>
          <button disabled={saving} className="danger-button" onClick={onDelete}><Trash2 size={16} /> 删除</button>
        </>
      )}
      {user.role === "STUDENT" && order.status === "WAIT_CONFIRM" && (
        <button disabled={saving} className="primary-button" onClick={onConfirm}><CheckCircle2 size={16} /> 确认完成</button>
      )}
      {user.role === "STUDENT" && order.status === "COMPLETED" && !order.feedback && (
        <button disabled={saving} className="primary-button" onClick={() => onModal("feedback")}><Star size={16} /> 提交评价</button>
      )}
      {user.role === "ADMIN" && order.status === "PENDING" && (
        <>
          <button disabled={saving} className="primary-button" onClick={onApprove}><CheckCircle2 size={16} /> 受理</button>
          <button disabled={saving} className="secondary-button" onClick={() => onModal("reject")}><XCircle size={16} /> 驳回</button>
        </>
      )}
      {user.role === "ADMIN" && isAssignableStatus(order.status) && (
        <button disabled={saving} className="primary-button" onClick={() => onModal("assign")}><Send size={16} /> 派单</button>
      )}
      {user.role === "ADMIN" && (
        <button disabled={saving} className="danger-button" onClick={onDelete}><Trash2 size={16} /> 删除工单</button>
      )}
      {user.role === "REPAIR" && order.status === "ASSIGNED" && (
        <button disabled={saving} className="primary-button" onClick={onStart}><PlayCircle size={16} /> 开始维修</button>
      )}
      {user.role === "REPAIR" && order.status === "PROCESSING" && (
        <button disabled={saving} className="primary-button" onClick={() => onModal("finish")}><CheckCircle2 size={16} /> 完成维修</button>
      )}
      {user.role === "REPAIR" && (order.status === "ASSIGNED" || order.status === "PROCESSING") && (
        <button disabled={saving} className="secondary-button" onClick={() => onModal("reassign")}><RotateCcw size={16} /> 申请转派</button>
      )}
    </div>
  );
}

function FilterBar({
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
          {REPAIR_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
        </select>
      )}
      <select value={query.status ?? ""} onChange={(event) => onChange({ ...query, status: event.target.value as RepairStatus | "", page: 1 })}>
        <option value="">全部状态</option>
        {REPAIR_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{REPAIR_STATUS_LABELS[status]}</option>)}
      </select>
    </div>
  );
}

function PanelTitle({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="panel-title">
      <div className="title-left">
        <span className="title-icon">{icon}</span>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function StatCard({
  icon,
  tone,
  label,
  value,
  suffix,
  meta,
}: {
  icon: ReactNode;
  tone: "blue" | "orange" | "green" | "amber" | "red";
  label: string;
  value: string | number;
  suffix?: string;
  meta?: string;
}) {
  return (
    <div className="stat-card">
      <span className={cn("stat-icon", tone)}>{icon}</span>
      <div>
        <span>{label}</span>
        <strong>{value}<small>{suffix}</small></strong>
        {meta && <p>{meta}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status, large }: { status: RepairStatus; large?: boolean }) {
  return <span className={cn("status-badge", statusClass(status), large && "large")}>{statusLabel(status)}</span>;
}

function CategoryPill({ category }: { category: string }) {
  return (
    <span className="category-pill">
      {CATEGORY_ICONS[category] ?? <Wrench size={14} />}
      {category}
    </span>
  );
}

function DataState({
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

function Pagination<T>({ page, onPage }: { page: PageResult<T>; onPage: (page: number) => void }) {
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

function MiniFlow({ current }: { current: RepairStatus }) {
  const index = STATUS_FLOW.indexOf(current);
  return (
    <div className="mini-flow">
      {STATUS_FLOW.map((status, statusIndex) => (
        <span key={status} className={cn(statusIndex <= index && "done")} title={statusLabel(status)} />
      ))}
    </div>
  );
}

function Timeline({ records, status }: { records: RepairDetailVO["records"]; status: RepairStatus }) {
  if (!records?.length) {
    return (
      <div className="timeline">
        <div className="timeline-item active">
          <span><CheckCircle2 size={16} /></span>
          <div><strong>{statusLabel(status)}</strong><p>暂无处理记录明细</p></div>
        </div>
      </div>
    );
  }
  return (
    <div className="timeline">
      {records.map((record, index) => (
        <div key={record.id} className={cn("timeline-item", index === records.length - 1 && "active")}>
          <span><CheckCircle2 size={16} /></span>
          <div>
            <strong>{record.action}</strong>
            <p>{record.content}</p>
            <small>{record.operatorName} · {formatFullDateTime(record.createdAt)}</small>
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function TextModal({
  title,
  label,
  placeholder,
  saving,
  onClose,
  onSubmit,
}: {
  title: string;
  label: string;
  placeholder: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <Modal title={title} onClose={onClose}>
      <form className="form-stack" onSubmit={(event) => { event.preventDefault(); onSubmit(value); }}>
        <label>
          <span>{label}</span>
          <textarea value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} required />
        </label>
        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onClose}>取消</button>
          <button className="primary-button" disabled={saving || !value.trim()}>{saving ? "提交中..." : "确认"}</button>
        </div>
      </form>
    </Modal>
  );
}

function AssignModal({
  repairers,
  saving,
  onClose,
  onSubmit,
}: {
  repairers: UserVO[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (repairerId: number, remark?: string) => void;
}) {
  const [repairerId, setRepairerId] = useState<number | "">(repairers[0]?.id ?? "");
  const [remark, setRemark] = useState("");
  return (
    <Modal title="分配维修人员" onClose={onClose}>
      <form className="form-stack" onSubmit={(event) => { event.preventDefault(); if (repairerId) onSubmit(Number(repairerId), remark); }}>
        <label>
          <span>维修人员</span>
          <select value={repairerId} onChange={(event) => setRepairerId(Number(event.target.value))} required>
            <option value="">请选择维修人员</option>
            {repairers.map((repairer) => <option key={repairer.id} value={repairer.id}>{repairer.realName} · {repairer.username}</option>)}
          </select>
        </label>
        <label><span>备注</span><textarea value={remark} onChange={(event) => setRemark(event.target.value)} placeholder="可填写派单说明" /></label>
        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onClose}>取消</button>
          <button className="primary-button" disabled={saving || !repairerId}>{saving ? "派单中..." : "确认派单"}</button>
        </div>
      </form>
    </Modal>
  );
}

function FeedbackModal({
  saving,
  onClose,
  onSubmit,
}: {
  saving: boolean;
  onClose: () => void;
  onSubmit: (score: number, comment?: string) => void;
}) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");
  return (
    <Modal title="提交服务评价" onClose={onClose}>
      <form className="form-stack" onSubmit={(event) => { event.preventDefault(); onSubmit(score, comment); }}>
        <div className="rating-row">
          {[1, 2, 3, 4, 5].map((item) => (
            <button type="button" key={item} className={item <= score ? "active" : ""} onClick={() => setScore(item)}><Star size={26} /></button>
          ))}
        </div>
        <label><span>评价内容</span><textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="请填写维修服务评价" /></label>
        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onClose}>取消</button>
          <button className="primary-button" disabled={saving}>{saving ? "提交中..." : "提交评价"}</button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-head">
          <h2>{title}</h2>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function TrendChart({ data }: { data: DailyStatisticVO[] }) {
  const max = Math.max(1, ...data.map((item) => Math.max(item.createdCount, item.completedCount)));
  return (
    <div className="trend-chart">
      {data.map((item) => (
        <div key={item.date} className="trend-day">
          <div className="bar-pair">
            <span className="bar created" style={{ height: `${(item.createdCount / max) * 100}%` }} />
            <span className="bar completed" style={{ height: `${(item.completedCount / max) * 100}%` }} />
          </div>
          <small>{item.date.slice(5)}</small>
        </div>
      ))}
      {!data.length && <div className="empty-inline">暂无趋势数据</div>}
    </div>
  );
}

function Distribution({ data }: { data: StatisticItemVO[] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0) || 1;
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

function RepairerList({ data }: { data: RepairerStatisticVO[] }) {
  if (!data.length) return <div className="empty-inline">暂无维修员统计</div>;
  return (
    <div className="repairer-list">
      {data.map((item) => (
        <div key={item.repairerId} className="repairer-row">
          <span className="avatar">{item.repairerName.slice(0, 1)}</span>
          <strong>{item.repairerName}</strong>
          <span>进行中 {item.activeCount} 单</span>
          <span>已完成 {item.completedCount} 单</span>
          <span>评分 {item.averageScore ?? "-"}</span>
        </div>
      ))}
    </div>
  );
}

function ToastBar({ toast, onClose }: { toast: Exclude<Toast, null>; onClose: () => void }) {
  return (
    <div className={cn("toast", toast.type)}>
      {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
      <span>{toast.message}</span>
      <button onClick={onClose}><X size={15} /></button>
    </div>
  );
}

function MessageIcon() {
  return <Megaphone size={18} />;
}

function useAsyncData<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const reload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    loader()
      .then((result) => {
        if (mounted) setData(result);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : "请求失败");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [...deps, reloadKey]);

  return { data, loading, error, reload };
}

function chartColor(index: number) {
  return ["#09568c", "#4f8fd3", "#6fc5d3", "#16a66a", "#f59e0b", "#94a3b8"][index % 6];
}

function buildDonut(data: StatisticItemVO[], total: number) {
  if (!data.length) return "conic-gradient(#dfe3e8 0 100%)";
  let start = 0;
  const stops = data.map((item, index) => {
    const end = start + (item.count / total) * 100;
    const stop = `${chartColor(index)} ${start}% ${end}%`;
    start = end;
    return stop;
  });
  return `conic-gradient(${stops.join(", ")})`;
}
