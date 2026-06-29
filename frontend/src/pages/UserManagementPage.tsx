import { FormEvent, useState } from "react";
import { RefreshCw, Search, UserRound, Users } from "lucide-react";
import { ROLE_LABELS } from "../constants";
import type { ToastMessage, UserRole, UserVO } from "../types";
import { emptyPage, maskPhone } from "../utils";
import { userApi } from "../api";
import { useAsyncData } from "../hooks/useAsyncData";
import { DataState } from "../components/DataState";
import { PanelTitle } from "../components/PanelTitle";
import { Pagination } from "../components/Pagination";

export function UserManagementPage({ onToast }: { onToast: (toast: ToastMessage | null) => void }) {
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
