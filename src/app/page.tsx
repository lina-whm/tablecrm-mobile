"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  fetchContragents,
  fetchWarehouses,
  fetchPayboxes,
  fetchOrganizations,
  fetchPriceTypes,
  fetchNomenclature,
  createSale,
} from "@/lib/api";

interface Product {
  id: number;
  name: string;
  price?: number;
}

interface CartItem extends Product {
  quantity: number;
  price: number;
}

interface Client {
  id: number;
  name: string;
  phone: string;
}

export default function Home() {
  const [token, setToken] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const [phone, setPhone] = useState("");
  const [client, setClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchingClient, setSearchingClient] = useState(false);

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [priceTypes, setPriceTypes] = useState<any[]>([]);

  const [orgId, setOrgId] = useState<number | null>(null);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [priceTypeId, setPriceTypeId] = useState<number | null>(null);

  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [comment, setComment] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const toArray = (data: any) => Array.isArray(data) ? data : (data?.results || []);

  const connect = async () => {
    if (!token.trim()) return;
    setLoading(true);
    setError("");
    try {
      const [orgs, wares, accs, types] = await Promise.all([
        fetchOrganizations(token),
        fetchWarehouses(token),
        fetchPayboxes(token),
        fetchPriceTypes(token),
      ]);
      setOrganizations(toArray(orgs));
      setWarehouses(toArray(wares));
      setAccounts(toArray(accs));
      setPriceTypes(toArray(types));
      setConnected(true);
    } catch (e) {
      setError("Ошибка: " + (e instanceof Error ? e.message : "Проверьте токен"));
    } finally {
      setLoading(false);
    }
  };

  const searchClient = async () => {
    if (!phone.trim()) return;
    setSearchingClient(true);
    try {
      const data = await fetchContragents(token, phone);
      const found = toArray(data);
      setClients(found);
      if (found.length === 1) setClient(found[0]);
      else if (found.length === 0) setClient(null);
    } catch {
      setClient(null);
    } finally {
      setSearchingClient(false);
    }
  };

  const selectClient = (c: Client) => {
    setClient(c);
    setClients([]);
    setPhone(c.phone);
  };

  const searchProducts = useCallback(async () => {
    if (!productSearch.trim()) return;
    try {
      const data = await fetchNomenclature(token, productSearch);
      setProducts(toArray(data));
    } catch {
      setProducts([]);
    }
  }, [token, productSearch]);

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(cart.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, price: product.price || 0 }]);
    }
    setProducts([]);
    setProductSearch("");
  };

  const updateQuantity = (id: number, qty: number) => {
    if (qty <= 0) {
      setCart(cart.filter((item) => item.id !== id));
    } else {
      setCart(cart.map((item) =>
        item.id === id ? { ...item, quantity: qty } : item
      ));
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCreateSale = async (isPass: boolean) => {
    if (!orgId || !warehouseId || !accountId) {
      setError("Заполните обязательные поля");
      return;
    }
    if (cart.length === 0) {
      setError("Добавьте хотя бы один товар");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const payload = [{
      priority: 0,
      dated: Math.floor(Date.now() / 1000),
      operation: "Заказ",
      tax_included: true,
      tax_active: true,
      goods: cart.map((item) => ({
        price: item.price,
        quantity: item.quantity,
        unit: 116,
        discount: 0,
        sum_discounted: 0,
        nomenclature: item.id,
      })),
      settings: {},
      warehouse: warehouseId,
      contragent: client?.id || null,
      paybox: accountId,
      organization: orgId,
      status: !isPass,
      paid_rubles: total,
      paid_lt: 0,
      comment,
    }];

    try {
      await createSale(token, payload, isPass);
      setSuccess(isPass ? "Продажа создана и проведена!" : "Продажа создана!");
      setCart([]);
      setComment("");
      setClient(null);
      setPhone("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка создания продажи");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-white border-b p-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-xl font-bold text-center">TableCRM Mobile Order</h1>
          <p className="text-center text-gray-500 text-sm">tablecrm.com</p>
        </div>
      </header>

      <main className="flex-1 pb-24">
        <div className="max-w-md mx-auto p-4 space-y-4">
          <div className="text-center text-sm text-gray-600 mb-2">
            <span className={connected ? "text-green-600" : "text-red-500"}>
              {connected ? "Касса подключена" : "Касса не подключена"}
            </span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">1. Подключение кассы</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-500">Введите токен и загрузите справочники</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={connected}
                  className="flex-1"
                />
                {!connected && (
                  <Button onClick={connect} disabled={loading || !token.trim()}>
                    {loading ? "..." : "Подключить"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">2. Клиент</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-500">Поиск клиента по телефону</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Телефон"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setClient(null); }}
                  className="flex-1"
                />
                <Button variant="outline" onClick={searchClient} disabled={searchingClient}>
                  {searchingClient ? "..." : "Найти"}
                </Button>
              </div>
              {clients.length > 0 && (
                <div className="border rounded-lg p-2 space-y-2">
                  {clients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => selectClient(c)}
                      className="w-full text-left p-2 hover:bg-gray-100 rounded"
                    >
                      <div className="font-medium">{c.name}</div>
                      <div className="text-sm text-gray-500">{c.phone}</div>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                <span className="text-gray-500">Клиент не выбран</span>
                {client && <Badge>{client.name}</Badge>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">3. Параметры продажи</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-500">Счёт, организация, склад и тип цены</p>
              <div>
                <Label className="text-sm">Организация</Label>
                <select
                  className="w-full border rounded-md p-2 mt-1 bg-white"
                  value={orgId ?? ""}
                  onChange={(e) => setOrgId(Number(e.target.value) || null)}
                >
                  <option value="">Выберите организацию ▼</option>
                  {organizations.map((o) => (
                    <option key={o.id} value={o.id}>{o.name || o.short_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm">Счёт</Label>
                <select
                  className="w-full border rounded-md p-2 mt-1 bg-white"
                  value={accountId ?? ""}
                  onChange={(e) => setAccountId(Number(e.target.value) || null)}
                >
                  <option value="">Выберите счёт ▼</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm">Склад</Label>
                <select
                  className="w-full border rounded-md p-2 mt-1 bg-white"
                  value={warehouseId ?? ""}
                  onChange={(e) => setWarehouseId(Number(e.target.value) || null)}
                >
                  <option value="">Выберите склад ▼</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-sm">Тип цены</Label>
                <select
                  className="w-full border rounded-md p-2 mt-1 bg-white"
                  value={priceTypeId ?? ""}
                  onChange={(e) => setPriceTypeId(Number(e.target.value) || null)}
                >
                  <option value="">Выберите тип цены ▼</option>
                  {priceTypes.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">4. Товары</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-500">Поиск и добавление номенклатуры</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Поиск товара..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchProducts()}
                  className="flex-1"
                />
                <Button variant="outline" onClick={searchProducts}>Найти</Button>
              </div>
              {productSearch && products.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">Товары не найдены</p>
              )}
              {products.length > 0 && (
                <div className="border rounded-lg p-2 space-y-2 max-h-48 overflow-y-auto">
                  {products.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addToCart(p)}
                      className="w-full text-left p-2 hover:bg-gray-100 rounded flex justify-between"
                    >
                      <span>{p.name}</span>
                      {p.price && <span className="text-gray-500">{p.price} ₽</span>}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Корзина</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-500">Количество, цена и сумма по позициям</p>
              {cart.length === 0 ? (
                <p className="text-center text-gray-400 py-4">Добавьте хотя бы один товар</p>
              ) : (
                <>
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-gray-500 text-sm">{item.price.toFixed(2)} ₽ × {item.quantity}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</Button>
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div>
                    <Label className="text-sm">Комментарий</Label>
                    <Input
                      placeholder="Комментарий"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500">Итого</span>
                    <span className="font-bold text-lg">{total.toFixed(2)} ₽</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-100 border border-green-300 rounded text-green-700 text-sm text-center">
              {success}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t p-4 text-center text-sm text-gray-500">
        <a href="https://tablecrm.com" className="hover:underline">tablecrm.com</a>
      </footer>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-2">
        <Button
          className="flex-1"
          variant="outline"
          onClick={() => handleCreateSale(false)}
          disabled={loading || cart.length === 0 || !connected}
        >
          Создать продажу
        </Button>
        <Button
          className="flex-1"
          onClick={() => handleCreateSale(true)}
          disabled={loading || cart.length === 0 || !connected}
        >
          {loading ? "..." : "Создать и провести"}
        </Button>
      </div>
    </div>
  );
}