import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="p-4 m-4 border border-red-500 rounded bg-red-50">
          <h1 className="text-xl font-bold text-red-700">Something went wrong.</h1>
          <details className="whitespace-pre-wrap mt-2 text-sm text-red-600">
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
            onClick={() => window.location.reload()}
          >
            Reload App
          </button>
          <button 
            className="mt-4 ml-4 px-4 py-2 bg-gray-600 text-white rounded"
            onClick={() => {
                localStorage.clear();
                window.location.reload();
            }}
          >
            Clear Data & Reload
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
