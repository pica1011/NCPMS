import React, { useState } from 'react';
import { Table, Card, Button, Input, Space, Modal, Form, InputNumber } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useProducts } from '../hooks/useProducts';

const Inventory: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { products, loading, addProduct } = useProducts();
  const [form] = Form.useForm();

  const columns = [
    { title: 'SKU', dataIndex: 'sku', key: 'sku' },
    { title: '商品名称', dataIndex: 'name', key: 'name' },
    { title: '库存数量', dataIndex: 'quantity', key: 'quantity' },
    { title: '库位', dataIndex: 'location', key: 'location' },
  ];

  const handleAdd = async (values: any) => {
    await addProduct(values);
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <Card
      title="库存管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          新增商品
        </Button>
      }
    >
      <Space style={{ marginBottom: 16 }}>
        <Input placeholder="搜索商品" prefix={<SearchOutlined />} />
      </Space>
      
      <Table
        columns={columns}
        dataSource={products}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title="新增商品"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAdd}>
          <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="quantity" label="初始库存" rules={[{ required: true }]}>
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

export default Inventory;