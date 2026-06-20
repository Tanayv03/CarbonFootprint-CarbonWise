import React from 'react';
import PropTypes from 'prop-types';

/**
 * A robust Error Boundary component to catch and isolate unhandled React errors
 * gracefully, ensuring the application does not crash or white-screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center p-6">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-earth-brown mb-4 text-sm max-w-md">
            We apologize, but an unexpected error occurred while loading this section.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-earth-forest text-white rounded-full hover:bg-earth-forest/90 transition-colors"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default ErrorBoundary;
