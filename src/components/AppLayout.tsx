'use client';

import React, { useState } from 'react';
import { Layout, Menu, Typography, ConfigProvider, theme } from 'antd';
import { HomeOutlined, BarChartOutlined, HeatMapOutlined, BookOutlined, ThunderboltOutlined, HeartOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const { Sider, Content } = Layout;
const { Title } = Typography;

const antdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    fontFamily: `var(--font-geist-sans), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`,
    colorBgBase: '#121212',
    colorBgContainer: '#1c1c1c',
  },
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    {
      key: '/puls-gemini',
      icon: <HeartOutlined />,
      label: <Link href="/puls-gemini">Кардио Трекер</Link>,
    },
    {
      key: '/training-tracker',
      icon: <HomeOutlined />,
      label: <Link href="/training-tracker">Training Tracker</Link>,
    },
    {
      key: '/gym',
      icon: <ThunderboltOutlined />,
      label: <Link href="/gym">Зал (Железо)</Link>,
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: <Link href="/analytics">Аналитика Кардио</Link>,
    },
    {
      key: '/heatmap',
      icon: <HeatMapOutlined />,
      label: <Link href="/heatmap">Heatmap</Link>,
    },
    {
      key: '/wiki',
      icon: <BookOutlined />,
      label: <Link href="/wiki">Wiki & Граф</Link>,
    },
  ];

  // Определяем активный пункт меню на основе текущего пути
  const getSelectedKey = () => {
    const item = menuItems.find(item => pathname === item.key);
    return item ? [item.key] : ['/puls-gemini'];
  };

  return (
    <ConfigProvider theme={antdTheme}>
      <Layout style={{ minHeight: '100vh', backgroundColor: '#0e0e0e' }}>
        <Sider 
          collapsible 
          collapsed={sidebarCollapsed} 
          onCollapse={setSidebarCollapsed}
          theme="dark"
          style={{ 
            backgroundColor: '#1c1c1c',
            borderRight: '1px solid #363636'
          }}
        >
          <div style={{ 
            padding: '16px', 
            borderBottom: '1px solid #363636',
            textAlign: 'center'
          }}>
            <Title level={4} style={{ 
              color: '#ffffff', 
              margin: 0,
              fontSize: sidebarCollapsed ? '14px' : '16px'
            }}>
              {sidebarCollapsed ? 'P' : 'Puls'}
            </Title>
          </div>
          <Menu
            theme="dark"
            selectedKeys={getSelectedKey()}
            mode="inline"
            items={menuItems}
            style={{ 
              backgroundColor: 'transparent',
              border: 'none'
            }}
          />
        </Sider>
        
        <Layout style={{ backgroundColor: '#0e0e0e' }}>
          <Content style={{ overflow: 'auto' }}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}