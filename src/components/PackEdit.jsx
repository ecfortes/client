import React, { useEffect, useState } from 'react';
import { updatePack, createPack, createOrphanPack } from '../api.js';
import Modal from './Modal.jsx';

function sanitizeNumber(v, allowFloat = true) {
  if (v === '' || v === null || v === undefined) return null;
  const num = Number(v);
  if (!isFinite(num)) return null;
  if (!allowFloat && !Number.isInteger(num)) return null;
  return num;
}

export default function PackEdit({ mode, pack, palletId = null, onClose, onSaved }) {
  const isCreate = mode === 'create';
  const [form, setForm] = useState(() => {
    if (isCreate) {
      const base = pack || {};
      const seq_pack = base.seq_pack ?? Date.now();
      const seq_pallet = base.seq_pallet ?? (palletId ?? null);
      return { ...base, seq_pack, seq_pallet };
    }
    return pack || {};
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isCreate) {
      setForm((prev) => {
        const base = pack || {};
        const seq_pack = base.seq_pack ?? prev.seq_pack ?? Date.now();
        const seq_pallet = base.seq_pallet ?? (palletId ?? prev.seq_pallet ?? null);
        return { ...base, seq_pack, seq_pallet };
      });
    } else {
      setForm(pack || {});
    }
  }, [isCreate, pack, palletId]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        qr_code: form.qr_code || null,
        seq_pallet: sanitizeNumber(form.seq_pallet,false),
        orig: sanitizeNumber(form.orig, false),
        seq_pack: sanitizeNumber(form.seq_pack, true),
        lastpack: !!form.lastpack,
        pospallet: sanitizeNumber(form.pospallet, false),
        robot_num: sanitizeNumber(form.robot_num, false),
      };

      if (isCreate) {
        if (palletId !== null && palletId !== undefined) {
          await createPack(palletId, payload);
        } else {
          await createOrphanPack(payload);
        }
      } else {
        await updatePack(form.id, payload);
      }
      onSaved();
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal onClose={onClose} title={isCreate ? 'Add Pack' : `Edit Pack #${form.id}`}>
      <form className="form" onSubmit={handleSave}>
        <div className="grid">
          <label className="field">
            <span>QR Code</span>
            <input className="input" value={form.qr_code || ''} onChange={(e) => update('qr_code', e.target.value)} />
          </label>
          <label className="field">
            <span>orig</span>
            <input className="input" type="number" value={form.orig ?? ''} onChange={(e) => update('orig', e.target.value)} />
          </label>
          <label className="field">
            <span>seq_pack</span>
            <input className="input" type="number" step="any" value={form.seq_pack ?? ''} onChange={(e) => update('seq_pack', e.target.value)} />
          </label>


          <label className="field">
            <span>seq_pallet</span>
            <input className="input" type="number" step="any" value={form.seq_pallet ?? ''} onChange={(e) => update('seq_pallet', e.target.value)} />
          </label>


          <label className="field">
            <span>lastpack</span>
            <input type="checkbox" checked={!!form.lastpack} onChange={(e) => update('lastpack', e.target.checked)} />
          </label>
          <label className="field">
            <span>pospallet</span>
            <input className="input" type="number" value={form.pospallet ?? ''} onChange={(e) => update('pospallet', e.target.value)} />
          </label>
          <label className="field">
            <span>robot_num</span>
            <input className="input" type="number" value={form.robot_num ?? ''} onChange={(e) => update('robot_num', e.target.value)} />
          </label>
        </div>
        <div className="form-actions">
          <button className="btn" type="button" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={saving} type="submit">{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}
