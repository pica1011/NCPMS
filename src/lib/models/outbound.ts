import db from '../db';
import { Outbound, OutboundProduct } from '../../types';

export const OutboundModel = {
  findAll: (): Outbound[] => {
    return db.prepare(`
      SELECT o.*, 
        json_group_array(
          json_object(
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'picked_quantity', oi.picked_quantity,
            'location_id', oi.location_id
          )
        ) as products
      FROM outbound_orders o
      LEFT JOIN outbound_items oi ON o.id = oi.outbound_order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `).all();
  },

  findById: (id: string): Outbound | undefined => {
    return db.prepare(`
      SELECT o.*, 
        json_group_array(
          json_object(
            'product_id', oi.product_id,
            'quantity', oi.quantity,
            'picked_quantity', oi.picked_quantity,
            'location_id', oi.location_id
          )
        ) as products
      FROM outbound_orders o
      LEFT JOIN outbound_items oi ON o.id = oi.outbound_order_id
      WHERE o.id = ?
      GROUP BY o.id
    `).get(id);
  },

  create: (data: Omit<Outbound, 'id' | 'created_at'>, userId: string): Outbound => {
    const id = crypto.randomUUID();
    
    db.transaction(() => {
      const orderStmt = db.prepare(`
        INSERT INTO outbound_orders (
          id, reference_no, customer, status, 
          expected_delivery, created_by
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      orderStmt.run(
        id,
        data.reference_no,
        data.customer,
        data.status,
        data.expected_delivery,
        userId
      );

      const itemStmt = db.prepare(`
        INSERT INTO outbound_items (
          id, outbound_order_id, product_id, 
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

    return OutboundModel.findById(id)!;
  },

  updateStatus: (id: string, status: string, actualDelivery?: string): Outbound => {
    const stmt = db.prepare(`
      UPDATE outbound_orders 
      SET status = ?, 
          actual_delivery = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(status, actualDelivery, id);
    
    return OutboundModel.findById(id)!;
  },
};