import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled error in app tree:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#030014] px-4 text-white">
          <div className="max-w-md rounded-3xl border border-purple-500/25 bg-white/[0.06] px-8 py-8 text-center shadow-[0_0_60px_rgba(168,85,247,0.25)] backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-purple-300">
              Ellipsis SMP
            </p>
            <p className="mt-3 text-lg font-black">Something went wrong.</p>
            <p className="mt-2 text-sm text-gray-400">
              This page hit an unexpected error. Try reloading, or head back home.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-bold transition hover:scale-105"
              >
                Reload
              </button>
              <a
                href="/"
                className="rounded-xl border border-purple-500/40 px-5 py-2.5 text-sm font-bold transition hover:bg-purple-500/10"
              >
                Back Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
