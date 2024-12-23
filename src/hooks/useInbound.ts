import { useState, useEffect } from 'react';
import { executeQuery, executeWrite } from '../lib/models/base';
import { Inbound } from '../types';

export const useInbound = () => {
  const [inboundOrders, setInboundOrders] = useState<Inbound[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInboundOrders = async () => {
    try {
      const data = executeQuery(`
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
      `);
      setInboundOrders(data);
    } catch (error) {
      console.error('Failed to fetch inbound orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInbound = async (inbound: Omit<Inbound, 'id' | 'created_at'>&{created_by: string}) => {
    try {
      const id = crypto.randomUUID();
      
      await executeWrite(`
        INSERT INTO inbound_orders (
          id, reference_no, supplier, status, 
          expected_arrival, created_by
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        id,
        inbound.reference_no,
        inbound.supplier,
        inbound.status,
        inbound.expected_arrival,
        inbound.created_by
      ]);

      for (const product of inbound.products) {
        await executeWrite(`
          INSERT INTO inbound_items (
            id, inbound_order_id, product_id, 
            location_id, quantity
          )
          VALUES (?, ?, ?, ?, ?)
        `, [
          crypto.randomUUID(),
          id,
          product.product_id,
          product.location_id,
          product.quantity
        ]);
      }

      const newInbound = executeQuery(
        'SELECT * FROM inbound_orders WHERE id = ?',
        [id]
      )[0] as Inbound;
      
      setInboundOrders([...inboundOrders, newInbound]);
      return newInbound;
    } catch (error) {
      console.error('Failed to create inbound order:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchInboundOrders();
  }, []);

  return { 
    inboundOrders, 
    loading, 
    createInbound, 
    refreshInboundOrders: fetchInboundOrders 
  };
};