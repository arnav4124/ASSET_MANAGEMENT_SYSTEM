import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        // You can also log the error to an error reporting service here
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 p-6">
                    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
                        <p className="text-gray-600 mb-4">The application encountered an error. Please try refreshing the page.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            Refresh Page
                        </button>
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
                                <pre className="text-sm text-red-500">
                                    {this.state.error && this.state.error.toString()}
                                </pre>
                                <pre className="text-sm text-gray-600 mt-2">
                                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 