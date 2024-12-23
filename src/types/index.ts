// 商品类型
export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  quantity: number;
  location: string;
  created_at: string;
  updated_at: string;
}

// 库位类型
export interface Location {
  id: string;
  code: string;
  zone: string;
  shelf: string;
  position: string;
  status: 'empty' | 'occupied' | 'reserved';
  capacity: number;
  current_quantity: number;
}

// 入库单类型
export interface Inbound {
  id: string;
  reference_no: string;
  supplier: string;
  status: 'pending' | 'processing' | 'completed';
  expected_arrival: string;
  actual_arrival?: string;
  products: InboundProduct[];
  created_at: string;
}

// 入库商品类型
export interface InboundProduct {
  product_id: string;
  quantity: number;
  received_quantity?: number;
  location_id: string;
}

// 出库单类型
export interface Outbound {
  id: string;
  reference_no: string;
  customer: string;
  status: 'pending' | 'processing' | 'completed';
  expected_delivery: string;
  actual_delivery?: string;
  products: OutboundProduct[];
  created_at: string;
}

// 出库商品类型
export interface OutboundProduct {
  product_id: string;
  quantity: number;
  picked_quantity?: number;
  location_id: string;
}