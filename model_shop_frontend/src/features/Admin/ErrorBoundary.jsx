import React from "react";

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Something went wrong</h1>
          <p className="text-red-500">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
