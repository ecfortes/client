// URL base da API vem das variaveis do Vite, com fallback para localhost em dev
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

console.log('[api] Usando API_BASE:', API_BASE);

// Wrapper que centraliza chamadas fetch, serializa JSON e lanca erros de resposta
async function http(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || 'Request failed';
    throw new Error(msg);
  }
  return data;
}

// Pallets
// Lista pallets com filtros opcionais via query string
export const listPallets = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return http(`/api/pallets${q ? `?${q}` : ''}`);
};
// Busca detalhes de um pallet especifico
export const getPallet = (id) => http(`/api/pallets/${id}`);
// Cria um novo pallet
export const createPallet = (payload) => http('/api/pallets', { method: 'POST', body: payload });
// Atualiza um pallet existente
export const updatePallet = (id, payload) => http(`/api/pallets/${id}`, { method: 'PUT', body: payload });
// Exclui um pallet pelo identificador
export const deletePallet = (id) => http(`/api/pallets/${id}`, { method: 'DELETE' });

// Packs
// Lista packs vinculados a um pallet, preservando filtros
export const listPacks = (palletId, params = {}) => {
  const q = new URLSearchParams(params).toString();
  return http(`/api/pallets/${palletId}/packs${q ? `?${q}` : ''}`);
};
// Cria um pack dentro do pallet informado
export const createPack = (palletId, payload) => http(`/api/pallets/${palletId}/packs`, { method: 'POST', body: payload });
// Atualiza atributos de um pack
export const updatePack = (id, payload) => http(`/api/packs/${id}`, { method: 'PUT', body: payload });
// Remove um pack definitivamente
export const deletePack = (id) => http(`/api/packs/${id}`, { method: 'DELETE' });
// Cria um pack sem vinculo de pallet (seq_pallet = null)
export const createOrphanPack = (payload) => http('/api/packs/orphans', { method: 'POST', body: payload });
// Lista overview agregado de packs com suporte a busca e paginacao
export const listPackOverview = ({ limit = 20, offset = 0, search = '' } = {}) => {
  const params = new URLSearchParams();
  params.set('limit', String(limit));
  params.set('offset', String(offset));
  if (search) params.set('search', search);

  const query = params.toString();
  return http(`/api/packs/overview?${query}`);
};

// Ja existiam: listPacks, createPack, deletePack ...
// Adicione esta funcao:
// Usa sempre o helper http() (que ja preenche API_BASE, verbo, headers, etc.)
export async function listOrphanPacks({ limit = 20, offset = 0 } = {}) {
  // Monta parametros de paginacao para o endpoint de packs orfaos
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const path = `/api/packs/orphans?${params.toString()}`;

  // Log util para depurar qual recurso esta sendo chamado
  console.log('[listOrphanPacks] GET', `${API_BASE}${path}`);

  const data = await http(path); // <= agora passa pelo helper (usa API_BASE)

  // Normaliza {items,total} ou array puro (aceita variacoes comuns do backend)
  const items =
    Array.isArray(data?.items) ? data.items :
      Array.isArray(data?.rows) ? data.rows :
        Array.isArray(data) ? data : [];

  const total =
    Number.isFinite(data?.total) ? data.total :
      Number.isFinite(data?.count) ? data.count :
        items.length;

  return { items, total };
}

// Health
// Faz um ping no endpoint de saude para confirmar disponibilidade
export const checkHealth = () => http('/api/health');
