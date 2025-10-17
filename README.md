# Pallet & Pack Manager

Aplicacao full-stack (React + Express + PostgreSQL) para cadastrar, consultar e atualizar informacoes de paletes (`pallets`) e packs (`pack`). A interface web oferece pesquisa com paginacao, edicao inline/modais e visoes dedicadas para packs orfaos (sem `seq_pallet`). A API valida entradas, aplica logs SQL detalhados e protege o banco via pool seguro de conexoes.

## Stack e estrutura
- `client/` React + Vite, CSS puro e componentes customizados.
- `server/` Express com `pg`, morgan, cors e log colorido de queries.
- `docker compose/` docker-compose.yml para subir PostgreSQL local rapidamente.
- `sql/` scripts de schema/dump para iniciar ou popular o banco.
- `node-red/` fluxo exportado (JSON) utilizado em integracoes externas.

```
root/
  client/           # interface ZIA - Pallet & Pack Overview
  server/           # API REST em Node.js
  docker compose/   # PostgreSQL 16 via Docker
  sql/              # scripts auxiliares e dumps
  node-red/         # fluxo Node-RED de apoio
```

## Pre-requisitos
- Node.js 18+ (testado com npm).
- PostgreSQL 15+ ou Docker Desktop para usar o compose incluso.
- Porta 4000 livre para a API e 5173 para o frontend (padroes Vite).

## Setup rapido em desenvolvimento
1. **Banco de dados**
   ```bash
   cd "docker compose"
   docker compose up -d
   ```
   - Usuario/senha padrao: `zegla` / `zg1982`.
   - Banco padrao: `zegla`.
   - A porta local exposta e 35432.
   - Opcional: importe `sql/pallets.sql` e `sql/pack.sql` para criar estrutura basica ou use o dump `sql/dump-zegla-*.sql`.

2. **API (backend)**
   ```bash
   cd server
   cp .env.example .env       # ajuste DATABASE_URL e CLIENT_ORIGIN
   npm install
   npm run dev                # inicia em http://localhost:4000
   ```
   - A API sobe com rota de saude em `/api/health`.
   - Variavel `DATABASE_URL` aceita string completa de conexao ou variaveis PG*.
   - Logs SQL detalhados podem ser controlados com `SQL_LOG`, `SQL_SLOW_MS` e `SQL_PARAMS`.

3. **Frontend**
   ```bash
   cd client
   npm install
   npm run dev                # http://localhost:5173
   ```
   - Configure `server/.env` com `CLIENT_ORIGIN=http://localhost:5173` para liberar CORS.
   - Em producao, utilize `npm run build` e sirva o `dist/` (Vite).

## Scripts npm uteis
- `server npm run dev` -> roda Express em modo desenvolvimento.
- `server npm start` -> modo producao (NODE_ENV=production).
- `client npm run dev` -> inicia Vite com HMR.
- `client npm run build` -> gera bundle estatico.

## Variaveis de ambiente do backend
- `DATABASE_URL` -> string de conexao PostgreSQL.
- `CLIENT_ORIGIN` -> lista separada por virgula de origens permitidas (CORS).
- `PORT` -> porta HTTP (default 4000).
- `SQL_LOG` -> `true`/`false` para habilitar logs (ativa por padrao fora de producao).
- `SQL_SLOW_MS` -> loga apenas queries iguais ou acima do tempo informado (ms).
- `SQL_PARAMS` -> `true` para registrar parametros das queries.

## Principais endpoints (prefixo /api)
- `GET /health` -> status da API e conexao com o banco.
- `GET /pallets?limit&offset&search` -> retorna `{ items, total, limit, offset }`.
- `GET /pallets/:id` -> detalha um pallet.
- `POST /pallets` -> cria novo pallet (exige `seq_pallet` unico).
- `PUT /pallets/:id` -> atualiza campos editaveis.
- `DELETE /pallets/:id` -> remove pallet e packs associados.
- `GET /pallets/:id/packs?limit&offset` -> lista packs vinculados ao pallet.
- `GET /packs/orphans?limit&offset` -> lista packs com `seq_pallet` nulo.
- `POST /pallets/:id/packs` -> cria pack vinculado ao `seq_pallet` do pallet.
- `POST /packs` -> cria pack orfao (seq_pallet nulo).
- `PUT /packs/:id` -> atualiza pack.
- `DELETE /packs/:id` -> exclui pack.

> Veja `server/src/controllers/*.js` para validacoes detalhadas, mascaras e mensagens de erro.

## Interface web (client/src)
- Lista paginada de pallets com busca por QR code e `seq_pallet`.
- Formulario completo para editar dados do pallet e remover registros.
- Tabela de packs ligados ao pallet selecionado com paginacao, edicao e delecao.
- Painel dedicado a packs orfaos (`seq_pallet = null`) com botao `+ Add Pack`.
- Cartao "Pack Overview" oferecendo indicadores agregados (total, ultimas atualizacoes).
- Badge de status da API (DatabaseConnection) que consome `/api/health`.
- Confirmacoes modais para operacoes destrutivas (delete pallet/pack).

## Dados e suporte SQL
- `sql/pallets.sql` e `sql/pack.sql` criam as tabelas base e constraints essenciais.
- O bloco abaixo adiciona constraints e indices recomendados:
  ```sql
  ALTER TABLE pallets ADD CONSTRAINT pallets_seq_pallet_unique UNIQUE (seq_pallet);
  ALTER TABLE pack
    ADD CONSTRAINT pack_seq_pallet_fk
    FOREIGN KEY (seq_pallet) REFERENCES pallets (seq_pallet)
    ON UPDATE CASCADE ON DELETE CASCADE;
  CREATE INDEX IF NOT EXISTS idx_pallets_created_at ON pallets (created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_pallets_qr_code ON pallets (qr_code);
  CREATE INDEX IF NOT EXISTS idx_pack_seq_pallet ON pack (seq_pallet);
  CREATE INDEX IF NOT EXISTS idx_pack_qr_code ON pack (qr_code);
  ```

## Fluxo Node-RED
- `node-red/dersa_nodered_2025-10-13.json` contem o fluxo exportado utilizado para integracao com CLPs/esteiras. Importe o JSON no editor Node-RED para reproduzir os fluxos de leitura/escrita.

## Resolucao de problemas rapidos
- **API nao conecta**: confirme `DATABASE_URL`, se o banco esta em `localhost:35432` (compose) e se o usuario possui permissao.
- **CORS bloqueado**: alinhe `CLIENT_ORIGIN` com a URL real do frontend (localhost, IP da rede, etc.).
- **Queries lentas**: habilite `SQL_SLOW_MS=200` (por exemplo) para identificar gargalos no log.

Pronto! Com isso o ambiente fica pronto para demos, testes locais ou integracoes com outros sistemas da Dersa/ZIA.
