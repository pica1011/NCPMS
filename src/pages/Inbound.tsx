import React, { useState } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, DatePicker, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useInbound } from '../hooks/useInbound';
import { useProducts } from '../hooks/useProducts';
import { useLocations } from '../hooks/useLocations';

const Inbound: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { inboundOrders, loading, createInbound } = useInbound();
  const { products } = useProducts();
  const { locations } = useLocations();
  const [form] = Form.useForm();

  const columns = [
    { title: '入库单号', dataIndex: 'reference_no', key: 'reference_no' },
    { title: '供应商', dataIndex: 'supplier', key: 'supplier' },
    { title: '状态', dataIndex: 'status', key: 'status' },
    { title: '预计到货', dataIndex: 'expected_arrival', key: 'expected_arrival' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="link">查看详情</Button>
          <Button type="link">处理收货</Button>
        </Space>
      ),
    },
  ];

  const handleAdd = async (values: any) => {
    await createInbound(values);
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <Card
      title="入库管理"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          新建入库单
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={inboundOrders}
        loading={loading}
        rowKey="id"
      />

      <Modal
        title="新建入库单"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item name="reference_no" label="入库单号" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="supplier" label="供应商" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="expected_arrival" label="预计到货时间" rules={[{ required: true }]}>
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

export default Inbound;