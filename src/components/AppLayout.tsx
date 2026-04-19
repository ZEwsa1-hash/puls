'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Menu, Typography, ConfigProvider, theme, type MenuProps } from 'antd';
import {
  BarChartOutlined,
  CalendarOutlined,
  HomeOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const { Sider, Content } = Layout;
const { Title } = Typography;

const antdTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    fontFamily: `var(--font-geist-sans), "Aptos", "Segoe UI", sans-serif`,
    colorBgBase: '#101110',
    colorBgContainer: '#191b18',
    colorPrimary: '#d7ff45',
    colorInfo: '#35c3ff',
    colorSuccess: '#41d37e',
    colorWarning: '#ffb84d',
    colorError: '#ff5f57',
    colorTextBase: '#f4f1e8',
    colorBorder: '#34382f',
    borderRadius: 8,
  },
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    router.push(String(key));
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 800px)');
    const syncMobileState = () => setIsMobile(mediaQuery.matches);

    syncMobileState();
    mediaQuery.addEventListener('change', syncMobileState);

    return () => mediaQuery.removeEventListener('change', syncMobileState);
  }, []);

  const menuItems = [
    {
      key: '/',
      icon: <CalendarOutlined />,
      label: <Link href="/" aria-label="Сегодня">Сегодня</Link>,
    },
    {
      key: '/training-tracker',
      icon: <HomeOutlined />,
      label: <Link href="/training-tracker" aria-label="План">План</Link>,
    },
    {
      key: '/gym',
      icon: <ThunderboltOutlined />,
      label: <Link href="/gym" aria-label="Gym">Gym</Link>,
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: <Link href="/analytics" aria-label="Аналитика">Аналитика</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link href="/settings" aria-label="Настройки">Настройки</Link>,
    },
  ];

  const selectedKey = menuItems.find((item) => pathname === item.key)?.key ?? '/';

  return (
    <ConfigProvider theme={antdTheme}>
      <Layout
        className="app-shell"
        style={isMobile ? {
          flexDirection: 'column',
          width: '100%',
          maxWidth: '100vw',
          minHeight: '100dvh',
          overflowX: 'hidden',
        } : undefined}
      >
        <Sider
          collapsible={!isMobile}
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
          theme="dark"
          width={248}
          className="app-sidebar"
          style={isMobile ? {
            flex: 'none',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            height: 76,
          } : undefined}
        >
          <div className="app-brand">
            <Title level={4} className="app-brand__title">
              Puls
            </Title>
            {!sidebarCollapsed && <span className="app-brand__status">training OS</span>}
          </div>

          <Menu
            theme="dark"
            selectedKeys={[selectedKey]}
            mode="inline"
            items={menuItems}
            className="app-menu"
            onClick={handleMenuClick}
          />
        </Sider>

        <Layout
          className="app-main"
          style={isMobile ? {
            display: 'block',
            flex: '1 1 auto',
            width: '100%',
            maxWidth: '100vw',
            minWidth: 0,
          } : undefined}
        >
          <Content className="app-content">
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
