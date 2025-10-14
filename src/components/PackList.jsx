import React, { useEffect, useState } from 'react';
import { listPacks, listOrphanPacks, createPack, deletePack } from '../api.js';
import PackEdit from './PackEdit.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

export default function PackList({ palletId, seqPallet }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // { mode: 'create'|'edit', pack }
  const [confirm, setConfirm] = useState(null);

  // Novo: modo "órfãos" (seq_pallet = null)
  const [orphansMode, setOrphansMode] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = orphansMode
        ? await listOrphanPacks({ limit, offset })
        : await listPacks(palletId, { limit, offset });

      // Normaliza resposta
      const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      const total = Number.isFinite(data?.total) ? data.total : items.length;

      setItems(items);
      setTotal(total);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  // reset de paginação quando mudar pallet, limite ou o modo
  useEffect(() => {
    setOffset(0);
  }, [palletId, limit, orphansMode]);

  useEffect(() => {
    load();
  }, [palletId, limit, offset, orphansMode]);

  const page = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  const handleAdd = async () => {
    // Em orphansMode não faz sentido "criar" sem pallet; desabilitamos o botão.
    if (orphansMode) return;
    window.__currentPalletId = palletId;
    setEditing({
      mode: 'create',
      pack: { qr_code: '', orig: '', seq_pack: '', lastpack: false, pospallet: '', robot_num: '' }
    });
  };

  const handleDelete = (id) => {
    setConfirm({
      title: 'Delete Pack',
      message: 'Are you sure you want to delete this pack record?',
      onConfirm: async () => {
        try {
          await deletePack(id);
          setConfirm(null);
          await load();
        } catch (e) {
          alert(e.message || String(e));
        }
      }
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>
          {orphansMode
            ? 'Orphan Packs (seq_pallet = null)'
            : `Packs for Pallet seq ${seqPallet}`}
        </h2>

        <div className="pager">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={orphansMode}
              onChange={(e) => setOrphansMode(e.target.checked)}
              title="Mostrar apenas registros com seq_pallet = null"
            />
            Only seq_pallet = null
          </label>

          <label>Page {page} / {pageCount}</label>
          <button
            className="btn"
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={page <= 1}
          >
            Prev
          </button>
          <button
            className="btn"
            onClick={() => setOffset(Math.min((pageCount - 1) * limit, offset + limit))}
            disabled={page >= pageCount}
          >
            Next
          </button>

          <select
            className="input"
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>

          <button
            className="btn primary"
            onClick={handleAdd}
            disabled={orphansMode}
            title={orphansMode ? 'Criação desabilitada no modo órfãos' : undefined}
          >
            + Add Pack
          </button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="muted">Loading…</div>}

      <div className="table">
        <div className="t-head">
          <div>ID</div>
          <div>QR</div>
          <div>orig</div>
          <div>seq_pack</div>
          <div>lastpack</div>
          <div>pospallet</div>
          <div>robot_num</div>
          <div></div>
        </div>

        <div className="t-body">
          {items.map((p) => (
            <div className="t-row" key={p.id}>
              <div>{p.id}</div>
              <div title={p.qr_code || ''}>{p.qr_code || '—'}</div>
              <div>{p.orig ?? '—'}</div>
              <div>{p.seq_pack ?? '—'}</div>
              <div>{p.lastpack ? 'Yes' : 'No'}</div>
              <div>{p.pospallet ?? '—'}</div>
              <div>{p.robot_num ?? '—'}</div>
              <div className="actions">
                <button className="btn" onClick={() => setEditing({ mode: 'edit', pack: p })}>Edit</button>
                <button className="btn danger" onClick={() => handleDelete(p.id)}>Delete</button>
              </div>
            </div>
          ))}
          {!items.length && !loading && (
            <div className="t-row muted">
              {orphansMode ? 'No orphan packs' : 'No pack items'}
            </div>
          )}
        </div>
      </div>

      {editing && (
        <PackEdit
          mode={editing.mode}
          pack={editing.pack}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          onCancel={() => setConfirm(null)}
          onConfirm={confirm.onConfirm}
        />
      )}
    </div>
  );
}
