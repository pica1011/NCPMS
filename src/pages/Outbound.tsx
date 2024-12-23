import React, { useState } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, DatePicker, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useOutbound } from '../hooks/useOutbound';
import { useProducts } from '../hooks/useProducts';
import { useLocations } from '../hooks/useLocations';

const Outbound: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { outboundOrders, loading, createOutbound } = useOutbound();
  const { products } = useProducts();
  const { locations } = useLocations();
  const [form] = Form.useForm();

  const columns = [
    { title: '出库单号', dataIndex: 'reference_no', key: 'reference_no' },
    { title: '客户', dataIndex: 'customer', key: 'customer' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '预计发货', dataIndex: 'expected_delivery', key: 'expected_delivery' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link">查看详情</Button>
          <Button type="link">处理发货</Button>
        </Space>
      ),
    },
  ];

  const handleAdd = async (values: any) => {
    await createOutbound(values);
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <Card
      title="出库管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          新建出库单
        </Button>
      }
    >
      <Table columns={columns} dataSource={outboundOrders} loading={loading} rowKey="id" />

      <Modal
        title="新建出库单"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item name="reference_no" label="出库单号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="customer" label="客户" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="expected_delivery" label="预计发货时间" rules={[{ required: true }]}>
            <DatePicker showTime />
          </Form.Item>
          <Form.List name="products">
            {(fields, { add, remove }) => (
              <>
                {fields.map(field => (
                  <Space key={field.key} align="baseline">
                    <Form.Item
                      {...field}
                      label="商品"
                      name={[field.name, 'product_id']}
                      rules={[{ required: true }]}
                    >
                      <Select style={{ width: 200 }}>
                        {products.map(p => (
                          <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label="数量"
                      name={[field.name, 'quantity']}
                      rules={[{ required: true }]}
                    >
                      <Input type="number" style={{ width: 100 }} />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label="库位"
                      name={[field.name, 'location_id']}
                      rules={[{ required: true }]}
                    >
                      <Select style={{ width: 150 }}>
                        {locations.map(l => (
                          <Select.Option key={l.id} value={l.id}>{l.code}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Button onClick={() => remove(field.name)}>删除</Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block>
                    添加商品
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
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

export default Outbound;