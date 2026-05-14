const API_BASE = 'https://app.tablecrm.com/api/v1';

interface Product {
  id: number;
  name: string;
}

interface Organization {
  id: number;
  name: string;
}

interface Warehouse {
  id: number;
  name: string;
}

interface Account {
  id: number;
  name: string;
}

interface PriceType {
  id: number;
  name: string;
}

export async function fetchContragents(token: string, phone: string) {
  const res = await fetch(`${API_BASE}/contragents/meta?token=${token}&phone=${encodeURIComponent(phone)}`);
  if (!res.ok) throw new Error('Failed to fetch contragents');
  return res.json();
}

type ApiResponse<T> = {
  results?: T[];
};

export async function fetchWarehouses(token: string) {
  const res = await fetch(`${API_BASE}/warehouses/?token=${token}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchPayboxes(token: string) {
  const res = await fetch(`${API_BASE}/pboxes/meta?token=${token}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchPriceTypes(token: string) {
  const res = await fetch(`${API_BASE}/price_types/?token=${token}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchNomenclature(token: string, search: string = '') {
  const params = new URLSearchParams({ token });
  if (search) params.append('name', search);
  const res = await fetch(`${API_BASE}/nomenclature/?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchPayboxes(token: string) {
  const res = await fetch(`${API_BASE}/pboxes/meta?token=${token}`);
  if (!res.ok) throw new Error('Failed to fetch payboxes');
  return res.json() as Promise<ApiResponse<Account>>;
}

export async function fetchOrganizations(token: string) {
  const res = await fetch(`${API_BASE}/organizations/?token=${token}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchPriceTypes(token: string) {
  const res = await fetch(`${API_BASE}/price_types/?token=${token}`);
  if (!res.ok) throw new Error('Failed to fetch price types');
  return res.json() as Promise<ApiResponse<PriceType>>;
}

export async function fetchNomenclature(token: string, search: string = '') {
  const params = new URLSearchParams({ token });
  if (search) params.append('name', search);
  const res = await fetch(`${API_BASE}/nomenclature/?${params}`);
  if (!res.ok) throw new Error('Failed to fetch nomenclature');
  return res.json() as Promise<ApiResponse<Product>>;
}

export async function createSale(token: string, payload: unknown, isPass: boolean) {
  const url = `${API_BASE}/docs_sales/?token=${token}${isPass ? '&pass=1' : ''}`;
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