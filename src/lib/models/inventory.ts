import db from '../db';

export const InventoryModel = {
  createMovement: (
    productId: string,
    fromLocationId: string | null,
    toLocationId: string | null,
    quantity: number,
    movementType: 'inbound' | 'outbound' | 'transfer',
    referenceId: string,
    userId: string
  ) => {
    db.transaction(() => {
      // 记录库存移动
      const movementStmt = db.prepare(`
        INSERT INTO inventory_movements (
          id, product_id, from_location_id, to_location_id,
          quantity, movement_type, reference_id, created_by
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      movementStmt.run(
        crypto.randomUUID(),
        productId,
        fromLocationId,
        toLocationId,
        quantity,
        movementType,
        referenceId,
        userId
      );

      // 更新产品总库存
      const productStmt = db.prepare(`
        UPDATE products 
        SET quantity = quantity + ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      const quantityChange = movementType === 'outbound' ? -quantity : quantity;
      productStmt.run(quantityChange, productId);

      // 更新库位库存
      if (fromLocationId) {
        const fromLocationStmt = db.prepare(`
          UPDATE locations 
          SET current_quantity = current_quantity - ?,
              status = CASE 
                WHEN current_quantity - ? = 0 THEN 'empty'
                ELSE status 
              END,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        fromLocationStmt.run(quantity, quantity, fromLocationId);
      }

      if (toLocationId) {
        const toLocationStmt = db.prepare(`
          UPDATE locations 
          SET current_quantity = current_quantity + ?,
              status = CASE 
                WHEN current_quantity + ? > 0 THEN 'occupied'
                ELSE status 
              END,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        toLocationStmt.run(quantity, quantity, toLocationId);
      }
    })();
  },

  getMovements: (filters: {
    productId?: string;
    locationId?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    let sql = `
      SELECT 
        m.*,
        p.name as product_name,
        p.sku as product_sku,
        fl.code as from_location_code,
        tl.code as to_location_code
      FROM inventory_movements m
      LEFT JOIN products p ON m.product_id = p.id
      LEFT JOIN locations fl ON m.from_location_id = fl.id
      LEFT JOIN locations tl ON m.to_location_id = tl.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.productId) {
      sql += ' AND m.product_id = ?';
      params.push(filters.productId);
    }
    
    if (filters.locationId) {
      sql += ' AND (m.from_location_id = ? OR m.to_location_id = ?)';
      params.push(filters.locationId, filters.locationId);
    }
    
    if (filters.startDate) {
      sql += ' AND m.created_at >= ?';
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      sql += ' AND m.created_at <= ?';
      params.push(filters.endDate);
    }
    
    sql += ' ORDER BY m.created_at DESC';
    
    return db.prepare(sql).all(...params);
  },
};