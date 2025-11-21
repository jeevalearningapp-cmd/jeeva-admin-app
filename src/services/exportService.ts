import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import Papa from 'papaparse'
import logoHeader from '@/assets/logo-header.png'
import type { ExportOptions, StatementData } from '@/types/export'
import { format } from 'date-fns'

const JEEVA_COMPANY = 'Jeeva Learning'
const JEEVA_SUBTITLE = 'Payment Management System'

const downloadFile = (content: string, fileName: string, mimeType: string): void => {
  const element = document.createElement('a')
  element.setAttribute('href', `data:${mimeType};charset=utf-8,${encodeURIComponent(content)}`)
  element.setAttribute('download', fileName)
  element.style.display = 'none'
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

export const exportService = {
  async exportToCSV(data: StatementData, options: ExportOptions): Promise<void> {
    const rows: any[] = []

    // Header
    if (options.includeHeader) {
      rows.push(['Jeeva Learning - Payment Statement'])
      rows.push(['Generated:', format(new Date(data.generatedAt), 'PPpp')])
      rows.push(['Period:', `${data.dateRange.from} to ${data.dateRange.to}`])
      rows.push([])
    }

    // Summary
    if (options.contentTypes.includes('summary')) {
      rows.push(['SUMMARY'])
      rows.push(['Total Payments', data.summary.totalPayments])
      rows.push(['Successful Payments', data.summary.successfulPayments])
      rows.push(['Failed Payments', data.summary.failedPayments])
      rows.push(['Total Amount', `$${data.summary.totalAmount.toFixed(2)}`])
      rows.push(['Refunded Amount', `$${data.summary.refundedAmount.toFixed(2)}`])
      rows.push([])
    }

    // Payments
    if (options.contentTypes.includes('payments') && data.payments.length > 0) {
      rows.push(['PAYMENTS'])
      rows.push(['Payment ID', 'User ID', 'Amount', 'Currency', 'Status', 'Gateway', 'Date'])
      data.payments.forEach(p => {
        rows.push([
          p.id,
          p.userId,
          `$${p.finalAmount.toFixed(2)}`,
          p.currency,
          p.status,
          p.gateway,
          format(new Date(p.createdAt), 'PPpp'),
        ])
      })
      rows.push([])
    }

    // Refunds
    if (options.contentTypes.includes('refunds') && data.refunds.length > 0) {
      rows.push(['REFUNDS'])
      rows.push(['Refund ID', 'Payment ID', 'Amount', 'Reason', 'Status', 'Date'])
      data.refunds.forEach(r => {
        rows.push([
          r.id,
          r.paymentId,
          `$${r.amount.toFixed(2)}`,
          r.reason || 'N/A',
          r.status,
          format(new Date(r.createdAt), 'PPpp'),
        ])
      })
      rows.push([])
    }

    // Footer
    if (options.includeFooter) {
      rows.push([])
      rows.push(['This is an automated statement from Jeeva Learning Platform'])
      rows.push(['For support, contact: support@jeeva-learning.com'])
    }

    const csv = Papa.unparse(rows)
    const fileName = `Jeeva_Statement_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.csv`
    downloadFile(csv, fileName, 'text/csv')
  },

  async exportToPDF(data: StatementData, options: ExportOptions): Promise<void> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    let yPosition = 20

    // Header with Logo
    try {
      const img = new Image()
      img.src = logoHeader
      await new Promise(resolve => {
        img.onload = () => {
          pdf.addImage(img, 'PNG', 15, 10, 30, 30)
          resolve(null)
        }
      })
    } catch (e) {
      console.error('Failed to load logo:', e)
    }

    pdf.setFontSize(16)
    pdf.setTextColor(0, 122, 255)
    pdf.text(JEEVA_COMPANY, 50, 20)
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    pdf.text(JEEVA_SUBTITLE, 50, 28)

    yPosition = 50

    // Title
    pdf.setFontSize(14)
    pdf.setTextColor(0, 0, 0)
    pdf.text('Payment Statement', 15, yPosition)
    yPosition += 10

    // Generation Info
    pdf.setFontSize(10)
    pdf.setTextColor(100, 100, 100)
    pdf.text(`Generated: ${format(new Date(data.generatedAt), 'PPpp')}`, 15, yPosition)
    yPosition += 5
    pdf.text(`Period: ${data.dateRange.from} to ${data.dateRange.to}`, 15, yPosition)
    yPosition += 10

    // Summary Section
    if (options.contentTypes.includes('summary')) {
      pdf.setFontSize(12)
      pdf.setTextColor(0, 122, 255)
      pdf.text('SUMMARY', 15, yPosition)
      yPosition += 7

      pdf.setFontSize(10)
      pdf.setTextColor(0, 0, 0)
      const summaryData = [
        ['Total Payments:', data.summary.totalPayments.toString()],
        ['Successful:', data.summary.successfulPayments.toString()],
        ['Failed:', data.summary.failedPayments.toString()],
        ['Total Amount:', `$${data.summary.totalAmount.toFixed(2)}`],
        ['Refunded Amount:', `$${data.summary.refundedAmount.toFixed(2)}`],
      ]

      summaryData.forEach(([label, value]) => {
        pdf.text(label, 15, yPosition)
        pdf.text(value, 120, yPosition)
        yPosition += 6
      })
      yPosition += 5
    }

    // Payments Section
    if (options.contentTypes.includes('payments') && data.payments.length > 0) {
      if (yPosition > 250) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFontSize(12)
      pdf.setTextColor(0, 122, 255)
      pdf.text('PAYMENT TRANSACTIONS', 15, yPosition)
      yPosition += 8

      // Table
      const headers = ['Payment ID', 'Amount', 'Status', 'Gateway', 'Date']
      const rows = data.payments.map(p => [
        p.id.substring(0, 8) + '...',
        `$${p.finalAmount.toFixed(2)}`,
        p.status,
        p.gateway,
        format(new Date(p.createdAt), 'MMM dd, yyyy'),
      ])

      pdf.setFontSize(9)
      pdf.setTextColor(100, 100, 100)
      let tableY = yPosition
      headers.forEach((h, i) => {
        pdf.text(h, 15 + i * 38, tableY)
      })
      tableY += 5

      pdf.setTextColor(0, 0, 0)
      rows.forEach(row => {
        if (tableY > 270) {
          pdf.addPage()
          tableY = 20
        }
        row.forEach((cell, i) => {
          pdf.text(cell.toString(), 15 + i * 38, tableY)
        })
        tableY += 5
      })
      yPosition = tableY + 5
    }

    // Footer
    if (options.includeFooter) {
      pdf.setFontSize(8)
      pdf.setTextColor(150, 150, 150)
      pdf.text('This is an automated statement from Jeeva Learning Platform', 15, 285)
      pdf.text('For support: support@jeeva-learning.com', 15, 290)
    }

    // Save PDF
    const fileName = `Jeeva_Statement_${format(new Date(), 'yyyy-MM-dd_HHmmss')}.pdf`
    pdf.save(fileName)
  },
}
