import { Megaphone } from "lucide-react";
import { HERO_IMAGE } from "../constants";
import { PanelTitle } from "../components/PanelTitle";

export function AnnouncementsPage() {
  return (
    <div className="space-y">
      <section className="hero-panel compact-hero">
        <div className="hero-copy">
          <p className="eyebrow">通知公告</p>
          <h1>校园维修公告</h1>
          <p>校园通知、维修安排和安全提醒将在这里集中展示。</p>
        </div>
        <img src={HERO_IMAGE} alt="校园公告插画" />
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
