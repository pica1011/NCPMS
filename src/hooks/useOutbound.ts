import { useState, useEffect } from 'react';
import { OutboundModel } from '../lib/models/outbound';
import { Outbound } from '../types';

export const useOutbound = () => {
  const [outboundOrders, setOutboundOrders] = useState<Outbound[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOutboundOrders = async () => {
    try {
      const data = await OutboundModel.findAll();
      setOutboundOrders(data);
    } catch (error) {
      console.error('Failed to fetch outbound orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const createOutbound = async (outbound: Omit<Outbound, 'id' | 'created_at'>) => {
    try {
      const newOutbound = await OutboundModel.create(outbound);
      setOutboundOrders([...outboundOrders, newOutbound]);
      return newOutbound;
    } catch (error) {
      console.error('Failed to create outbound order:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchOutboundOrders();
  }, []);

  return { outboundOrders, loading, createOutbound, refreshOutboundOrders: fetchOutboundOrders };
};