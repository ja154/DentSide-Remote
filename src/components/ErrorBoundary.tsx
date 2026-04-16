import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 tracking-tight font-headline">Something went wrong</h2>
            <p className="text-slate-600 mb-6 font-body">An unexpected error occurred. Our team has been notified. Please try refreshing the page.</p>
            <div className="bg-slate-100 p-4 rounded-lg text-xs font-mono text-slate-800 break-words mb-6 overflow-auto max-h-40">
              {this.state.error?.message}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#0077B6] hover:bg-[#023E8A] text-white py-3 rounded-lg font-bold tracking-wider uppercase transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
