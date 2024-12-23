import db from '../db';
import { Inbound } from '../../types';

export const InboundModel = {
  findAll: (): Inbound[] => {
    return db.prepare(`
      SELECT i.*, 
        json_group_array(
          json_object(
            'product_id', ii.product_id,
            'quantity', ii.quantity,
            'received_quantity', ii.received_quantity,
            'location_id', ii.location_id
          )
        ) as products
      FROM inbound_orders i
      LEFT JOIN inbound_items ii ON i.id = ii.inbound_order_id
      GROUP BY i.id
      ORDER BY i.created_at DESC
    `).all();
  },

  findById: (id: string): Inbound | undefined => {
    return db.prepare(`
      SELECT i.*, 
        json_group_array(
          json_object(
            'product_id', ii.product_id,
            'quantity', ii.quantity,
            'received_quantity', ii.received_quantity,
            'location_id', ii.location_id
          )
        ) as products
      FROM inbound_orders i
      LEFT JOIN inbound_items ii ON i.id = ii.inbound_order_id
      WHERE i.id = ?
      GROUP BY i.id
    `).get(id);
  },

  create: (data: Omit<Inbound, 'id' | 'created_at'>, userId: string): Inbound => {
    const id = crypto.randomUUID();
    
    db.transaction(() => {
      const orderStmt = db.prepare(`
        INSERT INTO inbound_orders (
          id, reference_no, supplier, status, 
          expected_arrival, created_by
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      orderStmt.run(
        id,
        data.reference_no,
        data.supplier,
        data.status,
        data.expected_arrival,
        userId
      );

      const itemStmt = db.prepare(`
        INSERT INTO inbound_items (
          id, inbound_order_id, product_id, 
          location_id, quantity
        )
        VALUES (?, ?, ?, ?, ?)
      `);

      for (const product of data.products) {
        itemStmt.run(
          crypto.randomUUID(),
          id,
          product.product_id,
          product.location_id,
          product.quantity
        );
      }
    })();

    return InboundModel.findById(id)!;
  },

  updateStatus: (id: string, status: string, actualArrival?: string): Inbound => {
    const stmt = db.prepare(`
      UPDATE inbound_orders 
      SET status = ?, 
          actual_arrival = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(status, actualArrival, id);
    
    return InboundModel.findById(id)!;
  },
};