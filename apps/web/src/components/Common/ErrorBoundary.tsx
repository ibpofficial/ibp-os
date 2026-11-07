import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Captured in IBP OS ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRecover = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 bg-slate-900/90 text-slate-100 rounded-xl border border-rose-500/30 backdrop-blur-md select-text">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl mb-4 text-rose-400">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-base font-bold text-slate-100 mb-1">
            {this.props.fallbackTitle || 'A component tripped in IBP OS'}
          </h2>
          <p className="text-xs text-slate-400 max-w-md text-center mb-4 leading-relaxed">
            {this.state.error?.message || 'An unexpected runtime error occurred.'}
          </p>

          <div className="w-full max-w-md p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto max-h-36 mb-4">
            {this.state.error?.stack || String(this.state.error)}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={this.handleRecover}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition"
            >
              <RefreshCw size={13} />
              <span>Recover Window</span>
            </button>
            <button
              onClick={this.handleReload}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition border border-slate-700"
            >
              <Home size={13} />
              <span>Restart OS</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
