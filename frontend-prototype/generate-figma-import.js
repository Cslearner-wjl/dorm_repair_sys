const fs = require("node:fs");
const path = require("node:path");

const outDir = path.join(__dirname, "figma-import");
fs.mkdirSync(outDir, { recursive: true });

const C = {
  page: "#F5F7F6",
  panel: "#FFFFFF",
  panelSoft: "#EEF4F1",
  ink: "#18211E",
  muted: "#66746F",
  line: "#DCE5E1",
  accent: "#0F766E",
  accentDark: "#0A4F4A",
  accentSoft: "#DFF2EE",
  warnBg: "#FFF4D6",
  warn: "#8A5A00",
  infoBg: "#E0F2FE",
  info: "#0C4A6E",
  doneBg: "#DCFCE7",
  done: "#15803D",
  dangerBg: "#FEE4E2",
  danger: "#B42318",
  confirmBg: "#FFEDD5",
  confirm: "#7C2D12",
};

const esc = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function rect(x, y, w, h, fill = C.panel, stroke = C.line, r = 12) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}"/>`;
}

function txt(value, x, y, size = 14, fill = C.ink, weight = 400, width = 300) {
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="Microsoft YaHei, Arial, sans-serif" font-size="${size}" font-weight="${weight}" style="max-width:${width}px">${esc(value)}</text>`;
}

function status(label, x, y, kind = "pending") {
  const map = {
    pending: [C.warnBg, C.warn],
    assigned: [C.accentSoft, C.accentDark],
    processing: [C.infoBg, C.info],
    confirming: [C.confirmBg, C.confirm],
    done: [C.doneBg, C.done],
    danger: [C.dangerBg, C.danger],
  };
  const [bg, fg] = map[kind];
  return `${rect(x, y, 72, 30, bg, bg, 15)}${txt(label, x + 16, y + 20, 12, fg, 700)}`;
}

function button(label, x, y, w = 92, kind = "primary") {
  const bg = kind === "primary" ? C.accent : kind === "soft" ? C.accentSoft : C.panel;
  const fg = kind === "primary" ? "#FFFFFF" : kind === "soft" ? C.accentDark : C.ink;
  return `${rect(x, y, w, 40, bg, kind === "ghost" ? C.line : bg, 8)}${txt(label, x + 18, y + 26, 14, fg, 700)}`;
}

function sidebar(active, role = "学生用户", x = 0, y = 0, h = 1000) {
  const menus =
    role === "管理员"
      ? ["管理员首页", "报修管理", "用户管理", "工单详情", "登录注册"]
      : role === "维修人员"
        ? ["维修首页", "维修任务", "任务详情", "登录注册"]
        : ["学生首页", "新增报修", "我的报修", "报修详情", "登录注册"];
  let s = rect(x, y, 280, h, "#FBFDFC", C.line, 0);
  s += rect(x + 22, y + 22, 44, 44, C.accentDark, C.accentDark, 12);
  s += txt("修", x + 35, y + 51, 18, "#FFFFFF", 800);
  s += txt("宿舍报修", x + 78, y + 42, 18, C.ink, 800);
  s += txt("Repair Desk", x + 78, y + 63, 12, C.muted);
  s += rect(x + 22, y + 88, 236, 92, C.panelSoft, C.line, 12);
  s += txt("当前角色", x + 38, y + 116, 13, C.muted);
  s += rect(x + 38, y + 128, 204, 38, C.panel, C.line, 8);
  s += txt(role, x + 52, y + 153, 14, C.ink, 600);
  menus.forEach((menu, index) => {
    const yy = y + 202 + index * 48;
    if (menu === active) s += rect(x + 22, yy, 236, 42, C.accentSoft, C.accentSoft, 8);
    s += txt(menu, x + 34, yy + 27, 16, menu === active ? C.accentDark : C.muted, 600);
    s += txt(String(index + 1).padStart(2, "0"), x + 220, yy + 27, 12, C.muted);
  });
  s += rect(x + 22, y + h - 126, 236, 104, C.panel, C.line, 12);
  s += txt("流程闭环", x + 38, y + h - 96, 12, C.muted);
  s += txt("提交、审核、派单、处理、确认、评价", x + 38, y + h - 60, 17, C.ink, 800);
  return s;
}

function topbar(role, title, quick, x = 0, y = 0) {
  return [
    txt(role, x + 304, y + 36, 13, C.muted),
    txt(title, x + 304, y + 82, 38, C.ink, 800),
    rect(x + 858, y + 36, 320, 40, C.panel, C.line, 8),
    txt("搜索  单号、宿舍、姓名", x + 870, y + 62, 14, C.muted),
    button("导出演示数据", x + 1188, y + 36, 126, "ghost"),
    button(quick, x + 1324, y + 36, 92, "primary"),
  ].join("");
}

function metric(label, value, note, x, y) {
  return `${rect(x, y, 266, 136)}${txt(label, x + 18, y + 36, 13, C.muted)}${txt(value, x + 18, y + 84, 36, C.ink, 800)}${txt(note, x + 18, y + 116, 13, C.accentDark)}`;
}

const rows = [
  ["BX20260619001", "三号楼 412 水龙头漏水", "待受理", "pending", "撤销"],
  ["BX20260618009", "六号楼 218 门锁损坏", "已派单", "assigned", "详情"],
  ["BX20260617013", "一号楼 506 网络频繁断开", "处理中", "processing", "详情"],
  ["BX20260615004", "公共洗衣区插座松动", "待确认", "confirming", "确认"],
];

function compactTable(x, y, w = 592) {
  let s = rect(x, y, w, 310, C.panel, C.line, 10);
  ["工单号", "问题", "状态", "操作"].forEach((h, i) => {
    s += txt(h, x + [14, 180, 397, 500][i], y + 32, 13, C.muted, 700);
  });
  rows.forEach((row, i) => {
    const yy = y + 46 + i * 66;
    s += `<line x1="${x}" y1="${yy}" x2="${x + w}" y2="${yy}" stroke="${C.line}"/>`;
    s += txt(row[0], x + 14, yy + 40, 14, C.ink, 800);
    s += txt(row[1], x + 180, yy + 40, 14, C.ink);
    s += status(row[2], x + 397, yy + 17, row[3]);
    s += button(row[4], x + 500, yy + 14, 64, row[4] === "确认" ? "soft" : "ghost");
  });
  return s;
}

function frame(name, x, y, w, h, body) {
  return `<g id="${esc(name)}">${rect(x, y, w, h, C.page, C.page, 0)}${body(x, y)}</g>`;
}

function studentDashboard(x, y) {
  let s = sidebar("学生首页", "学生用户", x, y);
  s += topbar("学生用户", "学生首页", "新增报修", x, y);
  [["我的报修", "12", "本学期累计提交"], ["待处理", "3", "含待受理与处理中"], ["待确认", "1", "需要确认维修结果"], ["平均响应", "2.6h", "近 30 天统计"]].forEach((m, i) => {
    s += metric(m[0], m[1], m[2], x + 304 + i * 282, y + 113);
  });
  s += rect(x + 304, y + 266, 630, 426);
  s += txt("最近报修", x + 322, y + 304, 12, C.muted);
  s += txt("优先展示仍需操作的记录", x + 322, y + 334, 24, C.ink, 800);
  s += button("新增报修", x + 824, y + 300, 90);
  s += compactTable(x + 322, y + 368);
  s += rect(x + 952, y + 266, 464, 426);
  s += txt("学生端信息结构", x + 970, y + 306, 24, C.ink, 800);
  [["1", "填写问题", "宿舍、房间、分类、标题、描述、联系电话为必填。"], ["2", "查看进度", "用状态标签和处理记录解释每一次变更。"], ["3", "确认评价", "待确认状态下开放评分与文字评价。"]].forEach((it, i) => {
    const yy = y + 338 + i * 78;
    s += rect(x + 970, yy, 28, 28, C.accent, C.accent, 14);
    s += txt(it[0], x + 980, yy + 19, 12, "#FFFFFF", 800);
    s += txt(it[1], x + 1012, yy + 16, 16, C.ink, 800);
    s += txt(it[2], x + 1012, yy + 44, 13, C.muted);
  });
  return s;
}

function adminDashboard(x, y) {
  let s = sidebar("管理员首页", "管理员", x, y);
  s += topbar("管理员", "管理员首页", "待受理工单", x, y);
  [["报修总数", "126", "本学期累计"], ["待受理", "8", "需要管理员审核"], ["处理中", "21", "维修人员正在处理"], ["已完成", "92", "平均评分 4.8"]].forEach((m, i) => {
    s += metric(m[0], m[1], m[2], x + 304 + i * 282, y + 113);
  });
  s += rect(x + 304, y + 266, 630, 426);
  s += txt("按类型统计", x + 322, y + 304, 12, C.muted);
  s += txt("高频问题分布", x + 322, y + 334, 24, C.ink, 800);
  [["水电", 42], ["门窗", 24], ["网络", 18], ["家具", 16], ["公共设施", 26]].forEach((b, i) => {
    const yy = y + 382 + i * 48;
    s += txt(b[0], x + 322, yy + 15, 14, C.ink, 600);
    s += rect(x + 402, yy + 5, 380, 10, "#EDF2F0", "#EDF2F0", 5);
    s += rect(x + 402, yy + 5, b[1] * 6, 10, C.accent, C.accent, 5);
    s += txt(b[1], x + 802, yy + 15, 14, C.ink, 700);
  });
  s += rect(x + 952, y + 266, 464, 426);
  s += txt("维修人员负载", x + 970, y + 306, 24, C.ink, 800);
  [["王师傅", "进行中 3", "4.8 分"], ["赵师傅", "进行中 2", "4.7 分"], ["刘师傅", "进行中 1", "4.9 分"]].forEach((r, i) => {
    const yy = y + 362 + i * 74;
    s += rect(x + 970, yy, 420, 56, "#F8FBFA", "#F8FBFA", 8);
    s += txt(r[0], x + 988, yy + 35, 16, C.ink, 800);
    s += txt(r[1], x + 1132, yy + 35, 14, C.muted);
    s += txt(r[2], x + 1280, yy + 35, 14, C.done, 800);
  });
  return s;
}

function orderManagement(x, y, role, active, title, quick) {
  let s = sidebar(active, role, x, y);
  s += topbar(role, title, quick, x, y);
  s += rect(x + 304, y + 113, 1112, 694);
  s += txt(active, x + 322, y + 151, 12, C.muted);
  s += txt(role === "管理员" ? "审核、驳回、派单集中处理" : role === "维修人员" ? "按任务状态推进维修" : "筛选个人报修记录", x + 322, y + 196, 24, C.ink, 800);
  ["全部状态", "全部类型", "提交时间倒序"].forEach((f, i) => {
    s += rect(x + 322 + i * 154, y + 216, 142, 38, C.panel, C.line, 8);
    s += txt(f, x + 336 + i * 154, y + 241, 14, C.ink);
  });
  s += compactTable(x + 322, y + 276, 1074);
  return s;
}

function auth(x, y) {
  let s = sidebar("登录注册", "学生用户", x, y, 900);
  s += topbar("全部角色", "登录注册", "登录系统", x, y);
  s += rect(x + 304, y + 130, 470, 520, C.accentDark, C.accentDark, 12);
  s += txt("学生  管理员  维修人员", x + 338, y + 205, 14, C.accentSoft, 700);
  s += txt("一个入口，按角色进入不同工作台", x + 338, y + 298, 34, "#FFFFFF", 800);
  s += txt("登录后根据 JWT 中的角色加载菜单，未登录访问业务路由时跳转到登录页。", x + 338, y + 392, 16, C.accentSoft);
  s += rect(x + 792, y + 130, 624, 520);
  s += txt("登录与注册", x + 830, y + 210, 12, C.muted);
  s += txt("账号登录", x + 830, y + 254, 24, C.ink, 800);
  [["学号或工号", "请输入账号"], ["密码", "请输入密码"]].forEach((f, i) => {
    const yy = y + 284 + i * 92;
    s += txt(f[0], x + 830, yy + 14, 14, C.ink, 700);
    s += rect(x + 830, yy + 30, 520, 42, C.panel, C.line, 8);
    s += txt(f[1], x + 844, yy + 58, 14, "#99A3A0");
  });
  s += button("登录系统", x + 830, y + 476, 520);
  s += txt("注册字段", x + 830, y + 572, 16, C.ink, 800);
  s += txt("学号或工号、姓名、手机号、密码、角色。管理员账号建议由数据库预置或后台创建。", x + 830, y + 604, 14, C.muted);
  return s;
}

function spec(x, y) {
  let s = txt("宿舍报修管理系统前端设计", x + 64, y + 102, 40, C.ink, 800);
  s += txt("Vue 3 + Vite + Element Plus 落地参考，面向学生、管理员、维修人员三类角色。", x + 64, y + 154, 18, C.muted);
  [["页面类型", "后台管理产品"], ["视觉参数", "Variance 4 / Motion 2 / Density 7"], ["主色", "#0F766E"], ["核心流程", "提交、审核、派单、处理、确认、评价"]].forEach((m, i) => {
    s += metric(m[0], m[1], "课程项目清晰可演示", x + 64 + i * 330, y + 210);
  });
  ["登录注册", "学生首页", "新增报修", "我的报修", "报修详情", "管理员首页", "报修管理", "用户管理", "维修任务"].forEach((p, i) => {
    const xx = x + 64 + (i % 3) * 420;
    const yy = y + 420 + Math.floor(i / 3) * 82;
    s += rect(xx, yy, 370, 56, C.panel, C.line, 10);
    s += txt(p, xx + 18, yy + 36, 16, C.ink, 700);
  });
  return s;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="11220" height="2760" viewBox="0 0 11220 2760">
  <rect width="11220" height="2760" fill="#E9EFEC"/>
  ${frame("设计规范", 0, 0, 1440, 760, spec)}
  ${frame("登录注册", 0, 860, 1440, 900, auth)}
  ${frame("学生首页", 1540, 0, 1440, 1000, studentDashboard)}
  ${frame("我的报修", 3080, 0, 1440, 1000, (x, y) => orderManagement(x, y, "学生用户", "我的报修", "我的报修", "新增报修"))}
  ${frame("管理员首页", 4620, 0, 1440, 1000, adminDashboard)}
  ${frame("报修管理", 6160, 0, 1440, 1000, (x, y) => orderManagement(x, y, "管理员", "报修管理", "报修管理", "待受理工单"))}
  ${frame("维修任务", 7700, 0, 1440, 1000, (x, y) => orderManagement(x, y, "维修人员", "维修任务", "维修任务", "我的任务"))}
  ${frame("学生首页备选", 9240, 0, 1440, 1000, studentDashboard)}
</svg>`;

fs.writeFileSync(path.join(outDir, "宿舍报修管理系统-figma-import.svg"), svg, "utf8");
fs.writeFileSync(
  path.join(outDir, "README.md"),
  [
    "# Figma 导入包",
    "",
    "由于当前 Figma Starter 计划的 MCP 调用限额已用完，无法继续通过 API 直接写入画板。",
    "",
    "可将 `宿舍报修管理系统-figma-import.svg` 拖入 Figma 文件中作为可编辑设计稿基础。SVG 内包含设计规范、登录注册、学生首页、我的报修、管理员首页、报修管理、维修任务等画板。",
    "",
    "已创建的 Figma 文件：",
    "https://www.figma.com/design/P5FWeyKqUA5QU0fYu9dyC4",
    "",
  ].join("\n"),
  "utf8",
);

console.log(path.join(outDir, "宿舍报修管理系统-figma-import.svg"));
