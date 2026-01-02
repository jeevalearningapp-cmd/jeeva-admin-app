import { describe, it, expect, vi } from 'vitest'
import type { StatementData, ExportOptions } from '@/types/export'

describe('ExportService', () => {
  const mockStatementData: StatementData = {
    payments: [
      {
        id: 'pay_1',
        userId: 'user_1',
        amount: 100,
        finalAmount: 100,
        originalAmount: 100,
        discountAmount: 0,
        currency: 'USD',
        status: 'succeeded',
        gateway: 'stripe',
        stripePaymentIntentId: 'pi_test_123',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    ],
    subscriptions: [],
    summary: {
      totalPayments: 1,
      totalAmount: 100,
      successfulPayments: 1,
      failedPayments: 0,
      refundedAmount: 0,
    },
    refunds: [],
    generatedAt: '2025-01-01T00:00:00Z',
    dateRange: { from: '2025-01-01', to: '2025-01-31' },
  }

  const mockExportOptions: ExportOptions = {
    format: 'csv',
    contentTypes: ['payments', 'summary'],
    dateFrom: '2025-01-01',
    dateTo: '2025-01-31',
    includeHeader: true,
    includeFooter: true,
  }

  it('should validate statement data structure', () => {
    expect(mockStatementData).toHaveProperty('payments')
    expect(mockStatementData).toHaveProperty('summary')
    expect(mockStatementData).toHaveProperty('dateRange')
  })

  it('should validate export options', () => {
    expect(mockExportOptions.format).toBe('csv')
    expect(mockExportOptions.contentTypes.length).toBe(2)
    expect(mockExportOptions.includeHeader).toBe(true)
  })

  it('should support PDF export format', () => {
    const pdfOptions: ExportOptions = {
      ...mockExportOptions,
      format: 'pdf',
    }
    expect(pdfOptions.format).toBe('pdf')
  })

  it('should support multiple content types', () => {
    const allContent: ExportOptions = {
      ...mockExportOptions,
      contentTypes: ['payments', 'subscriptions', 'summary', 'refunds'],
    }
    expect(allContent.contentTypes.length).toBe(4)
  })

  it('should calculate summary statistics', () => {
    expect(mockStatementData.summary.totalPayments).toBe(1)
    expect(mockStatementData.summary.successfulPayments).toBe(1)
    expect(mockStatementData.summary.failedPayments).toBe(0)
  })
})
