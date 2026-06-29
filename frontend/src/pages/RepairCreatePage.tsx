import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Upload, Wrench } from "lucide-react";
import { REPAIR_CATEGORIES } from "../constants";
import CATEGORY_ICONS from "../icons";
import type { RepairFormDTO, ToastMessage, UserVO } from "../types";
import { cn } from "../utils";
import { repairApi, uploadApi } from "../api";
import { PanelTitle } from "../components/PanelTitle";

export function RepairCreatePage({
  user,
  onToast,
}: {
  user: UserVO;
  onToast: (toast: ToastMessage | null) => void;
}) {
  const navigate = useNavigate();
  const [buildings, setBuildings] = useState<string[]>([]);
  const [form, setForm] = useState<RepairFormDTO>({
    dormBuilding: "",
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

  useEffect(() => {
    repairApi.buildings().then(setBuildings).catch(() => setBuildings([]));
  }, []);

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
      navigate("/my-repairs");
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
            <input
              value={form.dormBuilding}
              onChange={(event) => update("dormBuilding", event.target.value)}
              placeholder="如：智园10舍、3号楼"
              list="buildings-list"
              required
            />
            <datalist id="buildings-list">
              {buildings.map((building) => (
                <option key={building} value={building} />
              ))}
            </datalist>
          </label>
          <label className="field-group">
            <span className="field-label">宿舍房间号</span>
            <input value={form.roomNo} onChange={(event) => update("roomNo", event.target.value)} placeholder="如：302、611" required />
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
          <li>工单创建后默认进入"待受理"。</li>
          <li>维修完成后可在详情页确认并评价。</li>
        </ul>
      </aside>
    </div>
  );
}
