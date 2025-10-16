import React from 'react';

export default function PalletList({
  items,
  selectedId,
  onSelect,
  loading,
  error,
  page,
  pageCount,
  onPrev,
  onNext,
  limit,
  onChangeLimit
}) {
  return (
    <div className="card sidebar-card">
      <div className="card-header">
        <h2>Pallets</h2>
        <div className="pager">
          <label>
            Page {page} / {pageCount}
          </label>
          <button className="btn" onClick={onPrev} disabled={page <= 1}>Prev</button>
          <button className="btn" onClick={onNext} disabled={page >= pageCount}>Next</button>
          <select
            className="input"
            value={limit ?? 5}
            onChange={(e) => onChangeLimit(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {loading && <div className="muted">Loading…</div>}

      <ul className="list">
        {items.map(p => (
          <li key={p.id} className={`list-item ${p.id === selectedId ? 'selected' : ''}`} onClick={() => onSelect(p.id)}>
            <div className="row">
              <div className="col grow">#{p.id} — {p.qr_code || '—'}</div>
              <div className="col">seq: {p.seq_pallet ?? '—'}</div>
              <div className="col">doca: {p.num_doca ?? '—'}</div>
              <div className={`col tag ${p.completed ? 'ok' : 'warn'}`}>{p.completed ? 'Completed' : 'Open'}</div>
            </div>
          </li>
        ))}
        {!items.length && !loading && <li className="muted">No pallets</li>}
      </ul>
    </div>
  );
}
