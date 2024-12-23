import { useState, useEffect } from 'react';
import { ProductModel } from '../lib/models/product';
import { LocationModel } from '../lib/models/location';
import { InboundModel } from '../lib/models/inbound';
import { OutboundModel } from '../lib/models/outbound';

export const useInventoryStats = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    pendingInbound: 0,
    pendingOutbound: 0,
    locationUsage: 0,
  });
  const [movements, setMovements] = useState([]);

  const fetchStats = async () => {
    try {
      const products = await ProductModel.findAll();
      const locations = await LocationModel.findAll();
      const inboundOrders = await InboundModel.findAll();
      const outboundOrders = await OutboundModel.findAll();

      const totalLocations = locations.length;
      const occupiedLocations = locations.filter(l => l.status !== 'empty').length;

      setStats({
        totalProducts: products.reduce((sum, p) => sum + p.quantity, 0),
        pendingInbound: inboundOrders.filter(o => o.status === 'pending').length,
        pendingOutbound: outboundOrders.filter(o => o.status === 'pending').length,
        locationUsage: totalLocations ? (occupiedLocations / totalLocations) * 100 : 0,
      });
    } catch (error) {
      console.error('Failed to fetch inventory stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    // 这里可以添加定时刷新统计数据的逻辑
    const interval = setInterval(fetchStats, 60000); // 每分钟刷新一次
    return () => clearInterval(interval);
  }, []);

  return { stats, movements };
};