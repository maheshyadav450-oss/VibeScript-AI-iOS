import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * Global error boundary — catches render-time crashes anywhere in the tree
 * and shows a recovery screen instead of a blank white page.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('VibeScript crash:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-obsidian px-6 text-center">
          <div className="h-16 w-16 rounded-2xl gradient-neon opacity-80" />
          <h1 className="font-display text-xl font-bold text-white">Something glitched in the matrix</h1>
          <p className="max-w-xs font-body text-sm text-white/50">
            An unexpected error occurred. Your work is safe — try again.
          </p>
          <button
            onClick={this.handleReset}
            className="rounded-xl gradient-neon px-6 py-3 font-display text-sm font-bold text-obsidian transition active:scale-95"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
