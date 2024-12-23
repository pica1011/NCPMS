import db from '../db';
import { Product } from '../../types';

export const ProductModel = {
  findAll: (): Product[] => {
    return db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  },

  findById: (id: string): Product | undefined => {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  },

  create: (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Product => {
    const stmt = db.prepare(`
      INSERT INTO products (id, name, sku, description, quantity)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const id = crypto.randomUUID();
    stmt.run(id, data.name, data.sku, data.description, data.quantity);
    
    return ProductModel.findById(id)!;
  },

  update: (id: string, data: Partial<Product>): Product => {
    const sets = Object.entries(data)
      .map(([key]) => `${key} = ?`)
      .join(', ');
    
    const stmt = db.prepare(`
      UPDATE products 
      SET ${sets}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(...Object.values(data), id);
    
    return ProductModel.findById(id)!;
  },
};