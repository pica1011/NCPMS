import React, { useState } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, InputNumber, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useLocations } from '../hooks/useLocations';

const Locations: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { locations, loading, addLocation } = useLocations();
  const [form] = Form.useForm();

  const columns = [
    { title: '库位编码', dataIndex: 'code', key: 'code' },
    { title: '区域', dataIndex: 'zone', key: 'zone' },
    { title: '货架', dataIndex: 'shelf', key: 'shelf' },
    { title: '位置', dataIndex: 'position', key: 'position' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '容量', dataIndex: 'capacity', key: 'capacity' },
    { title: '当前数量', dataIndex: 'current_quantity', key: 'current_quantity' },
  ];

  const handleAdd = async (values: any) => {
    await addLocation(values);
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <Card
      title="库位管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          新增库位
        </Button>
      }
    >
      <Table columns={columns} dataSource={locations} loading={loading} rowKey="id" />

      <Modal
        title="新增库位"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item name="code" label="库位编码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="zone" label="区域" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="shelf" label="货架" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="position" label="位置" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="empty">空闲</Select.Option>
              <Select.Option value="occupied">已占用</Select.Option>
              <Select.Option value="reserved">已预留</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="capacity" label="容量" rules={[{ required: true }]}>
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              确定
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Locations;