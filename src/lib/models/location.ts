import db from '../db';
import { Location } from '../../types';

export const LocationModel = {
  findAll: (): Location[] => {
    return db.prepare('SELECT * FROM locations ORDER BY zone, shelf, position').all();
  },

  findById: (id: string): Location | undefined => {
    return db.prepare('SELECT * FROM locations WHERE id = ?').get(id);
  },

  create: (data: Omit<Location, 'id' | 'created_at' | 'updated_at'>): Location => {
    const stmt = db.prepare(`
      INSERT INTO locations (id, code, zone, shelf, position, status, capacity, current_quantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const id = crypto.randomUUID();
    stmt.run(
      id,
      data.code,
      data.zone,
      data.shelf,
      data.position,
      data.status,
      data.capacity,
      data.current_quantity
    );
    
    return LocationModel.findById(id)!;
  },

  update: (id: string, data: Partial<Location>): Location => {
    const sets = Object.entries(data)
      .map(([key]) => `${key} = ?`)
      .join(', ');
    
    const stmt = db.prepare(`
      UPDATE locations 
      SET ${sets}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(...Object.values(data), id);
    
    return LocationModel.findById(id)!;
  },
};