import { useState } from "react";
import { Modal } from "./Modal";

export function TextModal({
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
