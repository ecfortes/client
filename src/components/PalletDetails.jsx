import React, { useEffect, useState } from 'react';

function initialFormFromPallet(p) {
  // Normaliza o estado do formulário para evitar null/undefined
  return {
    id: p?.id ?? null,
    qr_code: p?.qr_code ?? '',
    completed: !!p?.completed,
    // Mantemos strings nos inputs; convertemos para número apenas no submit
    num_doca: p?.num_doca ?? '',
    seq_pallet: p?.seq_pallet ?? '',
    station: p?.station ?? '',
    created_at: p?.created_at ?? null,
    updated_at: p?.updated_at ?? null,
  };
}

function toNumberOrNull(v) {
  if (v === '' || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function PalletDetails({ pallet, onSave, onDelete }) {
  // Inicializa com objeto seguro (evita ler propriedades de null)
  const [form, setForm] = useState(() => initialFormFromPallet(pallet));

  useEffect(() => {
    setForm(initialFormFromPallet(pallet));
  }, [pallet]);

  if (!pallet) {
    return (
      <div className="card">
        <div className="muted">Select a pallet to view details</div>
      </div>
    );
  }

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      qr_code: (form.qr_code ?? '').trim() || null,
      completed: !!form.completed,
      num_doca: toNumberOrNull(form.num_doca),
      seq_pallet: toNumberOrNull(form.seq_pallet),
      station: toNumberOrNull(form.station),
    };
    onSave?.(payload);
  };

  const createdLabel = form.created_at
    ? new Date(form.created_at).toLocaleString()
    : '—';
  const updatedLabel = form.updated_at
    ? new Date(form.updated_at).toLocaleString()
    : '—';

  return (
    <div className="card">
      <div className="card-header">
        <h2>Pallet #{pallet.id}</h2>
        <button
          className="btn danger"
          onClick={() => (typeof onDelete === 'function' ? onDelete(pallet.id) : undefined)}
        >
          Delete
        </button>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <div className="grid">
          <label className="field">
            <span>QR Code</span>
            <input
              className="input"
              value={form.qr_code}
              onChange={(e) => update('qr_code', e.target.value)}
            />
          </label>

          <label className="field">
            <span>Completed</span>
            <input
              type="checkbox"
              checked={!!form.completed}
              onChange={(e) => update('completed', e.target.checked)}
            />
          </label>

          <label className="field">
            <span>Num Doca</span>
            <input
              className="input"
              type="number"
              value={form.num_doca}
              onChange={(e) => update('num_doca', e.target.value)}
            />
          </label>

          <label className="field">
            <span>seq_pallet</span>
            <input
              className="input"
              type="number"
              step="any"
              value={form.seq_pallet}
              onChange={(e) => update('seq_pallet', e.target.value)}
            />
          </label>

          <label className="field">
            <span>station</span>
            <input
              className="input"
              type="number"
              value={form.station}
              onChange={(e) => update('station', e.target.value)}
            />
          </label>
        </div>

        <div className="form-actions">
          <button className="btn primary" type="submit">
            Save Changes
          </button>
        </div>
      </form>

      <div className="meta">
        <span>Created: {createdLabel}</span>
        <span>Updated: {updatedLabel}</span>
      </div>
    </div>
  );
}
