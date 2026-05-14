export interface Product {
  id: number;
  name: string;
  article?: string;
  unit?: string;
  price?: number;
}

export interface CartItem extends Product {
  quantity: number;
  price: number;
}

export interface Client {
  id: number;
  name: string;
  phone: string;
}

export interface Organization {
  id: number;
  name: string;
  inn?: string;
}

export interface Warehouse {
  id: number;
  name: string;
}

export interface Account {
  id: number;
  name: string;
}

export interface PriceType {
  id: number;
  name: string;
}

export interface OrderPayload {
  contragent_id?: number;
  contragent_name?: string;
  contragent_phone: string;
  organization_id: number;
  warehouse_id: number;
  pbox_id: number;
  price_type_id: number;
  items: {
    nomenclature_id: number;
    nomenclature_name: string;
    quantity: number;
    price: number;
    sum: number;
  }[];
  is_passed?: boolean;
  comment?: string;
}