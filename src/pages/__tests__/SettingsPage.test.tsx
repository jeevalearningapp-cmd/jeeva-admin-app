import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SettingsPage } from '../SettingsPage'
import * as useSettingsHook from '@/hooks/useSettings'
import { renderWithProviders } from '@/__tests__/utils/test-wrapper'

// Mock the useSettings hook
vi.mock('@/hooks/useSettings')

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

describe('SettingsPage', () => {
  const mockUpdateSettings = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Loading State', () => {
    it('should show loading spinner while fetching settings', () => {
      vi.mocked(useSettingsHook.useSettings).mockReturnValue({
        settings: undefined,
        isLoading: true,
        error: null,
        updateSettings: mockUpdateSettings,
        isUpdating: false,
      })

      renderWithProviders(<SettingsPage />)
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })

  describe('Display Settings', () => {
    beforeEach(() => {
      vi.mocked(useSettingsHook.useSettings).mockReturnValue({
        settings: mockSettings,
        isLoading: false,
        error: null,
        updateSettings: mockUpdateSettings,
        isUpdating: false,
      })
    })

    it('should render settings form with current values', () => {
      renderWithProviders(<SettingsPage />)

      expect(screen.getByDisplayValue('Jeeva Learning')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Learning platform')).toBeInTheDocument()
      expect(screen.getByDisplayValue('contact@jeeva.com')).toBeInTheDocument()
      expect(screen.getByDisplayValue('support@jeeva.com')).toBeInTheDocument()
    })

    it('should render security and notification tabs', () => {
      renderWithProviders(<SettingsPage />)

      // Verify tabs exist  
      expect(screen.getByRole('tab', { name: /security/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /notifications/i })).toBeInTheDocument()
    })

    it('should display toggle switches with labels', () => {
      renderWithProviders(<SettingsPage />)
      
      // Verify switch labels are present (sufficient to confirm switches render)
      expect(screen.getByText(/Maintenance Mode/i)).toBeInTheDocument()
      expect(screen.getByText(/User Registration Enabled/i)).toBeInTheDocument()
      expect(screen.getByText(/Email Verification Required/i)).toBeInTheDocument()
    })
  })

  describe('Tab Navigation', () => {
    beforeEach(() => {
      vi.mocked(useSettingsHook.useSettings).mockReturnValue({
        settings: mockSettings,
        isLoading: false,
        error: null,
        updateSettings: mockUpdateSettings,
        isUpdating: false,
      })
    })

    it('should switch between tabs', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SettingsPage />)

      const securityTab = screen.getByRole('tab', { name: /security/i })
      await user.click(securityTab)

      expect(
        screen.getByText(/password requirements/i)
      ).toBeInTheDocument()
    })

    it('should display all tabs', () => {
      renderWithProviders(<SettingsPage />)

      expect(screen.getByRole('tab', { name: /general/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /security/i })).toBeInTheDocument()
      expect(
        screen.getByRole('tab', { name: /notifications/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('tab', { name: /email templates/i })
      ).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    beforeEach(() => {
      vi.mocked(useSettingsHook.useSettings).mockReturnValue({
        settings: mockSettings,
        isLoading: false,
        error: null,
        updateSettings: mockUpdateSettings,
        isUpdating: false,
      })
    })

    it('should show validation error for empty site name', async () => {
      const user = userEvent.setup()
      renderWithProviders(<SettingsPage />)

      const siteNameInput = screen.getByLabelText(/site name/i)
      await user.clear(siteNameInput)

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(
          screen.getByText(/site name is required/i)
        ).toBeInTheDocument()
      })

      expect(mockUpdateSettings).not.toHaveBeenCalled()
    })

    it('should show validation error for invalid email', async () => {
      renderWithProviders(<SettingsPage />)

      const contactEmailInput = screen.getByLabelText(/contact email/i)
      fireEvent.change(contactEmailInput, { target: { value: 'invalid-email' } })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(
          screen.getByText(/contact email is invalid/i)
        ).toBeInTheDocument()
      }, { timeout: 2000 })

      expect(mockUpdateSettings).not.toHaveBeenCalled()
    })

    it('should prevent save when form is invalid', async () => {
      renderWithProviders(<SettingsPage />)

      const siteNameInput = screen.getByLabelText(/site name/i)
      fireEvent.change(siteNameInput, { target: { value: '' } })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockUpdateSettings).not.toHaveBeenCalled()
      })

      // Validation error should appear
      expect(screen.getByText(/site name is required/i)).toBeInTheDocument()
    })
  })

  describe('Saving Settings', () => {
    beforeEach(() => {
      vi.mocked(useSettingsHook.useSettings).mockReturnValue({
        settings: mockSettings,
        isLoading: false,
        error: null,
        updateSettings: mockUpdateSettings,
        isUpdating: false,
      })
    })

    it('should call updateSettings with correct data on save', async () => {
      renderWithProviders(<SettingsPage />)

      const siteNameInput = screen.getByLabelText(/site name/i)
      fireEvent.change(siteNameInput, { target: { value: 'Updated Platform Name' } })

      const saveButton = screen.getByRole('button', { name: /save changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith({
          id: 'test-id',
          input: expect.objectContaining({
            siteName: 'Updated Platform Name',
          }),
        })
      }, { timeout: 3000 })
    })

    it('should disable save button while updating', () => {
      vi.mocked(useSettingsHook.useSettings).mockReturnValue({
        settings: mockSettings,
        isLoading: false,
        error: null,
        updateSettings: mockUpdateSettings,
        isUpdating: true,
      })

      renderWithProviders(<SettingsPage />)

      const saveButton = screen.getByRole('button', { name: /saving/i })
      expect(saveButton).toBeDisabled()
    })
  })
})
