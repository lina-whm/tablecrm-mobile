const API_PROXY = '/api/tablecrm';

function buildUrl(endpoint: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(`${API_PROXY}/${endpoint}`, window.location.origin);
  url.searchParams.set('token', token);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url.toString();
}

export async function fetchContragents(token: string, phone: string) {
  const url = buildUrl('contragents/meta', token, { phone });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchWarehouses(token: string) {
  const url = buildUrl('warehouses/', token);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchPayboxes(token: string) {
  const url = buildUrl('pboxes/meta', token);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchOrganizations(token: string) {
  const url = buildUrl('organizations/', token);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchPriceTypes(token: string) {
  const url = buildUrl('price_types/', token);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchNomenclature(token: string, search: string = '') {
  const params: Record<string, string> = {};
  if (search) params.name = search;
  const url = buildUrl('nomenclature/', token, params);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function createSale(token: string, payload: unknown, isPass: boolean) {
  const url = `${window.location.origin}${API_PROXY}/docs_sales/?token=${token}${isPass ? '&pass=1' : ''}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create sale');
  }
  return res.json();
}