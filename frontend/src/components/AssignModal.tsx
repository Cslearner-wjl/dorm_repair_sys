import { useState } from "react";
import { Modal } from "./Modal";
import type { UserVO } from "../types";

export function AssignModal({
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
