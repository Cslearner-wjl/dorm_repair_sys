import { useState } from "react";
import { Star } from "lucide-react";
import { Modal } from "./Modal";

export function FeedbackModal({
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
