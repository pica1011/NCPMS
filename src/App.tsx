import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Inbound from './pages/Inbound';
import Outbound from './pages/Outbound';
import Locations from './pages/Locations';
import { useAuthStore } from './stores/useAuthStore';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inbound" element={<Inbound />} />
            <Route path="outbound" element={<Outbound />} />
            <Route path="locations" element={<Locations />} />
          </Route>
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;