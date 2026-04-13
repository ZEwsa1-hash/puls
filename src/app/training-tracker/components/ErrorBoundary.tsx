// Error Boundary component for graceful error handling

import React, { Component, ReactNode } from 'react';
import { Card, Button } from 'antd';

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

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Card style={{ maxWidth: 500, textAlign: 'center' }}>
            <h2 style={{ color: '#e74c3c', marginBottom: 16 }}>Something went wrong</h2>
            <p style={{ marginBottom: 24, color: '#7f8c8d' }}>
              The application encountered an error. Please try refreshing the page.
            </p>
            <Button type="primary" onClick={this.handleReset}>
              Reload Application
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
