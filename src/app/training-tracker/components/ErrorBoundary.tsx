// Error Boundary component for graceful error handling

import React, { Component, ReactNode } from 'react';
import { Alert, Button, Card, Space } from 'antd';

const STORAGE_KEYS_TO_CLEAR = [
  'training-tracker-v1',
  'puls-training-storage',
];

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleClearLocalData = () => {
    STORAGE_KEYS_TO_CLEAR.forEach((key) => window.localStorage.removeItem(key));
    this.handleReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh',
          background: '#101110',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Card style={{ width: '100%', maxWidth: 520 }}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Alert
                type="error"
                showIcon
                message="Страница тренировки не загрузилась"
                description="Чаще всего это происходит из-за старых или поврежденных локальных данных в браузере."
              />
              <Space wrap>
                <Button type="primary" onClick={this.handleReset}>
                  Перезагрузить
                </Button>
                <Button danger onClick={this.handleClearLocalData}>
                  Очистить локальные данные
                </Button>
              </Space>
            </Space>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
