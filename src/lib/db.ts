import initSqlJs from 'sql.js';
import { storage } from './storage';

let db: any = null;

export const initDb = async () => {
  if (db) return db;
  
  const SQL = await initSqlJs({
    locateFile: file => `https://sql.js.org/dist/${file}`
  });
  
  // 尝试从 IndexedDB 加载数据库
  const savedDb = await storage.loadDatabase();
  
  if (savedDb) {
    db = new SQL.Database(savedDb);
  } else {
    db = new SQL.Database();
    
    // 初始化数据库表
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        description TEXT,
        quantity INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        zone TEXT NOT NULL,
        shelf TEXT NOT NULL,
        position TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'empty',
        capacity INTEGER NOT NULL DEFAULT 0,
        current_quantity INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        CHECK (status IN ('empty', 'occupied', 'reserved'))
      );

      CREATE TABLE IF NOT EXISTS inbound_orders (
        id TEXT PRIMARY KEY,
        reference_no TEXT UNIQUE NOT NULL,
        supplier TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        expected_arrival DATETIME NOT NULL,
        actual_arrival DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS inbound_items (
        id TEXT PRIMARY KEY,
        inbound_order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        location_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        received_quantity INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inbound_order_id) REFERENCES inbound_orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (location_id) REFERENCES locations(id)
      );

      CREATE TABLE IF NOT EXISTS outbound_orders (
        id TEXT PRIMARY KEY,
        reference_no TEXT UNIQUE NOT NULL,
        customer TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        expected_delivery DATETIME NOT NULL,
        actual_delivery DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS outbound_items (
        id TEXT PRIMARY KEY,
        outbound_order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        location_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        picked_quantity INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (outbound_order_id) REFERENCES outbound_orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (location_id) REFERENCES locations(id)
      );

      CREATE TABLE IF NOT EXISTS inventory_movements (
        id TEXT PRIMARY KEY,
        product_id TEXT NOT NULL,
        from_location_id TEXT,
        to_location_id TEXT,
        quantity INTEGER NOT NULL,
        movement_type TEXT NOT NULL,
        reference_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by TEXT NOT NULL,
        CHECK (movement_type IN ('inbound', 'outbound', 'transfer')),
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (from_location_id) REFERENCES locations(id),
        FOREIGN KEY (to_location_id) REFERENCES locations(id)
      );
    `);
  }

  // 设置自动保存
  setInterval(() => {
    storage.saveDatabase().catch(console.error);
  }, 30000); // 每30秒自动保存一次

  return db;
};

export const getDb = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

export const saveDb = () => {
  return storage.saveDatabase();
};

export default {
  initDb,
  getDb,
  saveDb,
};