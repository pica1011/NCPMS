import React from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import styles from './Login.module.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuthStore();

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      await signIn(values.email, values.password);
      navigate('/');
    } catch (error) {
      message.error('登录失败，请检查用户名和密码');
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.loginCard} title="仓储管理系统">
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;