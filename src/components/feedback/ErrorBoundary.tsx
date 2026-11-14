import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("[EliasNote] erro de interface", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-background p-6 text-center">
          <h1 className="text-lg font-semibold">Algo deu errado na interface</h1>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            Seus dados permanecem salvos localmente. Recarregue a janela para continuar; se o problema
            persistir, abra as configurações de dados para restaurar um backup.
          </p>
          <pre className="max-w-lg overflow-auto rounded-lg bg-muted p-3 text-left text-[10px] text-destructive">
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Recarregar aplicativo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
