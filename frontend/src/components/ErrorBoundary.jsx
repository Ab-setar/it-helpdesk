import React from "react";

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error) {
		return { hasError: true, error };
	}

	componentDidCatch(error, info) {
		console.error("ErrorBoundary caught:", error, info);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className='min-h-screen flex flex-col items-center justify-center text-center px-4'>
					<h1 className='text-4xl font-bold text-gray-700 dark:text-gray-300 mb-4'>
						Something went wrong
					</h1>
					<p className='text-gray-500 dark:text-gray-400 mb-8'>
						An unexpected error occurred. Please refresh the page.
					</p>
					{import.meta.env.DEV && (
						<pre className='text-left text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg max-w-2xl overflow-auto mb-6'>
							{this.state.error?.toString()}
						</pre>
					)}
					<button
						onClick={() => window.location.reload()}
						className='bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors'>
						Refresh Page
					</button>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
