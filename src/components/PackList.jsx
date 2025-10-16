import React, { useEffect, useState } from 'react';
import { listPacks, listOrphanPacks, deletePack } from '../api.js';
import PackEdit from './PackEdit.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';

export default function PackList({ palletId, seqPallet }) {
  const palletLabel = seqPallet ?? palletId ?? '-';
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // { mode: 'create'|'edit', pack }
  const [confirm, setConfirm] = useState(null);

  // Orphan mode keeps seq_pallet = null records visible
  const [orphansMode, setOrphansMode] = useState(false);
  const hasPallet = palletId !== null && palletId !== undefined;
  const effectiveOrphans = orphansMode || !hasPallet;

  async function load() {
    setOrphansMode(false)
    setLoading(true);
    setError('');
    try {
      const data = effectiveOrphans
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

  useEffect(() => {
    if (total === 0) {
      if (offset !== 0) {
        setOffset(0);
      }
      return;
    }

    const lastPageOffset = Math.max(0, (Math.ceil(total / limit) - 1) * limit);
    if (offset > lastPageOffset) {
      setOffset(lastPageOffset);
    }
  }, [total, limit, offset]);

  useEffect(() => {
    if (!hasPallet) {
      setOrphansMode(true);
    }
  }, [hasPallet]);

  const page = Math.floor(offset / limit) + 1;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  const handleAdd = async () => {
    setEditing({
      mode: 'create',
      pack: {
        qr_code: '',
        orig: '',
        seq_pack: Date.now(),
        seq_pallet: effectiveOrphans ? null : seqPallet ?? '',
        lastpack: false,
        pospallet: '',
        robot_num: ''
      },
      palletId: effectiveOrphans ? null : palletId
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
    <div className="card table-card">
      <div className="card-header">
        <h2>
          {effectiveOrphans
            ? 'Orphan Packs (seq_pallet = null)'
            : `Packs for Pallet seq ${palletLabel}`}
        </h2>

        <div className="pager">
          {/* <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={orphansMode}
              onChange={(e) => {
                if (!hasPallet) return;
                setOrphansMode(e.target.checked);
              }}
              disabled={!hasPallet}
              title={
                hasPallet
                  ? 'Mostrar apenas registros com seq_pallet = null'
                  : 'Habilitado automaticamente enquanto nenhum pallet estiver selecionado'
              }
            />
            Only seq_pallet = null
          </label> */}

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
          <div>seq_pallet </div>
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
              <div>{p.seq_pallet ?? '-'}</div>
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
              {effectiveOrphans ? 'No orphan packs' : 'No pack items'}
            </div>
          )}
        </div>
      </div>

      {editing && (
        <PackEdit
          mode={editing.mode}
          pack={editing.pack}
          palletId={editing.palletId ?? null}
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
