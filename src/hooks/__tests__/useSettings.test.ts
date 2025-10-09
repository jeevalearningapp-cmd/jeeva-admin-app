import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useSettings } from '../useSettings'
import * as settingsApi from '@/api/settings'
import { ErrorHandler } from '@/utils/errorHandler'

// Mock API and ErrorHandler
vi.mock('@/api/settings')
vi.mock('@/utils/errorHandler')

const mockSettings = {
  id: 'test-id',
  siteName: 'Jeeva Learning',
  siteDescription: 'Learning platform',
  contactEmail: 'contact@jeeva.com',
  supportEmail: 'support@jeeva.com',
  maintenanceMode: false,
  registrationEnabled: true,
  emailVerificationRequired: true,
  maxFileUploadSize: 5,
  allowedFileTypes: ['image/jpeg', 'image/png'],
  sessionTimeout: 60,
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecialChars: true,
  emailNotifications: true,
  pushNotifications: false,
  newUserSignup: true,
  contentSubmitted: true,
  contentApproved: true,
  contentRejected: true,
  subscriptionExpiring: true,
  subscriptionRenewed: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('useSettings', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
    vi.clearAllMocks()
  })

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => 
      createElement(QueryClientProvider, { client: queryClient }, children)
  }

  describe('Fetching Settings', () => {
    it('should fetch settings successfully', async () => {
      vi.mocked(settingsApi.getSettings).mockResolvedValue(mockSettings)

      const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.settings).toEqual(mockSettings)
      expect(result.current.error).toBeNull()
    })

    it('should handle fetch error', async () => {
      const error = new Error('Failed to fetch')
      vi.mocked(settingsApi.getSettings).mockRejectedValue(error)

      const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.settings).toBeUndefined()
      expect(result.current.error).toBeTruthy()
    })
  })

  describe('Updating Settings', () => {
    it('should update settings successfully', async () => {
      const updatedSettings = { ...mockSettings, siteName: 'Updated Name' }
      vi.mocked(settingsApi.getSettings).mockResolvedValue(mockSettings)
      vi.mocked(settingsApi.updateSettings).mockResolvedValue(updatedSettings)

      const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.settings).toEqual(mockSettings)
      })

      result.current.updateSettings({
        id: 'test-id',
        input: { siteName: 'Updated Name' },
      })

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false)
      })

      expect(settingsApi.updateSettings).toHaveBeenCalledWith('test-id', {
        siteName: 'Updated Name',
      })
    })

    it('should handle update error with ErrorHandler', async () => {
      const error = new Error('Update failed')
      vi.mocked(settingsApi.getSettings).mockResolvedValue(mockSettings)
      vi.mocked(settingsApi.updateSettings).mockRejectedValue(error)

      const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.settings).toEqual(mockSettings)
      })

      result.current.updateSettings({
        id: 'test-id',
        input: { siteName: 'New Name' },
      })

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false)
      })

      expect(ErrorHandler.handle).toHaveBeenCalledWith(
        error,
        'Failed to save settings. Please check your permissions and try again.'
      )
    })

    it('should invalidate query cache after successful update', async () => {
      const updatedSettings = { ...mockSettings, siteName: 'Updated Name' }
      vi.mocked(settingsApi.getSettings).mockResolvedValue(mockSettings)
      vi.mocked(settingsApi.updateSettings).mockResolvedValue(updatedSettings)

      const { result } = renderHook(() => useSettings(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.settings).toEqual(mockSettings)
      })

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      result.current.updateSettings({
        id: 'test-id',
        input: { siteName: 'Updated Name' },
      })

      await waitFor(() => {
        expect(result.current.isUpdating).toBe(false)
      })

      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['settings'] })
    })
  })
})
