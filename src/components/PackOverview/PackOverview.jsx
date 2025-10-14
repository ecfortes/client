import React, { useEffect, useState } from 'react';
import { listPackOverview } from '../../api.js';
import './PackOverview.css';
import { fmtDate } from '../../util/date.js'; 

export default function PackOverview() {
    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [limit, setLimit] = useState(20);
    const [offset, setOffset] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    async function load() {
        setLoading(true);
        setError('');
        try {
            const data = await listPackOverview({ limit, offset, search });
            const items = Array.isArray(data?.items) ? data.items : [];
            const total = Number.isFinite(data?.total) ? data.total : items.length;
            setItems(items);
            setTotal(total);
        } catch (e) {
            setError(e.message || String(e));
        } finally {
            setLoading(false);
        }
    }

    // reset da paginação quando mudar limit ou busca
    useEffect(() => { setOffset(0); }, [limit, search]);

    useEffect(() => { load(); }, [limit, offset, search]);

    const page = Math.floor(offset / limit) + 1;
    const pageCount = Math.max(1, Math.ceil(total / limit));

    return (
        <div className="card">
            <div className="card-header">
                <h2>Packs Overview (vw_pack_overview)</h2>

                <div className="pager" style={{ gap: 8 }}>
                    <input
                        className="input"
                        placeholder="Search QR / pallet / OT"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ minWidth: 220 }}
                    />

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
                        onChange={(e) => setLimit(Number(e.target.value))}
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>

            {error && <div className="error">{error}</div>}
            {loading && <div className="muted">Loading…</div>}

            <div className="table_overview">
                <div className="t-head">
                    <div>FECHA</div>
                    <div>HORA</div>
                    <div>EAN</div>
                    <div>ORIGEM ENFARDADEIRA</div>
                    <div>OT</div>
                    <div>IDEN ROBOT</div>
                    <div>IDEN PALLET</div>
                    <div>PALET COMPLETO</div>
                    <div>DESTINO MUELLE</div>
                </div>

                <div className="t-body">
                    {items.map((r, idx) => (
                        <div className="t-row" key={idx}>
                            <div>{fmtDate(r.fecha)}</div>
                            <div>{r.hora}</div>
                            <div title={r.idea_ean || ''}>{r.idea_ean || '—'}</div>
                            <div>{r.origem_enfardadeira ?? '—'}</div>
                            <div>{r.ot ?? '—'}</div>
                            <div>{r.iden_robot ?? '—'}</div>
                            <div title={r.iden_pallet || ''}>{r.iden_pallet || '—'}</div>
                            <div>{r.palet_completo ? '1' : '0'}</div>
                            <div>{r.destino_muelle ?? '—'}</div>
                        </div>
                    ))}

                    {!items.length && !loading && (
                        <div className="t-row muted">No overview data</div>
                    )}
                </div>
            </div>
        </div>
    );
}
