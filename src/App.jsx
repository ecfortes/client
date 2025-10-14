import React, { useEffect, useMemo, useState } from 'react';
import { listPallets, getPallet, updatePallet, createPallet, deletePallet } from './api.js';
import DatabaseConnection from './components/DatabaseConnection.jsx';
import PalletList from './components/PalletList.jsx';
import PalletDetails from './components/PalletDetails.jsx';
import PackList from './components/PackList.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import PackOverview from './components/PackOverview/PackOverview.jsx';

export default function App() {
  const [pallets, setPallets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(null); // { title, message, onConfirm }

  const page = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit]);
  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  async function loadPallets(opts = {}) {
    setLoading(true);
    setError('');
    try {
      const data = await listPallets({ limit, offset, search, ...opts });
      setPallets(data.items);
      setTotal(data.total);
      if (data.items.length && (selectedId === null || !data.items.some(p => p.id === selectedId))) {
        setSelectedId(data.items[0].id);
      } else if (!data.items.length) {
        setSelectedId(null);
        setSelected(null);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSelected(id) {
    if (!id) return setSelected(null);
    try {
      const data = await getPallet(id);
      setSelected(data);
    } catch (e) {
      setSelected(null);
    }
  }

  useEffect(() => {
    loadPallets();
  }, [limit, offset, search]);

  useEffect(() => {
    loadSelected(selectedId);
  }, [selectedId]);

  const handleCreatePallet = async () => {
    // Default = Unix epoch em ms
    const defaultSeq = Date.now();               // ex.: 1728234567890
    // Se quiser em segundos:
    // const defaultSeq = Math.floor(Date.now() / 1000); // ex.: 1728234567

    const input = prompt('seq_pallet (number)', String(defaultSeq));
    if (input === null) return; // cancelado

    // Se o usuário der Enter sem digitar nada, usa o default
    const seq_pallet = input.trim() === '' ? defaultSeq : Number(input);

    if (!Number.isFinite(seq_pallet)) {
      alert('seq_pallet inválido: informe um número');
      return;
    }

    try {
      const created = await createPallet({ seq_pallet });
      setSearch('');
      setOffset(0);
      await loadPallets();
      setSelectedId(created.id);
    } catch (e) {
      alert(e.message);
    }
  };


  const handleUpdatePallet = async (updates) => {
    if (!selectedId) return;
    try {
      const updated = await updatePallet(selectedId, updates);
      setSelected(updated);
      await loadPallets();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleDeletePallet = () => {
    if (!selectedId) return;
    setConfirm({
      title: 'Delete Pallet',
      message: 'This will also delete related pack rows. Continue?',
      onConfirm: async () => {
        try {
          await deletePallet(selectedId);
          setConfirm(null);
          await loadPallets();
        } catch (e) {
          alert(e.message);
        }
      }
    });
  };

  return (
    <div className="app">
      <header className="topbar">
        <img src="" alt="" />
        <h1>Pallet &amp; Pack Manager</h1>
        <DatabaseConnection />
      </header>

      <div className="content">
        <aside className="sidebar">
          <div className="toolbar">
            <input
              className="input"
              placeholder="Search by QR code..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
            />
            <button className="btn primary" onClick={handleCreatePallet}>+ New Pallet</button>
          </div>

          <PalletList
            items={pallets}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={loading}
            error={error}
            page={page}
            pageCount={pageCount}
            onPrev={() => setOffset(Math.max(0, offset - limit))}
            onNext={() => setOffset(Math.min((pageCount - 1) * limit, offset + limit))}
            onChangeLimit={(n) => { setLimit(n); setOffset(0); }}
          />
        </aside>

        <main className="main">
          <PalletDetails
            pallet={selected}
            onSave={handleUpdatePallet}
            onDelete={handleDeletePallet}
          />

          <PackList palletId={selected?.id ?? null} seqPallet={selected?.seq_pallet ?? null} />

          <PackOverview />
        </main>
      </div>

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
