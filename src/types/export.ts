export type ExportFormat = 'csv' | 'pdf'
export type ExportContentType = 'payments' | 'subscriptions' | 'summary' | 'refunds'

export interface ExportOptions {
  format: ExportFormat
  contentTypes: ExportContentType[]
  dateFrom: string
  dateTo: string
  includeHeader: boolean
  includeFooter: boolean
}

export interface StatementData {
  payments: any[]
  subscriptions: any[]
  summary: {
    totalPayments: number
    totalAmount: number
    successfulPayments: number
    failedPayments: number
    refundedAmount: number
  }
  refunds: any[]
  generatedAt: string
  dateRange: {
    from: string
    to: string
  }
}
