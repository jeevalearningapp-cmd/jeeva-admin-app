# Testing Guidelines - Production Ready

**Date:** November 23, 2025  
**Status:** Implemented & Validated  
**Test Suite:** 67 tests passing ✅

---

## Quick Reference

### When Creating New Component Tests

If your component uses:

- ✅ `useQuery`, `useMutation`, `useQueryClient` → Use `renderWithProviders()`
- ✅ `useNavigate`, `useLocation`, `useParams` → Use `renderWithProviders()`
- ✅ Any hooks that need context providers → Use `renderWithProviders()`

**Default:** Always use `renderWithProviders()` for component tests

### Example - Component Test Template

```typescript
import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/__tests__/utils/test-wrapper'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<MyComponent />)
    expect(screen.getByText(/expected text/i)).toBeInTheDocument()
  })
})
```

---

## Test Wrapper Utility

Located at: `src/__tests__/utils/test-wrapper.tsx`

### Provides:

- ✅ QueryClientProvider (TanStack React Query)
- ✅ BrowserRouter (React Router)
- ✅ Fresh QueryClient for each test (no retries)

### Functions:

**1. `renderWithProviders(component, options?)`**

- Custom render function that wraps component with all providers
- Use this for 95% of your component tests
- Replaces React Testing Library's `render()`

```typescript
import { renderWithProviders } from '@/__tests__/utils/test-wrapper'

renderWithProviders(<MyComponent />)
```

**2. `createTestQueryClient()`**

- Creates a fresh QueryClient with optimized settings
- Use if you need direct access to QueryClient (e.g., for renderHook)

```typescript
import { createTestQueryClient } from "@/__tests__/utils/test-wrapper";

const queryClient = createTestQueryClient();
```

**3. `TestWrapper` component**

- React component that wraps children with all providers
- Use with renderHook when testing custom hooks

```typescript
import { TestWrapper } from "@/__tests__/utils/test-wrapper";
import { renderHook } from "@testing-library/react";

const { result } = renderHook(() => useMyHook(), { wrapper: TestWrapper });
```

---

## Common Test Patterns

### Component Test

```typescript
import { renderWithProviders } from '@/__tests__/utils/test-wrapper'

it('should render component', () => {
  renderWithProviders(<MyComponent />)
  expect(screen.getByRole('button')).toBeInTheDocument()
})
```

### Hook Test

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { TestWrapper } from "@/__tests__/utils/test-wrapper";

it("should use hook", async () => {
  const { result } = renderHook(() => useMyHook(), { wrapper: TestWrapper });

  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

### Utility/Service Test (No Wrapper Needed)

```typescript
import { validateSettings } from "@/utils/settingsValidation";

it("should validate correctly", () => {
  const result = validateSettings({ siteName: "Test" });
  expect(result.isValid).toBe(true);
});
```

---

## Best Practices

### ✅ DO:

- Use `renderWithProviders()` for all component tests
- Use `TestWrapper` for custom hook tests
- Mock API calls and external services
- Test user interactions and edge cases
- Use meaningful test descriptions
- Keep tests focused and isolated

### ❌ DON'T:

- Use standard `render()` for components with hooks
- Skip the provider wrapper to "speed up" tests
- Mock everything - test real logic where possible
- Write overly complex test setups
- Copy-paste large test files without understanding

---

## Running Tests

```bash
# Run all tests once
npm test -- --run

# Run tests in watch mode
npm test

# Run specific test file
npm test -- src/pages/__tests__/SettingsPage.test.tsx

# Run tests matching pattern
npm test -- --grep "SettingsPage"

# Generate coverage report
npm test -- --coverage
```

---

## Adding New Providers

If you add a new context provider (e.g., Zustand store, custom context):

1. **Update `TestWrapper` component** in `src/__tests__/utils/test-wrapper.tsx`

```typescript
export function TestWrapper({ children }: { children: ReactNode }) {
  const testQueryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={testQueryClient}>
      <BrowserRouter>
        <MyNewProvider>  {/* ← Add here */}
          {children}
        </MyNewProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
```

2. **All existing tests automatically get the new provider** - no individual test updates needed

3. **Document the change** in this file

---

## Troubleshooting

### Error: "No QueryClient set"

- **Cause:** Using `render()` instead of `renderWithProviders()`
- **Fix:** Change `render(<Component />)` to `renderWithProviders(<Component />)`

### Error: "useNavigate() must be used within <BrowserRouter>"

- **Cause:** Component uses routing but not wrapped with router
- **Fix:** Use `renderWithProviders()` which includes BrowserRouter

### Error: "Cannot act on an unmounted component"

- **Cause:** Async operations not properly awaited
- **Fix:** Use `await waitFor(() => { ... })` for async assertions

### Tests running slowly

- **Cause:** QueryClient retries enabled
- **Fix:** Uses `createTestQueryClient()` which disables retries

---

## Test Statistics

**Current State (Nov 23, 2025):**

- Test Files: 8
- Total Tests: 67
- Pass Rate: 100%
- Average Duration: 47.15s

**Coverage Areas:**

- Settings management
- Payment handling
- Hook testing
- Notification services
- Export functionality

---

## Continuous Improvement

When adding new features:

1. ✅ Write tests first (TDD approach recommended)
2. ✅ Use `renderWithProviders()` for component tests
3. ✅ Run full test suite: `npm test -- --run`
4. ✅ Ensure 100% test pass rate before committing
5. ✅ Add tests to CI/CD pipeline validation

---

## Support

For test-related questions:

1. Check this guide first
2. Review existing test examples in `src/__tests__/`
3. Refer to Testing Library docs: https://testing-library.com/
4. Check React Query testing docs: https://tanstack.com/query/latest/docs/react/testing

---

**Version:** 1.0  
**Last Updated:** November 23, 2025  
**Status:** Production Ready ✅
