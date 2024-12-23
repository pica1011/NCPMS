/*
  # Initial Schema for Warehouse Management System

  1. New Tables
    - products (商品表)
    - locations (库位表)
    - inbound_orders (入库单)
    - inbound_items (入库商品明细)
    - outbound_orders (出库单)
    - outbound_items (出库商品明细)
    - inventory_movements (库存移动记录)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sku text UNIQUE NOT NULL,
  description text,
  quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  zone text NOT NULL,
  shelf text NOT NULL,
  position text NOT NULL,
  status text NOT NULL DEFAULT 'empty',
  capacity integer NOT NULL DEFAULT 0,
  current_quantity integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('empty', 'occupied', 'reserved'))
);

-- Inbound orders table
CREATE TABLE IF NOT EXISTS inbound_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_no text UNIQUE NOT NULL,
  supplier text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  expected_arrival timestamptz NOT NULL,
  actual_arrival timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed'))
);

-- Inbound items table
CREATE TABLE IF NOT EXISTS inbound_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inbound_order_id uuid REFERENCES inbound_orders(id),
  product_id uuid REFERENCES products(id),
  location_id uuid REFERENCES locations(id),
  quantity integer NOT NULL,
  received_quantity integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Outbound orders table
CREATE TABLE IF NOT EXISTS outbound_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_no text UNIQUE NOT NULL,
  customer text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  expected_delivery timestamptz NOT NULL,
  actual_delivery timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed'))
);

-- Outbound items table
CREATE TABLE IF NOT EXISTS outbound_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outbound_order_id uuid REFERENCES outbound_orders(id),
  product_id uuid REFERENCES products(id),
  location_id uuid REFERENCES locations(id),
  quantity integer NOT NULL,
  picked_quantity integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inventory movements table
CREATE TABLE IF NOT EXISTS inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id),
  from_location_id uuid REFERENCES locations(id),
  to_location_id uuid REFERENCES locations(id),
  quantity integer NOT NULL,
  movement_type text NOT NULL,
  reference_id uuid,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT valid_movement_type CHECK (movement_type IN ('inbound', 'outbound', 'transfer'))
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbound_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to read products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read locations"
  ON locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read inbound orders"
  ON inbound_orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read outbound orders"
  ON outbound_orders FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_locations_code ON locations(code);
CREATE INDEX IF NOT EXISTS idx_inbound_reference ON inbound_orders(reference_no);
CREATE INDEX IF NOT EXISTS idx_outbound_reference ON outbound_orders(reference_no);