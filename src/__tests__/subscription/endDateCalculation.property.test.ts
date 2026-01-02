import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * **Feature: currency-subscription-fix, Property 4: End Date Calculation Correctness**
 * **Validates: Requirements 2.3**
 * 
 * For any subscription activation with a known duration_days, 
 * the end_date SHALL equal start_date plus the duration_days.
 */

// Helper function that mirrors the core end date calculation logic
function calculateEndDate(startDate: Date, durationDays: number): Date {
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + durationDays)
  return endDate
}

// Helper to calculate days between two dates
function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((end.getTime() - start.getTime()) / msPerDay)
}

describe('Property 4: End Date Calculation Correctness', () => {
  // Generate valid dates only
  const dateArb = fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31'), noInvalidDate: true })
  // Generate realistic duration days (1 day to 365 days)
  const durationDaysArb = fc.integer({ min: 1, max: 365 })

  it('end_date equals start_date plus duration_days for any duration', () => {
    fc.assert(
      fc.property(dateArb, durationDaysArb, (startDate, durationDays) => {
        const endDate = calculateEndDate(startDate, durationDays)
        const days = daysBetween(startDate, endDate)
        expect(days).toBe(durationDays)
      }),
      { numRuns: 100 }
    )
  })

  it('end_date is always after start_date for any positive duration', () => {
    fc.assert(
      fc.property(dateArb, durationDaysArb, (startDate, durationDays) => {
        const endDate = calculateEndDate(startDate, durationDays)
        expect(endDate.getTime()).toBeGreaterThan(startDate.getTime())
      }),
      { numRuns: 100 }
    )
  })

  it('longer duration always results in later end_date', () => {
    const shortDurationArb = fc.integer({ min: 1, max: 30 })
    const longDurationArb = fc.integer({ min: 31, max: 365 })
    
    fc.assert(
      fc.property(dateArb, shortDurationArb, longDurationArb, (startDate, shortDuration, longDuration) => {
        const shortEnd = calculateEndDate(startDate, shortDuration)
        const longEnd = calculateEndDate(startDate, longDuration)
        expect(shortEnd.getTime()).toBeLessThan(longEnd.getTime())
      }),
      { numRuns: 100 }
    )
  })

  it('common subscription durations calculate correctly (30, 90, 180, 365 days)', () => {
    const commonDurations = [30, 90, 180, 365]
    
    fc.assert(
      fc.property(dateArb, (startDate) => {
        for (const duration of commonDurations) {
          const endDate = calculateEndDate(startDate, duration)
          const days = daysBetween(startDate, endDate)
          expect(days).toBe(duration)
        }
      }),
      { numRuns: 50 }
    )
  })
})
