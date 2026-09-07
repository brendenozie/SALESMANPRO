"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface Props {
  children: ReactNode;
  sectionType?: string;
  sectionId?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SectionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Section [${this.props.sectionType || "Unknown"}:${this.props.sectionId || ""}] rendering error:`, error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Safe silent fallback for production or helpful note in editor
      return (
        <div className="w-full py-8 px-4 my-2 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-center">
          <div className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium">
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span>Section could not be rendered ({this.props.sectionType || "custom"})</span>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
