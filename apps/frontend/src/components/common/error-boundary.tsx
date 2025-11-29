"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center rounded-lg border border-dashed bg-background/50">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
                        <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        {this.state.error?.message ||
                            "An unexpected error occurred. Please try again."}
                    </p>
                    <Button onClick={this.handleReset} variant="outline">
                        Try again
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
