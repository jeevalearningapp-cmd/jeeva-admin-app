import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { render, RenderOptions } from "@testing-library/react";

/**
 * Creates a fresh QueryClient for each test
 * Disables retries to speed up tests and prevent flakiness
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0, // Immediately remove unused data
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * Test Wrapper Component
 * Provides all required contexts for component testing:
 * - QueryClientProvider: for TanStack React Query hooks
 * - BrowserRouter: for routing hooks (useNavigate, useLocation, etc)
 */
export function TestWrapper({ children }: { children: ReactNode }) {
  const testQueryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
}

/**
 * Custom render function that wraps components with required providers
 * Use this instead of React Testing Library's render() for components that use:
 * - useQuery, useMutation, useQueryClient (TanStack Query)
 * - useNavigate, useLocation, useParams (React Router)
 *
 * @example
 * import { renderWithProviders } from '@/__tests__/utils/test-wrapper'
 *
 * it('renders with providers', () => {
 *   renderWithProviders(<MyComponent />)
 * })
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: TestWrapper, ...options });
}
