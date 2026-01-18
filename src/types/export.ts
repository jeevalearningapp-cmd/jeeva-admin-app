export type ExportFormat = "csv" | "pdf";
export type ExportContentType =
  | "payments"
  | "subscriptions"
  | "summary"
  | "refunds";

export interface ExportOptions {
  format: ExportFormat;
  contentTypes: ExportContentType[];
  dateFrom: string;
  dateTo: string;
  includeHeader: boolean;
  includeFooter: boolean;
}

import type { Payment, PaymentRefund } from "./payments";

export interface SubscriptionExport {
  id: string;
  userId: string;
  planType: string;
  planId?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: string;
  amountPaidUsd?: number;
  couponCode?: string;
  discountAmount?: number;
  createdAt: string;
}

export interface StatementData {
  payments: Payment[];
  subscriptions: SubscriptionExport[];
  summary: {
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    refundedAmount: number;
  };
  refunds: PaymentRefund[];
  generatedAt: string;
  dateRange: {
    from: string;
    to: string;
  };
}
