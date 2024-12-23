import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  InboxOutlined,
  ExportOutlined,
  ImportOutlined,
  DatabaseOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

const { Header, Sider, Content } = Layout;

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuthStore();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/inventory',
      icon: <DatabaseOutlined />,
      label: '库存管理',
    },
    {
      key: '/inbound',
      icon: <ImportOutlined />,
      label: '入库管理',
    },
    {
      key: '/outbound',
      icon: <ExportOutlined />,
      label: '出库管理',
    },
    {
      key: '/locations',
      icon: <InboxOutlined />,
      label: '库位管理',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: '#fff' }}>
          <Menu mode="horizontal" style={{ justifyContent: 'flex-end' }}>
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={signOut}>
              退出登录
            </Menu.Item>
          </Menu>
        </Header>
        <Content style={{ margin: '16px' }}>
          <div style={{ padding: 24, minHeight: 360, background: '#fff' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;