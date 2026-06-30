import { FormEvent, useState } from "react";
import { KeyRound, Phone, UserRound, Wrench } from "lucide-react";
import { DEMO_ACCOUNTS, HERO_IMAGE } from "../constants";
import type { ToastMessage } from "../types";
import { authApi } from "../api";
import { AuthSlogan } from "../components/AuthSlogan";
import { ToastBar } from "../components/ToastBar";

export function AuthScreen({
  onLogin,
  onToast,
  toast,
}: {
  onLogin: (username: string, password: string) => Promise<void>;
  onToast: (toast: ToastMessage | null) => void;
  toast: ToastMessage | null;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
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
    setUsername(account.username);
    setPassword(account.password);
  };

  return (
    <div className="auth-page">
      {toast && <ToastBar toast={toast} onClose={() => onToast(null)} />}
      <div className="auth-shell">
        <span className="auth-shell-glow auth-shell-glow-left" />
        <span className="auth-shell-glow auth-shell-glow-right" />

        <header className="auth-nav">
          <div className="auth-brand">
            <span className="brand-mark"><Wrench size={22} /></span>
            <strong>宿舍报修管理系统</strong>
          </div>
          <nav className="auth-nav-links" aria-label="登录页导航">
            <button type="button" className="active">首页</button>
            <button type="button">帮助</button>
            <button type="button">简体中文</button>
          </nav>
        </header>

        <main className="auth-main">
          <section className="auth-visual" aria-label="宿舍维修服务介绍">
            <AuthSlogan />
            <div className="auth-image-stage" role="img" aria-label="宿舍维修插画">
              <span className="auth-image-blur" />
              <div
                className="auth-hero-image"
                style={{ backgroundImage: `url(${HERO_IMAGE})` }}
              />
            </div>
          </section>

          <section className="auth-area" aria-label="账号登录区域">
            <section className="auth-card">
              <div className="auth-card-head">
                <h2>{mode === "register" ? "学生注册" : "账号登录"}</h2>
                <p>{mode === "register" ? "公开注册仅面向学生账号" : "请输入账号信息，或使用演示账号快速体验"}</p>
              </div>
              <div className="auth-tabs">
                <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>账号登录</button>
                <button
                  type="button"
                  className={mode === "register" ? "active" : ""}
                  onClick={() => setMode("register")}
                >
                  学生注册
                </button>
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
                        <input
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          placeholder="请输入 11 位手机号"
                          pattern="^1[3-9]\d{9}$"
                          maxLength={11}
                          required
                        />
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
              {mode === "login" && (
                <div className="demo-row">
                  {DEMO_ACCOUNTS.map((account) => (
                    <button type="button" key={account.username} onClick={() => applyDemo(account)}>{account.label}</button>
                  ))}
                </div>
              )}
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}
