# Testing Guide

## Overview

The Jeeva Admin Portal uses Vitest for unit and integration testing with React Testing Library for component testing.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in UI mode
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Structure

### Unit Tests

Located in `__tests__` directories next to the code being tested:

- `src/utils/__tests__/` - Utility function tests
- `src/hooks/__tests__/` - Custom hook tests
- `src/api/__tests__/` - API function tests

### Integration Tests

- Component integration tests in `src/components/__tests__/`
- Page integration tests in `src/pages/__tests__/`

## Test Coverage

### Current Coverage:

- ✅ Settings validation utilities (24 tests - comprehensive)
- ✅ Settings custom hooks (7 tests - fetch, update, error handling)
- ✅ Settings page components (10 tests - rendering, validation, saving)

### Writing Tests

Example unit test:

```typescript
import { describe, it, expect } from "vitest";
import { validateSettings } from "../settingsValidation";

describe("validateSettings", () => {
  it("should validate required fields", () => {
    const result = validateSettings({ siteName: "" });
    expect(result.isValid).toBe(false);
  });
});
```

Example hook test with mocks:

```typescript
import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useSettings } from "../useSettings";

// Mock Supabase and React Query
vi.mock("@/api/settings");

describe("useSettings", () => {
  it("should fetch settings", async () => {
    const { result } = renderHook(() => useSettings());
    await waitFor(() => expect(result.current.settings).toBeDefined());
  });
});
```

## Best Practices

1. **Test Behavior, Not Implementation** - Focus on what the code does, not how it does it
2. **Use Descriptive Test Names** - Test names should clearly describe what is being tested
3. **Isolate Tests** - Each test should be independent and not rely on others
4. **Mock External Dependencies** - Mock API calls, Supabase, and other external services
5. **Test Edge Cases** - Include tests for error conditions and boundary values
