const initialParams = new URLSearchParams(window.location.search);
const initialRole = initialParams.get("role");
const initialView = initialParams.get("view");

const state = {
  role: ["student", "admin", "repair"].includes(initialRole) ? initialRole : "student",
  view: initialView || "dashboard",
};

const roleLabels = {
  student: "学生用户",
  admin: "管理员",
  repair: "维修人员",
};

const roleUsers = {
  student: "张同学",
  admin: "杨老师",
  repair: "李师傅",
};

const roleGreetings = {
  student: "你好，张同学",
  admin: "数据总览",
  repair: "你好，李师傅",
};

const statusMeta = {
  待受理: "pending",
  已受理: "accepted",
  已派单: "assigned",
  处理中: "processing",
  待确认: "confirming",
  已完成: "done",
  已驳回: "rejected",
  已撤销: "cancelled",
  需重派: "reassign",
};

const navByRole = {
  student: [
    { id: "dashboard", label: "学生首页", index: "01" },
    { id: "create", label: "新增报修", index: "02" },
    { id: "orders", label: "我的报修", index: "03" },
    { id: "feedback", label: "确认评价", index: "04" },
    { id: "detail", label: "报修详情", index: "05" },
    { id: "auth", label: "登录注册", index: "06" },
  ],
  admin: [
    { id: "dashboard", label: "管理员首页", index: "01" },
    { id: "dispatch", label: "派单工作台", index: "02" },
    { id: "orders", label: "报修管理", index: "03" },
    { id: "users", label: "用户管理", index: "04" },
    { id: "detail", label: "工单详情", index: "05" },
    { id: "auth", label: "登录注册", index: "06" },
  ],
  repair: [
    { id: "dashboard", label: "维修首页", index: "01" },
    { id: "orders", label: "维修任务", index: "02" },
    { id: "repair-submit", label: "处理提交", index: "03" },
    { id: "detail", label: "任务详情", index: "04" },
    { id: "auth", label: "登录注册", index: "05" },
  ],
};

const orders = [
  {
    no: "BX20260619001",
    title: "三号楼 412 水龙头漏水",
    student: "陈同学",
    dorm: "三号楼 412",
    category: "水电",
    status: "待受理",
    repairer: "待分配",
    createdAt: "2026-06-19 09:20",
    phone: "13800000012",
  },
  {
    no: "BX20260618009",
    title: "六号楼 218 门锁损坏",
    student: "李同学",
    dorm: "六号楼 218",
    category: "门窗",
    status: "已派单",
    repairer: "王师傅",
    createdAt: "2026-06-18 16:45",
    phone: "13800000035",
  },
  {
    no: "BX20260617013",
    title: "一号楼 506 网络频繁断开",
    student: "周同学",
    dorm: "一号楼 506",
    category: "网络",
    status: "处理中",
    repairer: "赵师傅",
    createdAt: "2026-06-17 20:10",
    phone: "13800000056",
  },
  {
    no: "BX20260615004",
    title: "公共洗衣区插座松动",
    student: "宿管登记",
    dorm: "二号楼 1 层",
    category: "公共设施",
    status: "待确认",
    repairer: "王师傅",
    createdAt: "2026-06-15 12:02",
    phone: "13800000077",
  },
  {
    no: "BX20260612002",
    title: "桌椅螺丝脱落",
    student: "林同学",
    dorm: "五号楼 309",
    category: "家具",
    status: "已完成",
    repairer: "刘师傅",
    createdAt: "2026-06-12 08:55",
    phone: "13800000088",
  },
];

const repairers = [
  { name: "王师傅", active: 3, done: 18, score: 4.8 },
  { name: "赵师傅", active: 2, done: 14, score: 4.7 },
  { name: "刘师傅", active: 1, done: 16, score: 4.9 },
];

const users = [
  { account: "2026010101", name: "陈同学", role: "学生用户", phone: "13800000012", status: "启用" },
  { account: "admin001", name: "宿管老师", role: "管理员", phone: "13800000021", status: "启用" },
  { account: "repair003", name: "王师傅", role: "维修人员", phone: "13800000035", status: "启用" },
  { account: "2026010122", name: "测试学生", role: "学生用户", phone: "13800000999", status: "禁用" },
];

const dispatchQueue = [
  {
    no: "BX20260619001",
    title: "三号楼 412 水龙头漏水",
    student: "陈同学",
    dorm: "三号楼 412",
    category: "水电",
    status: "待受理",
    level: "普通",
    createdAt: "2026-06-19 09:20",
    suggestion: "王师傅",
  },
  {
    no: "BX20260619007",
    title: "二号楼 1 层走廊灯不亮",
    student: "宿管登记",
    dorm: "二号楼 1 层",
    category: "公共设施",
    status: "已受理",
    level: "优先",
    createdAt: "2026-06-19 11:08",
    suggestion: "刘师傅",
  },
  {
    no: "BX20260618016",
    title: "五号楼 603 衣柜门脱落",
    student: "郑同学",
    dorm: "五号楼 603",
    category: "家具",
    status: "需重派",
    level: "需复核",
    createdAt: "2026-06-18 18:30",
    suggestion: "赵师傅",
  },
];

const materialRows = [
  { name: "水龙头阀芯", count: "1 个", note: "三号楼 412" },
  { name: "密封胶带", count: "1 卷", note: "公共库存" },
  { name: "检查工时", count: "35 分钟", note: "含现场排查" },
];

const categories = [
  { label: "水电维修", value: "水电", active: true },
  { label: "门窗维修", value: "门窗" },
  { label: "网络维修", value: "网络" },
  { label: "家具维修", value: "家具" },
  { label: "空调维修", value: "空调" },
  { label: "其他", value: "其他" },
];

function statusChip(status) {
  return `<span class="status ${statusMeta[status] || "pending"}">${status}</span>`;
}

function toast(message) {
  const node = document.querySelector("#toast");
  node.textContent = message;
  node.classList.add("show");
  window.setTimeout(() => node.classList.remove("show"), 2200);
}

function setView(view) {
  state.view = view;
  document.body.classList.toggle("auth-open", view === "auth");
  document.querySelectorAll(".view").forEach((node) => node.classList.remove("active"));
  document.querySelector(`#view-${view}`).classList.add("active");
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
          ${item.label}
          <span>${item.index}</span>
        </button>
      `,
    )
    .join("");
  menu.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
}

function metricCards(items) {
  return `
    <div class="grid four">
      ${items
        .map(
          (item, index) => `
            <article class="metric-card card">
              <div class="metric-icon tone-${index + 1}">${item.icon || item.label.slice(0, 1)}</div>
              <div>
                <span>${item.label}</span>
                <strong>${item.value}</strong>
                <small>${item.note}</small>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function ordersTable(type = "student") {
  const actionTitle = type === "admin" ? "审核与派单" : type === "repair" ? "处理任务" : "查看";
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
            <th>维修人员</th>
            <th>提交时间</th>
            <th>${actionTitle}</th>
          </tr>
        </thead>
        <tbody>
          ${orders
            .map(
              (order) => `
                <tr>
                  <td><strong>${order.no}</strong></td>
                  <td>${order.title}</td>
                  <td>${order.dorm}</td>
                  <td>${order.category}</td>
                  <td>${statusChip(order.status)}</td>
                  <td>${order.repairer}</td>
                  <td>${order.createdAt}</td>
                  <td>${actionButtons(type, order.status)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function compactOrdersTable(type = "student") {
  return `
    <div class="table-wrap card">
      <table class="compact-table">
        <thead>
          <tr>
            <th>工单号</th>
            <th>问题</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${orders
            .slice(0, 4)
            .map(
              (order) => `
                <tr>
                  <td><strong>${order.no}</strong></td>
                  <td>${order.title}</td>
                  <td>${statusChip(order.status)}</td>
                  <td>${actionButtons(type, order.status)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function actionButtons(type, status) {
  if (type === "admin") {
    if (status === "待受理") {
      return `<button class="soft-button" type="button" data-demo="受理后可派单">受理</button>`;
    }
    return `<button class="ghost-button" type="button" data-demo="打开派单抽屉">派单</button>`;
  }
  if (type === "repair") {
    if (status === "已派单") {
      return `<button class="soft-button" type="button" data-demo="状态更新为处理中">开始处理</button>`;
    }
    return `<button class="ghost-button" type="button" data-demo="填写处理说明">处理</button>`;
  }
  if (status === "待受理") {
    return `<button class="ghost-button" type="button" data-demo="仅待受理可撤销">撤销</button>`;
  }
  if (status === "待确认") {
    return `<button class="soft-button" type="button" data-demo="确认完成并评价">确认</button>`;
  }
  return `<button class="ghost-button" type="button" data-open-detail>详情</button>`;
}

function bindDemoActions(root = document) {
  root.querySelectorAll("[data-demo]").forEach((button) => {
    button.addEventListener("click", () => toast(button.dataset.demo));
  });
  root.querySelectorAll("[data-open-detail]").forEach((button) => {
    button.addEventListener("click", () => setView("detail"));
  });
}

function renderDashboard() {
  const view = document.querySelector("#view-dashboard");
  if (state.role === "student") {
    view.innerHTML = `
      <section class="welcome-panel">
        <div>
          <h2>${roleGreetings.student}</h2>
          <p>欢迎使用宿舍报修管理系统，及时提交问题，跟踪维修进度。</p>
        </div>
        <button class="primary-button" type="button" data-action="quickRepair">提交报修</button>
      </section>
      <div class="notice-bar">提示：宿舍维修人员会在工作时间内接单，请保持联系电话畅通。</div>
      ${metricCards([
        { label: "待审核", value: "2", note: "较昨日 +1", icon: "审" },
        { label: "维修中", value: "3", note: "较昨日 0", icon: "修" },
        { label: "待确认", value: "1", note: "较昨日 -1", icon: "确" },
        { label: "已完成", value: "12", note: "较昨日 +2", icon: "完" },
      ])}
      <div class="grid two" style="margin-top: 16px;">
        <section class="card card-pad">
          <div class="split-header">
            <div>
              <p class="table-caption">最近报修记录</p>
              <h2>我的控制台</h2>
            </div>
            <button class="primary-button" type="button" data-action="quickRepair">新增报修</button>
          </div>
          ${compactOrdersTable("student")}
        </section>
        <aside class="card card-pad">
          <h2>进度提醒</h2>
          <div class="task-stack">
            <article><strong>公共洗衣区插座松动</strong><span>待确认，请核对维修结果</span>${statusChip("待确认")}</article>
            <article><strong>网络频繁断开</strong><span>赵师傅正在处理交换机端口</span>${statusChip("处理中")}</article>
            <article><strong>水龙头漏水</strong><span>管理员待审核</span>${statusChip("待受理")}</article>
          </div>
        </aside>
      </div>
    `;
  } else if (state.role === "admin") {
    view.innerHTML = `
      <section class="welcome-panel">
        <div>
          <h2>数据总览</h2>
          <p>查看报修分类、状态分布和维修人员负载，集中处理待审核工单。</p>
        </div>
        <button class="primary-button" type="button" data-demo="进入报修管理列表">处理待审核</button>
      </section>
      ${metricCards([
        { label: "报修总数", value: "126", note: "本学期累计", icon: "总" },
        { label: "待审核", value: "8", note: "需要管理员审核", icon: "审" },
        { label: "处理中", value: "21", note: "维修人员处理中", icon: "修" },
        { label: "已完成", value: "92", note: "平均评分 4.8", icon: "完" },
      ])}
      <div class="grid two" style="margin-top: 16px;">
        <section class="card card-pad">
          <div class="split-header">
            <div>
              <p class="table-caption">按类型统计</p>
              <h2>报修分类占比</h2>
            </div>
            <button class="ghost-button" type="button" data-demo="进入统计详情">查看详情</button>
          </div>
          <div class="chart-card">
            <div class="donut-chart"><span>总数<br>126</span></div>
            <div class="chart-list">
              ${barRow("水电维修", 40)}
              ${barRow("门窗维修", 20)}
              ${barRow("网络维修", 15)}
              ${barRow("家具维修", 15)}
              ${barRow("其他", 10)}
            </div>
          </div>
        </section>
        <aside class="card card-pad">
          <h2>维修人员负载</h2>
          <div class="repairer-stack">
            ${repairers.map((item, index) => repairerLoadCard(item, index === 2)).join("")}
          </div>
        </aside>
      </div>
    `;
  } else {
    view.innerHTML = `
      <section class="welcome-panel">
        <div>
          <h2>${roleGreetings.repair}</h2>
          <p>今天是 2026年6月27日，请优先处理紧急和即将超时任务。</p>
        </div>
        <button class="primary-button" type="button" data-demo="只显示我的维修任务">查看任务</button>
      </section>
      ${metricCards([
        { label: "待处理", value: "3", note: "紧急 1 条", icon: "待" },
        { label: "维修中", value: "2", note: "今日需更新", icon: "修" },
        { label: "待确认", value: "1", note: "等待学生确认", icon: "确" },
        { label: "本月完成", value: "15", note: "平均评分 4.8", icon: "完" },
      ])}
      <div class="grid two" style="margin-top: 16px;">
        <section class="card card-pad">
          <div class="split-header">
            <div>
              <p class="table-caption">任务队列</p>
              <h2>先处理已派单和处理中任务</h2>
            </div>
            <button class="ghost-button" type="button" data-demo="只显示我的任务">我的任务</button>
          </div>
          ${compactOrdersTable("repair")}
        </section>
        <aside class="card card-pad">
          <h2>紧急任务</h2>
          <div class="task-stack">
            <article><strong>宿舍空调不制冷</strong><span>1号楼101，联系电话 13600138000</span><span class="tag urgent">紧急</span></article>
            <article><strong>水管漏水</strong><span>2号楼202，请 18:00 前到场</span><span class="tag warning">较急</span></article>
          </div>
        </aside>
      </div>
    `;
  }
  bindDemoActions(view);
}

function barRow(label, value) {
  return `
    <div class="bar-row">
      <span>${label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${value}%"></div></div>
      <strong>${value}</strong>
    </div>
  `;
}

function renderCreate() {
  const view = document.querySelector("#view-create");
  view.innerHTML = `
    <div class="form-shell">
      <section class="card card-pad">
        <div class="split-header">
          <div>
            <p class="table-caption">报修信息</p>
            <h2>提交报修</h2>
          </div>
          <button class="ghost-button" type="button" data-demo="草稿已保存">保存草稿</button>
        </div>
        <div class="category-grid">
          ${categories.map((item) => `<button class="category-tile ${item.active ? "active" : ""}" type="button" data-demo="已选择${item.label}"><span>${item.value.slice(0, 1)}</span>${item.label}</button>`).join("")}
        </div>
        <form class="form-grid" id="repairForm">
          ${field("故障标题", "input", "请输入故障标题（2-30字）", true)}
          ${field("故障描述", "textarea", "请详细描述故障情况，以便维修人员更快处理（10-300字）", true)}
          ${field("所在宿舍", "select", ["1号楼", "2号楼", "3号楼", "4号楼", "5号楼", "6号楼"])}
          ${field("宿舍号", "input", "101")}
          ${field("联系电话", "input", "138 0013 8000")}
          <div class="field">
            <label>紧急程度</label>
            <div class="radio-row">
              <label><input type="radio" name="level" checked /> 普通</label>
              <label><input type="radio" name="level" /> 较急</label>
              <label><input type="radio" name="level" /> 紧急</label>
            </div>
          </div>
          <div class="field full">
            <label>上传图片（最多 3 张）</label>
            <div class="upload-grid">
              <button class="upload-tile" type="button" data-demo="选择图片上传">上传</button>
              <div class="photo-thumb repair-photo-1"></div>
              <div class="photo-thumb repair-photo-2"></div>
            </div>
          </div>
          <div class="field full action-row end">
            <button class="ghost-button" type="button" data-demo="草稿已保存">保存草稿</button>
            <button class="primary-button" type="submit">提交报修</button>
          </div>
        </form>
      </section>
    </div>
  `;
  view.querySelector("#repairForm").addEventListener("submit", (event) => {
    event.preventDefault();
    toast("演示提交成功，状态进入待受理");
  });
  bindDemoActions(view);
}

function field(label, type, value, full = false) {
  const className = full ? "field full" : "field";
  if (type === "select") {
    return `
      <div class="${className}">
        <label>${label}</label>
        <select>${value.map((item) => `<option>${item}</option>`).join("")}</select>
        <span class="error-text">请填写${label}</span>
      </div>
    `;
  }
  if (type === "textarea") {
    return `
      <div class="${className}">
        <label>${label}</label>
        <textarea placeholder="${value}"></textarea>
        <span class="error-text">请填写${label}</span>
      </div>
    `;
  }
  return `
    <div class="${className}">
      <label>${label}</label>
      <input type="text" placeholder="${value}" />
      <span class="error-text">请填写${label}</span>
    </div>
  `;
}

function renderOrders() {
  const view = document.querySelector("#view-orders");
  const type = state.role === "admin" ? "admin" : state.role === "repair" ? "repair" : "student";
  const caption = state.role === "admin" ? "数据总览" : state.role === "repair" ? "任务列表" : "我的报修";
  view.innerHTML = `
    <section class="card card-pad">
      <div class="split-header">
        <div>
          <p class="table-caption">${caption}</p>
          <h2>${state.role === "admin" ? "报修管理列表" : state.role === "repair" ? "我的维修任务" : "我的报修"}</h2>
        </div>
        <button class="primary-button" type="button" data-demo="${state.role === "student" ? "新增报修" : "导出当前列表"}">${state.role === "student" ? "新增报修" : "导出"}</button>
      </div>
      <div class="tabs-row">
        <button class="tab-button active" type="button">全部</button>
        <button class="tab-button" type="button">待审核</button>
        <button class="tab-button" type="button">已派单</button>
        <button class="tab-button" type="button">维修中</button>
        <button class="tab-button" type="button">待确认</button>
        <button class="tab-button" type="button">已完成</button>
      </div>
      <div class="filter-row">
        <label class="list-search"><input type="search" placeholder="搜索工单号、学生、宿舍" /></label>
        <select class="inline-select"><option>全部状态</option><option>待受理</option><option>已派单</option><option>处理中</option><option>待确认</option><option>已完成</option></select>
        <select class="inline-select"><option>全部类型</option><option>水电</option><option>门窗</option><option>家具</option><option>网络</option><option>公共设施</option></select>
        <select class="inline-select"><option>提交时间倒序</option><option>提交时间正序</option></select>
        <button class="primary-button" type="button" data-demo="已按条件筛选">查询</button>
        <button class="ghost-button" type="button" data-demo="筛选条件已重置">重置</button>
      </div>
      ${ordersTable(type)}
      <div class="pagination-row">
        <span>共 18 条</span>
        <div>
          <button class="page-button" type="button">‹</button>
          <button class="page-button active" type="button">1</button>
          <button class="page-button" type="button">2</button>
          <button class="page-button" type="button">3</button>
          <button class="page-button" type="button">›</button>
        </div>
      </div>
    </section>
  `;
  bindDemoActions(view);
}

function renderDispatch() {
  const view = document.querySelector("#view-dispatch");
  view.innerHTML = `
    <div class="grid dispatch-grid">
      <section class="card card-pad">
        <div class="split-header">
          <div>
            <p class="table-caption">管理员派单工作台</p>
            <h2>先审核有效性，再按负载分配维修人员</h2>
          </div>
          <button class="primary-button" type="button" data-demo="批量受理待处理工单">批量受理</button>
        </div>
        <div class="filter-row">
          <select class="inline-select"><option>待派单优先</option><option>待受理</option><option>已受理</option><option>需重派</option></select>
          <select class="inline-select"><option>全部宿舍楼</option><option>一号楼</option><option>二号楼</option><option>三号楼</option><option>五号楼</option></select>
          <select class="inline-select"><option>按提交时间</option><option>按紧急程度</option><option>按报修类型</option></select>
        </div>
        <div class="dispatch-list">
          ${dispatchQueue.map(dispatchTicket).join("")}
        </div>
      </section>
      <aside class="side-stack">
        <section class="card card-pad">
          <div class="split-header">
            <div>
              <p class="table-caption">人员负载</p>
              <h2>派单参考</h2>
            </div>
            ${statusChip("已派单")}
          </div>
          <div class="repairer-stack">
            ${repairers.map((item, index) => repairerLoadCard(item, index === 2)).join("")}
          </div>
        </section>
        <section class="card card-pad">
          <h2>派单规则</h2>
          <ul class="check-list">
            <li><strong>水电与安全隐患</strong><span>优先分配今日空闲人员。</span></li>
            <li><strong>需重派工单</strong><span>先查看退回原因，再重新指定人员。</span></li>
            <li><strong>公共设施</strong><span>按楼栋集中处理，减少往返时间。</span></li>
          </ul>
        </section>
      </aside>
    </div>
  `;
  bindDemoActions(view);
}

function dispatchTicket(item) {
  return `
    <article class="dispatch-ticket">
      <div class="ticket-main">
        <div class="ticket-title">
          <span class="table-caption">${item.no}</span>
          <h3>${item.title}</h3>
        </div>
        ${statusChip(item.status)}
      </div>
      <dl class="ticket-meta">
        <div><dt>位置</dt><dd>${item.dorm}</dd></div>
        <div><dt>类型</dt><dd>${item.category}</dd></div>
        <div><dt>提交人</dt><dd>${item.student}</dd></div>
        <div><dt>紧急度</dt><dd>${item.level}</dd></div>
        <div><dt>提交时间</dt><dd>${item.createdAt}</dd></div>
        <div><dt>建议人员</dt><dd>${item.suggestion}</dd></div>
      </dl>
      <div class="ticket-actions">
        <button class="ghost-button" type="button" data-demo="查看工单详情与处理记录">详情</button>
        <button class="danger-button" type="button" data-demo="填写驳回原因并通知学生">驳回</button>
        <button class="primary-button" type="button" data-demo="选择维修人员并生成派单记录">分配给${item.suggestion}</button>
      </div>
    </article>
  `;
}

function repairerLoadCard(item, recommended) {
  const load = Math.min(100, item.active * 22);
  return `
    <article class="repairer-load ${recommended ? "recommended" : ""}">
      <div>
        <strong>${item.name}</strong>
        <span>${recommended ? "推荐派单" : "正常负载"}</span>
      </div>
      <div class="load-meter" aria-label="${item.name}当前负载">
        <span style="width:${load}%"></span>
      </div>
      <dl>
        <div><dt>进行中</dt><dd>${item.active}</dd></div>
        <div><dt>本月完成</dt><dd>${item.done}</dd></div>
        <div><dt>评分</dt><dd>${item.score}</dd></div>
      </dl>
    </article>
  `;
}

function renderRepairSubmit() {
  const order = orders[1];
  const view = document.querySelector("#view-repair-submit");
  view.innerHTML = `
    <div class="detail-layout">
      <section class="card card-pad">
        <div class="split-header">
          <div>
            <p class="table-caption">${order.no}</p>
            <h2>${order.title}</h2>
          </div>
          ${statusChip("处理中")}
        </div>
        <dl class="description-list">
          <div><dt>宿舍位置</dt><dd>${order.dorm}</dd></div>
          <div><dt>报修类型</dt><dd>${order.category}</dd></div>
          <div><dt>提交学生</dt><dd>${order.student}</dd></div>
          <div><dt>联系电话</dt><dd>${order.phone}</dd></div>
        </dl>
        <form class="form-grid service-form" id="repairSubmitForm">
          <div class="field full">
            <label>现场处理结果</label>
            <textarea placeholder="请填写故障原因、维修过程、处理结果"></textarea>
            <span class="hint">提交后工单进入待确认，由学生确认并评价。</span>
          </div>
          <div class="field">
            <label>维修用时</label>
            <input type="text" placeholder="例如 35 分钟" />
          </div>
          <div class="field">
            <label>是否需要复查</label>
            <select><option>不需要复查</option><option>24 小时后复查</option><option>需管理员复核</option></select>
          </div>
          <div class="field full">
            <label>现场图片</label>
            <input type="text" placeholder="课程演示阶段预留，后续接入完工图片上传" />
          </div>
          <div class="field full">
            <label>耗材与工时记录</label>
            <div class="material-list">
              ${materialRows.map((item) => `<div><strong>${item.name}</strong><span>${item.count}</span><small>${item.note}</small></div>`).join("")}
            </div>
          </div>
          <div class="field full action-row">
            <button class="primary-button" type="submit">提交完成</button>
            <button class="danger-button" type="button" data-demo="填写无法处理原因，回退给管理员重派">申请重派</button>
          </div>
        </form>
      </section>
      <aside class="side-stack">
        <section class="card card-pad">
          <h2>维修前检查</h2>
          <ul class="check-list">
            <li><strong>联系学生</strong><span>确认可进入宿舍的时间段。</span></li>
            <li><strong>核对故障</strong><span>确认位置、类型和实际问题一致。</span></li>
            <li><strong>记录结果</strong><span>完工说明会写入处理时间线。</span></li>
          </ul>
        </section>
        <section class="card card-pad">
          <h2>任务流转</h2>
          <ul class="timeline">
            <li><span class="node">1</span><div><p>管理员派单</p><span>2026-06-18 17:10，分配给王师傅。</span></div></li>
            <li><span class="node">2</span><div><p>开始处理</p><span>2026-06-19 09:00，状态更新为处理中。</span></div></li>
            <li><span class="node">3</span><div><p>等待提交</p><span>填写处理说明后进入学生确认。</span></div></li>
          </ul>
        </section>
      </aside>
    </div>
  `;
  view.querySelector("#repairSubmitForm").addEventListener("submit", (event) => {
    event.preventDefault();
    toast("维修结果已提交，状态更新为待确认");
  });
  bindDemoActions(view);
}

function renderFeedback() {
  const order = orders[3];
  const view = document.querySelector("#view-feedback");
  view.innerHTML = `
    <div class="grid feedback-grid">
      <section class="card card-pad">
        <div class="split-header">
          <div>
            <p class="table-caption">${order.no}</p>
            <h2>确认维修结果并评价</h2>
          </div>
          ${statusChip("待确认")}
        </div>
        <div class="result-panel">
          <div>
            <span class="small-label">维修结论</span>
            <strong>插座面板已加固，更换老化螺丝，现场通电测试正常。</strong>
          </div>
          <dl>
            <div><dt>维修人员</dt><dd>${order.repairer}</dd></div>
            <div><dt>完成时间</dt><dd>2026-06-19 10:35</dd></div>
            <div><dt>位置</dt><dd>${order.dorm}</dd></div>
          </dl>
        </div>
        <form class="form-grid feedback-form" id="feedbackForm">
          <div class="field full">
            <label>满意度评分</label>
            <div class="rating-row" id="ratingRow" aria-label="满意度评分">
              <button class="rating-button" type="button" data-score="1">1</button>
              <button class="rating-button" type="button" data-score="2">2</button>
              <button class="rating-button" type="button" data-score="3">3</button>
              <button class="rating-button" type="button" data-score="4">4</button>
              <button class="rating-button active" type="button" data-score="5">5</button>
            </div>
            <span class="hint" id="ratingHint">已选择 5 分，维修结果满意。</span>
          </div>
          <div class="field full">
            <label>评价内容</label>
            <textarea placeholder="可以填写维修速度、沟通体验、结果是否稳定等"></textarea>
          </div>
          <div class="field full action-row">
            <button class="primary-button" type="submit">确认完成并提交评价</button>
            <button class="ghost-button" type="button" data-demo="暂不确认，保留待确认状态">暂不确认</button>
          </div>
        </form>
      </section>
      <aside class="side-stack">
        <section class="card card-pad">
          <h2>确认前核对</h2>
          <ul class="check-list">
            <li><strong>故障已解决</strong><span>现场功能恢复，无明显安全隐患。</span></li>
            <li><strong>信息无误</strong><span>维修人员、位置和完成说明与实际一致。</span></li>
            <li><strong>评价提交</strong><span>确认后状态变为已完成，评价进入统计。</span></li>
          </ul>
        </section>
        <section class="card card-pad">
          <h2>处理记录</h2>
          <ul class="timeline">
            <li><span class="node">1</span><div><p>提交报修</p><span>2026-06-15 12:02，公共洗衣区插座松动。</span></div></li>
            <li><span class="node">2</span><div><p>维修处理</p><span>2026-06-19 09:40，完成现场加固。</span></div></li>
            <li><span class="node">3</span><div><p>等待确认</p><span>学生确认后关闭工单。</span></div></li>
          </ul>
        </section>
      </aside>
    </div>
  `;
  const ratingHint = view.querySelector("#ratingHint");
  view.querySelectorAll(".rating-button").forEach((button) => {
    button.addEventListener("click", () => {
      view.querySelectorAll(".rating-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      ratingHint.textContent = `已选择 ${button.dataset.score} 分，提交后会写入评价统计。`;
    });
  });
  view.querySelector("#feedbackForm").addEventListener("submit", (event) => {
    event.preventDefault();
    toast("评价已提交，工单状态更新为已完成");
  });
  bindDemoActions(view);
}

function renderDetail() {
  const order = orders[2];
  const view = document.querySelector("#view-detail");
  view.innerHTML = `
    <section class="card card-pad progress-card">
      <div class="step-line">
        ${["提交报修", "管理员受理", "已派单", "维修中", "待确认", "已完成"]
          .map((item, index) => `<div class="step ${index < 4 ? "done" : ""}"><span>${index + 1}</span><strong>${item}</strong><small>06-27 ${index < 4 ? "10:30" : "--"}</small></div>`)
          .join("")}
      </div>
    </section>
    <div class="detail-layout" style="margin-top: 16px;">
      <section class="card card-pad">
        <div class="split-header">
          <div>
            <p class="table-caption">报修信息</p>
            <h2>${order.title}</h2>
          </div>
          ${statusChip(order.status)}
        </div>
        <dl class="description-list">
          <div><dt>宿舍位置</dt><dd>${order.dorm}</dd></div>
          <div><dt>报修类型</dt><dd>${order.category}</dd></div>
          <div><dt>提交学生</dt><dd>${order.student}</dd></div>
          <div><dt>联系电话</dt><dd>${order.phone}</dd></div>
          <div><dt>维修人员</dt><dd>${order.repairer}</dd></div>
          <div><dt>提交时间</dt><dd>${order.createdAt}</dd></div>
        </dl>
        <div class="content-block">
          <h3>问题描述</h3>
          <p style="color: var(--muted); line-height: 1.8;">宿舍网络从晚间开始频繁断开，重启路由器后短时间恢复，约十分钟后再次掉线，影响在线课程和资料提交。</p>
        </div>
        <div class="upload-grid compact">
          <div class="photo-thumb repair-photo-1"></div>
          <div class="photo-thumb repair-photo-2"></div>
          <div class="photo-thumb repair-photo-3"></div>
        </div>
        <div class="filter-row" style="margin-top: 18px;">
          ${detailActionButtons()}
        </div>
      </section>
      <aside class="side-stack">
        <section class="card card-pad profile-card">
          <h2>维修人员</h2>
          <div class="repairer-profile">
            <span class="avatar lg">李</span>
            <div><strong>李师傅</strong><p>159 1234 5678</p></div>
          </div>
          <p class="muted-line">预计完成时间：2026-06-27 18:00</p>
        </section>
        <section class="card card-pad">
          <h2>处理记录</h2>
          <ul class="timeline">
            <li><span class="node">1</span><div><p>学生提交报修</p><span>2026-06-17 20:10，状态为待受理。</span></div></li>
            <li><span class="node">2</span><div><p>管理员受理</p><span>2026-06-18 08:30，确认为网络故障。</span></div></li>
            <li><span class="node">3</span><div><p>分配维修人员</p><span>2026-06-18 09:00，派单给赵师傅。</span></div></li>
            <li><span class="node">4</span><div><p>维修处理中</p><span>2026-06-18 15:20，正在排查交换机端口。</span></div></li>
          </ul>
        </section>
      </aside>
    </div>
  `;
  bindDemoActions(view);
}

function detailActionButtons() {
  if (state.role === "admin") {
    return `
      <button class="primary-button" type="button" data-demo="打开维修人员选择弹窗">重新派单</button>
      <button class="ghost-button" type="button" data-demo="记录管理员备注">添加备注</button>
    `;
  }
  if (state.role === "repair") {
    return `
      <button class="primary-button" type="button" data-demo="提交完成说明，状态变为待确认">提交完成</button>
      <button class="danger-button" type="button" data-demo="填写无法维修原因，状态变为需重派">申请重派</button>
    `;
  }
  return `
    <button class="primary-button" type="button" data-demo="填写 1 到 5 分评分和评价">确认完成并评价</button>
    <button class="ghost-button" type="button" data-demo="返回我的报修列表">返回列表</button>
  `;
}

function renderUsers() {
  const view = document.querySelector("#view-users");
  view.innerHTML = `
    <section class="card card-pad">
      <div class="split-header">
        <div>
          <p class="table-caption">用户管理</p>
          <h2>角色与账号状态由管理员维护</h2>
        </div>
        <button class="ghost-button" type="button" data-demo="按角色筛选用户">按角色筛选</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>账号</th><th>姓名</th><th>角色</th><th>手机号</th><th>状态</th><th>操作</th></tr>
          </thead>
          <tbody>
            ${users
              .map(
                (user) => `
                  <tr>
                    <td><strong>${user.account}</strong></td>
                    <td>${user.name}</td>
                    <td>${user.role}</td>
                    <td>${user.phone}</td>
                    <td>${user.status === "启用" ? statusChip("已完成").replace("已完成", "启用") : statusChip("已驳回").replace("已驳回", "禁用")}</td>
                    <td><button class="ghost-button" type="button" data-demo="修改角色或启用状态">编辑</button></td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
  bindDemoActions(view);
}

function renderAuth() {
  const view = document.querySelector("#view-auth");
  view.innerHTML = `
    <div class="auth-screen">
      <section class="auth-hero">
        <div class="brand auth-brand">
          <img class="brand-mark" src="./assets/brand-mark.png" alt="宿舍报修管理系统标识" />
          <div>
            <strong>宿舍报修管理系统</strong>
            <span>Dormitory Repair Management System</span>
          </div>
        </div>
        <div class="auth-copy">
          <h2>让宿舍报修更高效<br />让服务管理更智能</h2>
          <p>提交报修、实时跟踪、快速响应、满意服务</p>
        </div>
        <img class="campus-visual" src="./assets/auth-illustration.png" alt="校园宿舍维修场景插画" />
      </section>
      <section class="auth-panel card">
        <h2>用户登录</h2>
        <div class="segmented">
          <button class="active" type="button">学生</button>
          <button type="button">维修人员</button>
          <button type="button">管理员</button>
        </div>
        <form class="form-grid" id="loginForm">
          <div class="field full"><label>学号/账号</label><input type="text" placeholder="请输入学号或账号" /></div>
          <div class="field full"><label>密码</label><input type="password" placeholder="请输入密码" /></div>
          <div class="form-between field full">
            <label><input type="checkbox" /> 记住我</label>
            <button class="link-button" type="button" data-demo="跳转忘记密码流程">忘记密码？</button>
          </div>
          <div class="field full"><button class="primary-button" type="submit">登录</button></div>
        </form>
        <p class="auth-switch">没有账号？<button class="link-button" type="button" data-demo="显示学生注册表单">去注册</button></p>
      </section>
    </div>
  `;
  view.querySelector("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    toast("演示登录成功，根据角色进入首页");
  });
  bindDemoActions(view);
}

function renderAll() {
  document.querySelector("#roleSelect").value = state.role;
  document.querySelector("#roleName").textContent = roleLabels[state.role];
  document.querySelector("#userName").textContent = roleUsers[state.role];
  document.querySelector(".avatar").textContent = roleUsers[state.role].slice(0, 1);
  const quickAction = document.querySelector("#quickAction");
  quickAction.textContent =
    state.role === "student" ? "新增报修" : state.role === "admin" ? "待受理工单" : "我的任务";
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
  quickAction.onclick = () => {
    setView(state.role === "student" ? "create" : "orders");
  };
  document.querySelectorAll("[data-action='quickRepair']").forEach((button) => {
    button.addEventListener("click", () => setView("create"));
  });
}

document.querySelector("#roleSelect").addEventListener("change", (event) => {
  state.role = event.target.value;
  state.view = "dashboard";
  renderAll();
});

renderAll();
