import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { App } from "@/components/App.tsx";
import { ErrorBoundary } from "@/components/ErrorBoundary.tsx";
import { publicUrl } from "@/helpers/publicUrl.ts";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (was cacheTime in v4)
    },
    mutations: {
      retry: 1,
    },
  },
});

function ErrorBoundaryError({ error }: { error: unknown }) {
  return (
    <div>
      <p>An unhandled error occurred:</p>
      <blockquote>
        <code>
          {error instanceof Error
            ? error.message
            : typeof error === "string"
            ? error
            : JSON.stringify(error)}
        </code>
      </blockquote>
    </div>
  );
}

export function Root() {
  return (
    <ErrorBoundary fallback={ErrorBoundaryError}>
      <QueryClientProvider client={queryClient}>
        <TonConnectUIProvider
          manifestUrl={publicUrl("tonconnect-manifest.json")}
        >
          <App />
        </TonConnectUIProvider>
        {/* Only show React Query Devtools in development */}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
