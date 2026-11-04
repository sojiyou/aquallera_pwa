import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh flex flex-col items-center justify-center bg-app-bg gap-4 px-6 text-center">
          <h1 className="text-midnight-blue font-bold text-xl">Something went wrong</h1>
          <p className="text-gray-600 text-sm">Please reload the app to continue.</p>
          <button onClick={() => window.location.reload()} className="btn-primary">Reload</button>
        </div>
      )
    }
    return this.props.children
  }
}
