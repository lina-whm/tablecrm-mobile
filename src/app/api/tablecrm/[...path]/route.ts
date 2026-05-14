import { NextResponse } from 'next/server';

const API_BASE = 'https://app.tablecrm.com/api/v1';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const token = searchParams.get('token');

  if (!endpoint || !token) {
    return NextResponse.json({ error: 'Missing endpoint or token' }, { status: 400 });
  }

  let apiUrl = `${API_BASE}/${endpoint}?token=${token}`;
  const extraParams = ['name', 'phone'].filter(p => searchParams.has(p));
  extraParams.forEach(p => {
    apiUrl += `&${p}=${encodeURIComponent(searchParams.get(p) || '')}`;
  });

  try {
    const res = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Request failed' }));
      return NextResponse.json(err, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || 'docs_sales/';
  const token = searchParams.get('token');
  const pass = searchParams.get('pass');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const url = `${API_BASE}/${endpoint}?token=${token}${pass === '1' ? '&pass=1' : ''}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Request failed' }));
      return NextResponse.json(err, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}