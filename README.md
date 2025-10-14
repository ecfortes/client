# Pallet & Pack Manager — React + Node (Express) + PostgreSQL

A clean, minimal full‑stack CRUD interface for two related tables — **pallets** and **pack** — with pagination, inline/modal editing, validation, and safe PostgreSQL access.

**Stack**: React (JS) + Express + `pg` + pure CSS (no Tailwind).  
**Relation**: `pack.seq_pallet` → `pallets.seq_pallet` (assumed unique).

## Quickstart

```bash
# Backend
cd server
cp .env.example .env            # edit DATABASE_URL
npm i
npm run dev                     # http://localhost:4000

# Frontend (in new terminal)
cd ../client
npm i
npm run dev                     # http://localhost:5173
```

## Optional SQL (Constraints & Indexes)

```sql
ALTER TABLE pallets
  ADD CONSTRAINT pallets_seq_pallet_unique UNIQUE (seq_pallet);

ALTER TABLE pack
  ADD CONSTRAINT pack_seq_pallet_fk
  FOREIGN KEY (seq_pallet)
  REFERENCES pallets (seq_pallet)
  ON UPDATE CASCADE
  ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_pallets_created_at ON pallets (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pallets_qr_code ON pallets (qr_code);
CREATE INDEX IF NOT EXISTS idx_pack_seq_pallet ON pack (seq_pallet);
CREATE INDEX IF NOT EXISTS idx_pack_qr_code ON pack (qr_code);
```

## API Summary
- `GET /api/pallets?limit&offset&search` → `{ items, total, limit, offset }`
- `GET /api/pallets/:id` → pallet row
- `POST /api/pallets` → create pallet
- `PUT /api/pallets/:id` → update pallet
- `DELETE /api/pallets/:id` → delete pallet (+ packs)
- `GET /api/pallets/:id/packs?limit&offset` → pack list for pallet
- `POST /api/pallets/:id/packs` → create pack bound to pallet's `seq_pallet`
- `PUT /api/packs/:id` → update pack
- `DELETE /api/packs/:id` → delete pack
