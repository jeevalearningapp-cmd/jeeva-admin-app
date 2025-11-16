import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const EXPO_RECEIPT_URL = 'https://exp.host/--/api/v2/push/getReceipts'

interface ExpoReceipt {
  status: 'ok' | 'error'
  message?: string
  details?: any
}

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    console.log('📨 Fetching delivery receipts from Expo...')

    // Step 1: Get notification targets with ticket IDs that haven't been confirmed yet
    const { data: targets, error: targetsError } = await supabaseClient
      .from('notification_targets')
      .select('id, notification_id, push_token_id, expo_ticket_id, delivery_status')
      .eq('delivery_status', 'sent') // Only check 'sent' status (waiting for confirmation)
      .not('expo_ticket_id', 'is', null)
      .limit(1000)

    if (targetsError) {
      console.error('❌ Error fetching targets:', targetsError)
      throw targetsError
    }

    if (!targets || targets.length === 0) {
      console.log('✅ No pending receipts to check')
      return new Response(
        JSON.stringify({ success: true, message: 'No pending receipts', checked: 0 }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    console.log(`🔍 Checking ${targets.length} receipts...`)

    // Step 2: Get unique ticket IDs
    const ticketIds = [...new Set(targets.map((t) => t.expo_ticket_id).filter(Boolean))]

    if (ticketIds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No ticket IDs found', checked: 0 }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Step 3: Fetch receipts from Expo in batches (max 1000 per request)
    const BATCH_SIZE = 1000
    let totalDelivered = 0
    let totalFailed = 0

    for (let i = 0; i < ticketIds.length; i += BATCH_SIZE) {
      const batch = ticketIds.slice(i, i + BATCH_SIZE)

      try {
        const response = await fetch(EXPO_RECEIPT_URL, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: batch }),
        })

        if (!response.ok) {
          console.error(`Expo API error: ${response.status} ${response.statusText}`)
          continue
        }

        const result = await response.json()
        const receipts: Record<string, ExpoReceipt> = result.data || {}

        // Step 4: Update delivery status for each receipt
        for (const [ticketId, receipt] of Object.entries(receipts)) {
          const matchingTargets = targets.filter((t) => t.expo_ticket_id === ticketId)

          if (receipt.status === 'ok') {
            // Successfully delivered
            for (const target of matchingTargets) {
              await supabaseClient
                .from('notification_targets')
                .update({
                  delivery_status: 'delivered',
                  delivered_at: new Date().toISOString(),
                })
                .eq('id', target.id)

              totalDelivered++
            }
          } else {
            // Delivery failed
            const errorMessage = receipt.message || 'Unknown delivery error'

            for (const target of matchingTargets) {
              await supabaseClient
                .from('notification_targets')
                .update({
                  delivery_status: 'failed',
                  error_message: errorMessage,
                })
                .eq('id', target.id)

              // Mark push token as inactive if device not registered
              if (
                errorMessage.includes('DeviceNotRegistered') ||
                errorMessage.includes('InvalidCredentials')
              ) {
                await supabaseClient
                  .from('push_tokens')
                  .update({ is_active: false })
                  .eq('id', target.push_token_id)

                console.log(`⚠️ Marked token ${target.push_token_id} as inactive`)
              }

              totalFailed++
            }
          }
        }
      } catch (error) {
        console.error('Error fetching receipts batch:', error)
      }
    }

    // Step 5: Update notification stats
    const notificationIds = [...new Set(targets.map((t) => t.notification_id))]

    for (const notificationId of notificationIds) {
      const { data: stats, error: statsError } = await supabaseClient
        .from('notification_targets')
        .select('delivery_status')
        .eq('notification_id', notificationId)

      if (!statsError && stats) {
        const delivered = stats.filter((s) => s.delivery_status === 'delivered').length
        const failed = stats.filter((s) => s.delivery_status === 'failed').length

        await supabaseClient
          .from('notifications')
          .update({
            total_delivered: delivered,
            total_failed: failed,
          })
          .eq('id', notificationId)
      }
    }

    console.log(`✅ Receipt check complete: ${totalDelivered} delivered, ${totalFailed} failed`)

    return new Response(
      JSON.stringify({
        success: true,
        checked: targets.length,
        delivered: totalDelivered,
        failed: totalFailed,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('❌ Fatal error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
