const initialParams = new URLSearchParams(window.location.search);
const API_BASE = localStorage.getItem("dormRepairApiBase") || "http://127.0.0.1:8080/api";

const demoAccounts = {
  student: { username: "student001", password: "123456" },
  admin: { username: "admin001", password: "123456" },
  repair: { username: "repair001", password: "123456" },
};

const roleLabels = {
  student: "学生用户",
  admin: "管理员",
  repair: "维修人员",
};

const navByRole = {
  student: [
    { id: "dashboard", label: "学生首页", index: "01" },
    { id: "create", label: "新增报修", index: "02" },
    { id: "orders", label: "我的报修", index: "03" },
    { id: "feedback", label: "确认评价", index: "04" },
    { id: "detail", label: "报修详情", index: "05" },
    { id: "auth", label: "登录", index: "06" },
  ],
  admin: [
    { id: "dashboard", label: "管理员首页", index: "01" },
    { id: "dispatch", label: "派单工作台", index: "02" },
    { id: "orders", label: "报修管理", index: "03" },
    { id: "users", label: "用户管理", index: "04" },
    { id: "detail", label: "工单详情", index: "05" },
    { id: "auth", label: "登录", index: "06" },
  ],
  repair: [
    { id: "dashboard", label: "维修首页", index: "01" },
    { id: "orders", label: "维修任务", index: "02" },
    { id: "repair-submit", label: "处理提交", index: "03" },
    { id: "detail", label: "任务详情", index: "04" },
    { id: "auth", label: "登录", index: "05" },
  ],
};

const statusLabels = {
  PENDING: "待受理",
  APPROVED: "已受理",
  ASSIGNED: "已派单",
  PROCESSING: "处理中",
  WAIT_CONFIRM: "待确认",
  COMPLETED: "已完成",
  REJECTED: "已驳回",
  CANCELLED: "已撤销",
  NEED_REASSIGN: "需重派",
};

const statusClasses = {
  PENDING: "pending",
  APPROVED: "accepted",
  ASSIGNED: "assigned",
  PROCESSING: "processing",
  WAIT_CONFIRM: "confirming",
  COMPLETED: "done",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
  NEED_REASSIGN: "reassign",
};

const roleFromBackend = {
  STUDENT: "student",
  ADMIN: "admin",
  REPAIR: "repair",
};

const roleToBackend = {
  student: "STUDENT",
  admin: "ADMIN",
  repair: "REPAIR",
};

const state = {
  role: ["student", "admin", "repair"].includes(initialParams.get("role")) ? initialParams.get("role") : "student",
  view: initialParams.get("view") || "dashboard",
  token: localStorage.getItem("dormRepairToken") || "",
  user: readJson("dormRepairUser"),
  orders: [],
  detail: null,
  selectedOrderId: null,
  users: [],
  repairers: [],
  statistics: null,
  loading: false,
  keyword: "",
};

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function h(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toast(message) {
  const node = document.querySelector("#toast");
  node.textContent = message;
  node.classList.add("show");
  window.setTimeout(() => node.classList.remove("show"), 2200);
}

async function api(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json; charset=utf-8" } : {}),
    ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
    ...(options.headers || {}),
  };
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({ code: response.status, message: response.statusText }));
  if (!response.ok || payload.code >= 400) {
    throw new Error(payload.message || "接口请求失败");
  }
  return payload.data;
}

async function login(username, password) {
  const data = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  state.token = data.token;
  state.user = data.user;
  state.role = roleFromBackend[data.user.role] || state.role;
  localStorage.setItem("dormRepairToken", state.token);
  localStorage.setItem("dormRepairUser", JSON.stringify(state.user));
  return data;
}

async function loginAsRole(role) {
  const account = demoAccounts[role];
  await login(account.username, account.password);
}

async function ensureSession() {
  if (!state.token) {
    await loginAsRole(state.role);
    return;
  }
  try {
    const user = await api("/auth/me");
    state.user = user;
    state.role = roleFromBackend[user.role] || state.role;
    localStorage.setItem("dormRepairUser", JSON.stringify(user));
  } catch {
    localStorage.removeItem("dormRepairToken");
    localStorage.removeItem("dormRepairUser");
    state.token = "";
    state.user = null;
    await loginAsRole(state.role);
  }
}

function mapOrder(order) {
  return {
    ...order,
    no: order.orderNo,
    dorm: `${order.dormBuilding || ""} ${order.roomNo || ""}`.trim(),
    statusLabel: statusLabels[order.status] || order.status,
    repairerName: order.repairerName || "待分配",
    studentName: order.studentName || "-",
  };
}

async function refreshData() {
  state.loading = true;
  renderShellOnly();
  try {
    const params = new URLSearchParams({ page: "1", pageSize: "100" });
    if (state.keyword) params.set("keyword", state.keyword);

    if (state.role === "student") {
      state.orders = (await api(`/repairs/my?${params}`)).items.map(mapOrder);
      state.statistics = null;
      state.users = [];
      state.repairers = [];
    } else if (state.role === "admin") {
      const [orders, statistics, repairers, users] = await Promise.all([
        api(`/repairs?${params}`),
        api("/statistics/overview"),
        api("/users/repairers"),
        api("/users?page=1&pageSize=100"),
      ]);
      state.orders = orders.items.map(mapOrder);
      state.statistics = statistics;
      state.repairers = repairers;
      state.users = users.items || [];
    } else {
      state.orders = (await api(`/repairs/repairer/my?${params}`)).items.map(mapOrder);
      state.statistics = null;
      state.users = [];
      state.repairers = [];
    }
  } catch (error) {
    toast(error.message);
  } finally {
    state.loading = false;
  }
}

async function openDetail(id) {
  state.selectedOrderId = Number(id);
  try {
    state.detail = await api(`/repairs/${id}`);
  } catch (error) {
    state.detail = null;
    toast(error.message);
  }
  renderDetail();
  bindActions();
  setView("detail");
}

function statusChip(status) {
  return `<span class="status ${statusClasses[status] || "pending"}">${h(statusLabels[status] || status)}</span>`;
}

function metricCards(items) {
  return `
    <div class="grid four">
      ${items
        .map(
          (item, index) => `
            <article class="metric-card card">
              <div class="metric-icon tone-${index + 1}">${h(item.icon || item.label.slice(0, 1))}</div>
              <div>
                <span>${h(item.label)}</span>
                <strong>${h(item.value)}</strong>
                <small>${h(item.note || "")}</small>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderShellOnly() {
  document.querySelector("#roleSelect").value = state.role;
  document.querySelector("#roleName").textContent = roleLabels[state.role];
  document.querySelector("#userName").textContent = state.user?.realName || "未登录";
  document.querySelector(".avatar").textContent = (state.user?.realName || roleLabels[state.role]).slice(0, 1);
}

function setView(view) {
  state.view = view;
  document.body.classList.toggle("auth-open", view === "auth");
  document.querySelectorAll(".view").forEach((node) => node.classList.remove("active"));
  document.querySelector(`#view-${view}`)?.classList.add("active");
  document.querySelectorAll(".nav-button").forEach((node) => {
    node.classList.toggle("active", node.dataset.view === view);
  });
  const item = navByRole[state.role].find((nav) => nav.id === view);
  document.querySelector("#pageTitle").textContent = item ? item.label : "系统页面";
}

function renderNav() {
  const menu = document.querySelector("#navMenu");
  menu.innerHTML = navByRole[state.role]
    .map(
      (item) => `
        <button class="nav-button ${item.id === state.view ? "active" : ""}" type="button" data-view="${item.id}">
          ${h(item.label)}
          <span>${h(item.index)}</span>
        </button>
      `,
    )
    .join("");
  menu.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
}

function orderCounts() {
  const count = (status) => state.orders.filter((item) => item.status === status).length;
  return {
    total: state.orders.length,
    pending: count("PENDING"),
    active: state.orders.filter((item) => ["ASSIGNED", "PROCESSING", "NEED_REASSIGN"].includes(item.status)).length,
    waitConfirm: count("WAIT_CONFIRM"),
    completed: count("COMPLETED"),
  };
}

function renderDashboard() {
  const view = document.querySelector("#view-dashboard");
  const counts = orderCounts();
  if (state.role === "student") {
    view.innerHTML = `
      <section class="welcome-panel">
        <div>
          <h2>你好，${h(state.user?.realName || "同学")}</h2>
          <p>这里展示你的报修进度，数据来自后端接口。</p>
        </div>
        <button class="primary-button" type="button" data-action="go-create">提交报修</button>
      </section>
      ${metricCards([
        { label: "我的报修", value: counts.total, note: "当前账号可见", icon: "总" },
        { label: "待受理", value: counts.pending, note: "可修改或撤销", icon: "待" },
        { label: "处理中", value: counts.active, note: "维修流程中", icon: "修" },
        { label: "待确认", value: counts.waitConfirm, note: "可确认评价", icon: "评" },
      ])}
      <div class="grid two" style="margin-top: 16px;">
        <section class="card card-pad">
          <div class="split-header"><div><p class="table-caption">最近报修</p><h2>我的控制台</h2></div></div>
          ${ordersTable("student", state.orders.slice(0, 5))}
        </section>
        <aside class="card card-pad">
          <h2>待确认提醒</h2>
          <div class="task-stack">
            ${emptyOr(
              state.orders
                .filter((item) => item.status === "WAIT_CONFIRM")
                .slice(0, 4)
                .map((item) => `<article><strong>${h(item.title)}</strong><span>${h(item.dorm)}</span>${statusChip(item.status)}</article>`)
                .join(""),
              "暂无待确认工单",
            )}
          </div>
        </aside>
      </div>
    `;
  } else if (state.role === "admin") {
    const stats = state.statistics || {};
    view.innerHTML = `
      <section class="welcome-panel">
        <div>
          <h2>数据总览</h2>
          <p>统计数据来自 /api/statistics/overview。</p>
        </div>
        <button class="primary-button" type="button" data-action="go-dispatch">处理待受理</button>
      </section>
      ${metricCards([
        { label: "报修总数", value: stats.totalOrders ?? 0, note: "未软删除工单", icon: "总" },
        { label: "待受理", value: stats.pendingOrders ?? 0, note: "需要管理员处理", icon: "审" },
        { label: "处理中", value: stats.processingOrders ?? 0, note: "维修员处理中", icon: "修" },
        { label: "已完成", value: stats.completedOrders ?? 0, note: `平均评分 ${stats.averageScore ?? "-"}`, icon: "完" },
      ])}
      <div class="grid two" style="margin-top: 16px;">
        <section class="card card-pad">
          <div class="split-header"><div><p class="table-caption">按类型统计</p><h2>报修分类</h2></div></div>
          <div class="chart-card">
            <div class="donut-chart"><span>总数<br>${h(stats.totalOrders ?? 0)}</span></div>
            <div class="chart-list">
              ${(stats.categoryStats || []).map((item) => barRow(item.name, item.count, stats.totalOrders || 1)).join("")}
            </div>
          </div>
        </section>
        <aside class="card card-pad">
          <h2>维修员负载</h2>
          <div class="repairer-stack">
            ${(stats.repairerStats || []).map((item, index) => repairerLoadCard(item, index === 0)).join("")}
          </div>
        </aside>
      </div>
    `;
  } else {
    view.innerHTML = `
      <section class="welcome-panel">
        <div>
          <h2>你好，${h(state.user?.realName || "维修员")}</h2>
          <p>这里展示分配给你的维修任务。</p>
        </div>
        <button class="primary-button" type="button" data-action="go-orders">查看任务</button>
      </section>
      ${metricCards([
        { label: "我的任务", value: counts.total, note: "当前维修员", icon: "总" },
        { label: "待处理", value: state.orders.filter((item) => item.status === "ASSIGNED").length, note: "可开始维修", icon: "待" },
        { label: "处理中", value: state.orders.filter((item) => item.status === "PROCESSING").length, note: "可提交完成", icon: "修" },
        { label: "待确认", value: counts.waitConfirm, note: "等待学生确认", icon: "确" },
      ])}
      <div class="grid two" style="margin-top: 16px;">
        <section class="card card-pad">
          <div class="split-header"><div><p class="table-caption">任务队列</p><h2>我的维修任务</h2></div></div>
          ${ordersTable("repair", state.orders.slice(0, 5))}
        </section>
        <aside class="card card-pad">
          <h2>需重派任务</h2>
          <div class="task-stack">
            ${emptyOr(
              state.orders
                .filter((item) => item.status === "NEED_REASSIGN")
                .map((item) => `<article><strong>${h(item.title)}</strong><span>${h(item.dorm)}</span>${statusChip(item.status)}</article>`)
                .join(""),
              "暂无需重派任务",
            )}
          </div>
        </aside>
      </div>
    `;
  }
}

function barRow(label, count, total) {
  const value = total ? Math.round((count / total) * 100) : 0;
  return `
    <div class="bar-row">
      <span>${h(label)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${value}%"></div></div>
      <strong>${h(count)}</strong>
    </div>
  `;
}

function repairerLoadCard(item, recommended) {
  const load = Math.min(100, Number(item.activeCount || 0) * 25);
  return `
    <article class="repairer-load ${recommended ? "recommended" : ""}">
      <div>
        <strong>${h(item.repairerName || item.realName || item.name)}</strong>
        <span>${recommended ? "推荐关注" : "正常负载"}</span>
      </div>
      <div class="load-meter"><span style="width:${load}%"></span></div>
      <dl>
        <div><dt>进行中</dt><dd>${h(item.activeCount ?? 0)}</dd></div>
        <div><dt>已完成</dt><dd>${h(item.completedCount ?? 0)}</dd></div>
        <div><dt>评分</dt><dd>${h(item.averageScore ?? "-")}</dd></div>
      </dl>
    </article>
  `;
}

function renderCreate() {
  const view = document.querySelector("#view-create");
  view.innerHTML = `
    <div class="form-shell">
      <section class="card card-pad">
        <div class="split-header">
          <div><p class="table-caption">报修信息</p><h2>提交报修</h2></div>
          <button class="ghost-button" type="button" data-action="go-orders">返回列表</button>
        </div>
        <form class="form-grid" id="repairForm">
          ${field("故障标题", "input", "title", "例如：宿舍水龙头漏水", true)}
          ${field("故障描述", "textarea", "description", "请详细描述故障情况", true)}
          ${field("所在宿舍楼", "select", "dormBuilding", ["1号楼", "2号楼", "3号楼", "4号楼", "5号楼", "6号楼"])}
          ${field("宿舍号", "input", "roomNo", "101")}
          ${field("报修类型", "select", "category", ["水电", "门窗", "网络", "家具", "空调", "其他"])}
          ${field("联系电话", "input", "contactPhone", "13800000000")}
          ${field("图片地址", "input", "imageUrls", "可选，例如 image1.jpg", true, false)}
          <div class="field full action-row end">
            <button class="primary-button" type="submit">提交报修</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function field(label, type, name, value, full = false, required = true) {
  const requiredAttr = required ? "required" : "";
  const className = full ? "field full" : "field";
  if (type === "select") {
    return `
      <div class="${className}">
        <label>${h(label)}</label>
        <select name="${h(name)}" ${requiredAttr}>${value.map((item) => `<option value="${h(item)}">${h(item)}</option>`).join("")}</select>
      </div>
    `;
  }
  if (type === "textarea") {
    return `
      <div class="${className}">
        <label>${h(label)}</label>
        <textarea name="${h(name)}" placeholder="${h(value)}" ${requiredAttr}></textarea>
      </div>
    `;
  }
  return `
    <div class="${className}">
      <label>${h(label)}</label>
      <input name="${h(name)}" type="text" placeholder="${h(value)}" ${requiredAttr} />
    </div>
  `;
}

function renderOrders() {
  const view = document.querySelector("#view-orders");
  const type = state.role === "admin" ? "admin" : state.role === "repair" ? "repair" : "student";
  view.innerHTML = `
    <section class="card card-pad">
      <div class="split-header">
        <div>
          <p class="table-caption">${state.role === "admin" ? "全部工单" : state.role === "repair" ? "任务列表" : "我的报修"}</p>
          <h2>${state.role === "admin" ? "报修管理列表" : state.role === "repair" ? "我的维修任务" : "我的报修"}</h2>
        </div>
        <button class="primary-button" type="button" data-action="${state.role === "student" ? "go-create" : "refresh"}">${state.role === "student" ? "新增报修" : "刷新"}</button>
      </div>
      <div class="filter-row">
        <label class="list-search"><input id="orderKeyword" type="search" value="${h(state.keyword)}" placeholder="搜索单号、宿舍、姓名" /></label>
        <button class="primary-button" type="button" data-action="search-orders">查询</button>
        <button class="ghost-button" type="button" data-action="reset-search">重置</button>
      </div>
      ${ordersTable(type, state.orders)}
      <div class="pagination-row"><span>共 ${state.orders.length} 条</span></div>
    </section>
  `;
}

function ordersTable(type, rows) {
  return `
    <div class="table-wrap card">
      <table>
        <thead>
          <tr>
            <th>工单号</th>
            <th>问题</th>
            <th>宿舍</th>
            <th>类型</th>
            <th>状态</th>
            <th>维修员</th>
            <th>提交时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${emptyOr(
            rows
              .map(
                (order) => `
                  <tr>
                    <td><strong>${h(order.no)}</strong></td>
                    <td>${h(order.title)}</td>
                    <td>${h(order.dorm)}</td>
                    <td>${h(order.category)}</td>
                    <td>${statusChip(order.status)}</td>
                    <td>${h(order.repairerName)}</td>
                    <td>${h(order.createdAt)}</td>
                    <td>${actionButtons(type, order)}</td>
                  </tr>
                `,
              )
              .join(""),
            `<tr><td colspan="8">暂无数据</td></tr>`,
          )}
        </tbody>
      </table>
    </div>
  `;
}

function actionButtons(type, order) {
  const detail = `<button class="ghost-button" type="button" data-action="detail" data-id="${order.id}">详情</button>`;
  if (type === "admin") {
    if (order.status === "PENDING") {
      return `${detail}<button class="soft-button" type="button" data-action="approve" data-id="${order.id}">受理</button><button class="danger-button" type="button" data-action="reject" data-id="${order.id}">驳回</button>`;
    }
    if (order.status === "APPROVED" || order.status === "NEED_REASSIGN") {
      return `${detail}<button class="soft-button" type="button" data-action="assign" data-id="${order.id}">派单</button>`;
    }
    return detail;
  }
  if (type === "repair") {
    if (order.status === "ASSIGNED") {
      return `${detail}<button class="soft-button" type="button" data-action="start" data-id="${order.id}">开始</button><button class="ghost-button" type="button" data-action="reassign" data-id="${order.id}">转派</button>`;
    }
    if (order.status === "PROCESSING") {
      return `${detail}<button class="soft-button" type="button" data-action="finish" data-id="${order.id}">完成</button><button class="ghost-button" type="button" data-action="reassign" data-id="${order.id}">转派</button>`;
    }
    return detail;
  }
  if (order.status === "PENDING") {
    return `${detail}<button class="ghost-button" type="button" data-action="cancel" data-id="${order.id}">撤销</button><button class="danger-button" type="button" data-action="delete" data-id="${order.id}">删除</button>`;
  }
  if (order.status === "WAIT_CONFIRM") {
    return `${detail}<button class="soft-button" type="button" data-action="feedback-view" data-id="${order.id}">确认评价</button>`;
  }
  return detail;
}

function renderDispatch() {
  const view = document.querySelector("#view-dispatch");
  const queue = state.orders.filter((item) => ["PENDING", "APPROVED", "NEED_REASSIGN"].includes(item.status));
  view.innerHTML = `
    <div class="grid dispatch-grid">
      <section class="card card-pad">
        <div class="split-header">
          <div><p class="table-caption">管理员派单工作台</p><h2>审核有效性，再分配维修人员</h2></div>
          <button class="primary-button" type="button" data-action="refresh">刷新</button>
        </div>
        <div class="dispatch-list">
          ${emptyOr(queue.map(dispatchTicket).join(""), "暂无待处理工单")}
        </div>
      </section>
      <aside class="side-stack">
        <section class="card card-pad">
          <h2>维修人员</h2>
          <div class="repairer-stack">
            ${state.repairers
              .map((item) =>
                repairerLoadCard(
                  {
                    repairerName: item.realName,
                    activeCount: "-",
                    completedCount: "-",
                    averageScore: "-",
                  },
                  false,
                ),
              )
              .join("")}
          </div>
        </section>
      </aside>
    </div>
  `;
}

function dispatchTicket(item) {
  return `
    <article class="dispatch-ticket">
      <div class="ticket-main">
        <div class="ticket-title"><span class="table-caption">${h(item.no)}</span><h3>${h(item.title)}</h3></div>
        ${statusChip(item.status)}
      </div>
      <dl class="ticket-meta">
        <div><dt>位置</dt><dd>${h(item.dorm)}</dd></div>
        <div><dt>类型</dt><dd>${h(item.category)}</dd></div>
        <div><dt>提交人</dt><dd>${h(item.studentName)}</dd></div>
        <div><dt>提交时间</dt><dd>${h(item.createdAt)}</dd></div>
      </dl>
      <div class="ticket-actions">
        <button class="ghost-button" type="button" data-action="detail" data-id="${item.id}">详情</button>
        ${item.status === "PENDING" ? `<button class="soft-button" type="button" data-action="approve" data-id="${item.id}">受理</button><button class="danger-button" type="button" data-action="reject" data-id="${item.id}">驳回</button>` : ""}
        ${
          item.status === "APPROVED" || item.status === "NEED_REASSIGN"
            ? `<select class="inline-select" data-repairer-for="${item.id}">${state.repairers.map((repairer) => `<option value="${repairer.id}">${h(repairer.realName)}</option>`).join("")}</select><button class="primary-button" type="button" data-action="assign" data-id="${item.id}">派单</button>`
            : ""
        }
      </div>
    </article>
  `;
}

function renderRepairSubmit() {
  const order = state.orders.find((item) => item.status === "PROCESSING") || state.orders.find((item) => item.status === "ASSIGNED") || state.orders[0];
  const view = document.querySelector("#view-repair-submit");
  if (!order) {
    view.innerHTML = `<section class="card card-pad"><h2>暂无维修任务</h2></section>`;
    return;
  }
  view.innerHTML = `
    <div class="detail-layout">
      <section class="card card-pad">
        <div class="split-header"><div><p class="table-caption">${h(order.no)}</p><h2>${h(order.title)}</h2></div>${statusChip(order.status)}</div>
        <dl class="description-list">
          <div><dt>宿舍位置</dt><dd>${h(order.dorm)}</dd></div>
          <div><dt>报修类型</dt><dd>${h(order.category)}</dd></div>
          <div><dt>提交学生</dt><dd>${h(order.studentName)}</dd></div>
        </dl>
        <form class="form-grid service-form" id="repairSubmitForm" data-id="${order.id}">
          <div class="field full"><label>现场处理结果</label><textarea name="content" placeholder="请填写故障原因、维修过程、处理结果" required></textarea></div>
          <div class="field full"><label>现场图片</label><input name="imageUrls" type="text" placeholder="可选，例如 finish.jpg" /></div>
          <div class="field full action-row">
            ${order.status === "ASSIGNED" ? `<button class="ghost-button" type="button" data-action="start" data-id="${order.id}">先开始维修</button>` : ""}
            <button class="primary-button" type="submit">提交完成</button>
            <button class="danger-button" type="button" data-action="reassign" data-id="${order.id}">申请重派</button>
          </div>
        </form>
      </section>
      <aside class="side-stack"><section class="card card-pad"><h2>操作说明</h2><ul class="check-list"><li><strong>开始维修</strong><span>已派单工单先进入处理中。</span></li><li><strong>提交完成</strong><span>处理中工单进入待学生确认。</span></li></ul></section></aside>
    </div>
  `;
}

function renderFeedback() {
  const order = state.orders.find((item) => item.id === state.selectedOrderId) || state.orders.find((item) => item.status === "WAIT_CONFIRM");
  const view = document.querySelector("#view-feedback");
  if (!order) {
    view.innerHTML = `<section class="card card-pad"><h2>暂无待确认工单</h2><p class="muted-line">维修员提交完成后，这里会出现可确认评价的工单。</p></section>`;
    return;
  }
  view.innerHTML = `
    <div class="grid feedback-grid">
      <section class="card card-pad">
        <div class="split-header"><div><p class="table-caption">${h(order.no)}</p><h2>确认维修结果并评价</h2></div>${statusChip(order.status)}</div>
        <div class="result-panel"><div><span class="small-label">报修标题</span><strong>${h(order.title)}</strong></div><dl><div><dt>维修人员</dt><dd>${h(order.repairerName)}</dd></div><div><dt>位置</dt><dd>${h(order.dorm)}</dd></div></dl></div>
        <form class="form-grid feedback-form" id="feedbackForm" data-id="${order.id}">
          <div class="field full">
            <label>满意度评分</label>
            <div class="rating-row" id="ratingRow">${[1, 2, 3, 4, 5].map((score) => `<button class="rating-button ${score === 5 ? "active" : ""}" type="button" data-score="${score}">${score}</button>`).join("")}</div>
          </div>
          <div class="field full"><label>评价内容</label><textarea name="comment" placeholder="可以填写维修速度、沟通体验、结果是否稳定等"></textarea></div>
          <div class="field full action-row"><button class="primary-button" type="submit">确认完成并提交评价</button></div>
        </form>
      </section>
    </div>
  `;
}

function renderDetail() {
  const detail = state.detail;
  const order = detail ? mapOrder(detail) : state.orders.find((item) => item.id === state.selectedOrderId) || state.orders[0];
  const view = document.querySelector("#view-detail");
  if (!order) {
    view.innerHTML = `<section class="card card-pad"><h2>暂无工单详情</h2></section>`;
    return;
  }
  const records = detail?.records || [];
  view.innerHTML = `
    <section class="card card-pad progress-card">
      <div class="step-line">
        ${["PENDING", "APPROVED", "ASSIGNED", "PROCESSING", "WAIT_CONFIRM", "COMPLETED"]
          .map((status, index) => `<div class="step ${stepDone(order.status, status) ? "done" : ""}"><span>${index + 1}</span><strong>${h(statusLabels[status])}</strong><small>${order.status === status ? "当前" : ""}</small></div>`)
          .join("")}
      </div>
    </section>
    <div class="detail-layout" style="margin-top: 16px;">
      <section class="card card-pad">
        <div class="split-header"><div><p class="table-caption">${h(order.no)}</p><h2>${h(order.title)}</h2></div>${statusChip(order.status)}</div>
        <dl class="description-list">
          <div><dt>宿舍位置</dt><dd>${h(order.dorm)}</dd></div>
          <div><dt>报修类型</dt><dd>${h(order.category)}</dd></div>
          <div><dt>提交学生</dt><dd>${h(order.studentName)}</dd></div>
          <div><dt>联系电话</dt><dd>${h(detail?.contactPhone || "-")}</dd></div>
          <div><dt>维修人员</dt><dd>${h(order.repairerName)}</dd></div>
          <div><dt>提交时间</dt><dd>${h(order.createdAt)}</dd></div>
        </dl>
        <div class="content-block"><h3>问题描述</h3><p style="color: var(--muted); line-height: 1.8;">${h(detail?.description || "列表数据未包含详情描述，点击详情按钮会请求后端详情接口。")}</p></div>
        <div class="filter-row" style="margin-top: 18px;">${actionButtons(state.role === "admin" ? "admin" : state.role === "repair" ? "repair" : "student", order)}</div>
      </section>
      <aside class="side-stack">
        <section class="card card-pad">
          <h2>处理记录</h2>
          <ul class="timeline">
            ${emptyOr(records.map((record, index) => `<li><span class="node">${index + 1}</span><div><p>${h(record.action)} - ${h(record.operatorName)}</p><span>${h(record.content)}<br>${h(record.createdAt)}</span></div></li>`).join(""), "<li><span class=\"node\">1</span><div><p>暂无记录</p></div></li>")}
          </ul>
        </section>
        ${
          detail?.feedback
            ? `<section class="card card-pad"><h2>学生评价</h2><p class="muted-line">评分：${h(detail.feedback.score)} / 5</p><p>${h(detail.feedback.comment || "无评价内容")}</p></section>`
            : ""
        }
      </aside>
    </div>
  `;
}

function stepDone(current, step) {
  const order = ["PENDING", "APPROVED", "ASSIGNED", "PROCESSING", "WAIT_CONFIRM", "COMPLETED"];
  if (["REJECTED", "CANCELLED", "NEED_REASSIGN"].includes(current)) return step === "PENDING";
  return order.indexOf(step) <= order.indexOf(current);
}

function renderUsers() {
  const view = document.querySelector("#view-users");
  view.innerHTML = `
    <section class="card card-pad">
      <div class="split-header"><div><p class="table-caption">用户管理</p><h2>角色与账号状态</h2></div><button class="primary-button" type="button" data-action="refresh">刷新</button></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>账号</th><th>姓名</th><th>角色</th><th>手机号</th><th>状态</th><th>操作</th></tr></thead>
          <tbody>
            ${emptyOr(
              state.users
                .map(
                  (user) => `
                    <tr>
                      <td><strong>${h(user.username)}</strong></td>
                      <td>${h(user.realName)}</td>
                      <td>${h(roleLabels[roleFromBackend[user.role]] || user.role)}</td>
                      <td>${h(user.phone)}</td>
                      <td>${user.status === 1 ? statusChip("COMPLETED").replace("已完成", "启用") : statusChip("REJECTED").replace("已驳回", "禁用")}</td>
                      <td><button class="ghost-button" type="button" data-action="toggle-user" data-id="${user.id}" data-status="${user.status}">${user.status === 1 ? "禁用" : "启用"}</button></td>
                    </tr>
                  `,
                )
                .join(""),
              `<tr><td colspan="6">暂无用户</td></tr>`,
            )}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAuth() {
  const view = document.querySelector("#view-auth");
  const account = demoAccounts[state.role];
  view.innerHTML = `
    <div class="auth-screen">
      <section class="auth-hero">
        <div class="brand auth-brand">
          <img class="brand-mark" src="./assets/brand-mark.png" alt="宿舍报修管理系统标识" />
          <div><strong>宿舍报修管理系统</strong><span>Dormitory Repair Management System</span></div>
        </div>
        <div class="auth-copy"><h2>前后端真实接口联调</h2><p>登录后会保存 JWT，并按角色请求对应接口。</p></div>
        <img class="campus-visual" src="./assets/auth-illustration.png" alt="校园宿舍维修场景插画" />
      </section>
      <section class="auth-panel card">
        <h2>用户登录</h2>
        <div class="segmented">
          ${Object.keys(demoAccounts).map((role) => `<button class="${role === state.role ? "active" : ""}" type="button" data-action="switch-role" data-role="${role}">${roleLabels[role]}</button>`).join("")}
        </div>
        <form class="form-grid" id="loginForm">
          <div class="field full"><label>账号</label><input name="username" type="text" value="${h(account.username)}" required /></div>
          <div class="field full"><label>密码</label><input name="password" type="password" value="${h(account.password)}" required /></div>
          <div class="field full"><button class="primary-button" type="submit">登录</button></div>
        </form>
      </section>
    </div>
  `;
}

function emptyOr(html, fallback) {
  return html && html.trim() ? html : fallback;
}

function renderAll() {
  renderShellOnly();
  const quickAction = document.querySelector("#quickAction");
  quickAction.textContent = state.role === "student" ? "新增报修" : state.role === "admin" ? "待受理工单" : "我的任务";
  renderNav();
  renderDashboard();
  renderCreate();
  renderOrders();
  renderDispatch();
  renderRepairSubmit();
  renderFeedback();
  renderDetail();
  renderUsers();
  renderAuth();
  if (!navByRole[state.role].some((item) => item.id === state.view)) {
    state.view = "dashboard";
  }
  setView(state.view);
  bindActions();
}

function formJson(form) {
  return Object.fromEntries(new FormData(form).entries());
}

async function handleAction(action, target) {
  const id = target.dataset.id;
  try {
    if (action === "go-create") setView("create");
    if (action === "go-orders") setView("orders");
    if (action === "go-dispatch") setView("dispatch");
    if (action === "refresh") await refreshData();
    if (action === "search-orders") {
      state.keyword = document.querySelector("#orderKeyword")?.value.trim() || "";
      await refreshData();
    }
    if (action === "reset-search") {
      state.keyword = "";
      await refreshData();
    }
    if (action === "detail") await openDetail(id);
    if (action === "approve") {
      await api(`/repairs/${id}/approve`, { method: "POST" });
      toast("已受理");
      await refreshData();
    }
    if (action === "reject") {
      const reason = window.prompt("请输入驳回原因", "信息不完整");
      if (reason) {
        await api(`/repairs/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) });
        toast("已驳回");
        await refreshData();
      }
    }
    if (action === "assign") {
      const select = document.querySelector(`[data-repairer-for="${id}"]`);
      const repairerId = select?.value || state.repairers[0]?.id;
      if (!repairerId) throw new Error("没有可用维修员");
      await api(`/repairs/${id}/assign`, { method: "POST", body: JSON.stringify({ repairerId: Number(repairerId), remark: "前端联调派单" }) });
      toast("已派单");
      await refreshData();
    }
    if (action === "start") {
      await api(`/repairs/${id}/start`, { method: "POST" });
      toast("已开始维修");
      await refreshData();
    }
    if (action === "finish") {
      const content = window.prompt("请输入维修完成说明", "已完成维修并测试正常");
      if (content) {
        await api(`/repairs/${id}/finish`, { method: "POST", body: JSON.stringify({ content, imageUrls: "" }) });
        toast("已提交完成");
        await refreshData();
      }
    }
    if (action === "reassign") {
      const reason = window.prompt("请输入申请重派原因", "需要其他维修工具或人员协助");
      if (reason) {
        await api(`/repairs/${id}/reassign`, { method: "POST", body: JSON.stringify({ reason }) });
        toast("已申请重派");
        await refreshData();
      }
    }
    if (action === "cancel") {
      await api(`/repairs/${id}/cancel`, { method: "POST" });
      toast("已撤销");
      await refreshData();
    }
    if (action === "delete") {
      if (window.confirm("确认删除该工单？")) {
        await api(`/repairs/${id}`, { method: "DELETE" });
        toast("已删除");
        await refreshData();
      }
    }
    if (action === "feedback-view") {
      state.selectedOrderId = Number(id);
      renderFeedback();
      bindActions();
      setView("feedback");
    }
    if (action === "toggle-user") {
      const nextStatus = Number(target.dataset.status) === 1 ? 0 : 1;
      await api(`/users/${id}/status`, { method: "PUT", body: JSON.stringify({ status: nextStatus }) });
      toast("用户状态已更新");
      await refreshData();
    }
    if (action === "switch-role") {
      state.role = target.dataset.role;
      await loginAsRole(state.role);
      await refreshData();
    }
    renderAll();
  } catch (error) {
    toast(error.message);
  }
}

function bindActions() {
  document.querySelectorAll("[data-action]").forEach((node) => {
    node.addEventListener("click", () => handleAction(node.dataset.action, node));
  });
  document.querySelector("#repairForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await api("/repairs", { method: "POST", body: JSON.stringify(formJson(event.currentTarget)) });
      toast("报修提交成功");
      await refreshData();
      renderAll();
      setView("orders");
    } catch (error) {
      toast(error.message);
    }
  });
  document.querySelector("#repairSubmitForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = event.currentTarget.dataset.id;
    try {
      await api(`/repairs/${id}/finish`, { method: "POST", body: JSON.stringify(formJson(event.currentTarget)) });
      toast("维修结果已提交");
      await refreshData();
      renderAll();
    } catch (error) {
      toast(error.message);
    }
  });
  document.querySelectorAll(".rating-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".rating-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    });
  });
  document.querySelector("#feedbackForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = event.currentTarget.dataset.id;
    const score = Number(document.querySelector(".rating-button.active")?.dataset.score || 5);
    const comment = event.currentTarget.querySelector("[name='comment']").value;
    try {
      await api(`/repairs/${id}/confirm`, { method: "POST" });
      await api(`/repairs/${id}/feedback`, { method: "POST", body: JSON.stringify({ score, comment }) });
      toast("评价已提交");
      await refreshData();
      renderAll();
      setView("orders");
    } catch (error) {
      toast(error.message);
    }
  });
  document.querySelector("#loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = formJson(event.currentTarget);
    try {
      await login(data.username, data.password);
      await refreshData();
      renderAll();
      setView("dashboard");
      toast("登录成功");
    } catch (error) {
      toast(error.message);
    }
  });
}

document.querySelector("#roleSelect").addEventListener("change", async (event) => {
  state.role = event.target.value;
  state.view = "dashboard";
  try {
    await loginAsRole(state.role);
    await refreshData();
    renderAll();
  } catch (error) {
    toast(error.message);
  }
});

document.querySelector("#quickAction").addEventListener("click", () => {
  setView(state.role === "student" ? "create" : state.role === "admin" ? "dispatch" : "orders");
});

document.querySelector("#refreshButton").addEventListener("click", async () => {
  await refreshData();
  renderAll();
});

document.querySelector("#globalSearch").addEventListener("change", async (event) => {
  state.keyword = event.target.value.trim();
  await refreshData();
  renderAll();
  setView("orders");
});

(async function bootstrap() {
  try {
    await ensureSession();
    await refreshData();
  } catch (error) {
    toast(error.message);
  }
  renderAll();
})();
