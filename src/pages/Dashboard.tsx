import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useInventoryStats } from '../hooks/useInventoryStats';

const Dashboard: React.FC = () => {
  const { stats, movements } = useInventoryStats();

  return (
    <div>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="总库存商品" value={stats.totalProducts} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待处理入库单" value={stats.pendingInbound} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="待处理出库单" value={stats.pendingOutbound} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="库位使用率" value={stats.locationUsage} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Card title="库存变动趋势" style={{ marginTop: 16 }}>
        <LineChart width={800} height={400} data={movements}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="inbound" stroke="#8884d8" name="入库数量" />
          <Line type="monotone" dataKey="outbound" stroke="#82ca9d" name="出库数量" />
        </LineChart>
      </Card>
    </div>
  );
};

export default Dashboard;