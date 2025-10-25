import { Router } from 'express'
import { Resend } from 'resend'

const router = Router()
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null

router.post('/send', async (req, res) => {
  try {
    if (!resend) {
      return res.status(503).json({ 
        error: 'Email service not configured. Please set RESEND_API_KEY environment variable.' 
      })
    }

    const { to, subject, html, from = 'Jeeva Learning <noreply@yourdomain.com>' } = req.body

    if (!to || !subject || !html) {
      return res.status(400).json({ 
        error: 'Missing required fields: to, subject, html' 
      })
    }

    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return res.status(500).json({ error: error.message })
    }

    res.json({ success: true, data })
  } catch (error: any) {
    console.error('Email send error:', error)
    res.status(500).json({ error: error.message || 'Failed to send email' })
  }
})

router.post('/welcome', async (req, res) => {
  try {
    if (!resend) {
      return res.status(503).json({ 
        error: 'Email service not configured. Please set RESEND_API_KEY environment variable.' 
      })
    }

    const { to, userName, confirmationUrl } = req.body

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Jeeva Learning</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="background: linear-gradient(135deg, #007aff 0%, #0056b3 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Jeeva Learning! 🎓</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Thank you for joining Jeeva Learning! We're excited to help you on your learning journey.
          </p>
          
          <p style="font-size: 16px; margin-bottom: 25px;">
            Please confirm your email address to get started:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background: #007aff; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
              Confirm Your Email
            </a>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 30px;">
            <h3 style="color: #007aff; margin-top: 0;">What's Next?</h3>
            <ul style="padding-left: 20px;">
              <li>Explore our course modules</li>
              <li>Take practice quizzes</li>
              <li>Track your learning progress</li>
              <li>Earn certificates</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666;">
            <p>Need help? Contact us at <a href="mailto:vollstek@gmail.com" style="color: #007aff;">vollstek@gmail.com</a></p>
            <p style="margin-top: 15px;">
              Best regards,<br>
              <strong>The Jeeva Learning Team</strong>
            </p>
          </div>
        </div>
        
      </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: 'Jeeva Learning <noreply@yourdomain.com>',
      to,
      subject: 'Welcome to Jeeva Learning - Confirm Your Email 🎓',
      html,
    })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ success: true, data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/subscription-confirmation', async (req, res) => {
  try {
    if (!resend) {
      return res.status(503).json({ 
        error: 'Email service not configured. Please set RESEND_API_KEY environment variable.' 
      })
    }

    const { to, userName, planName, price, billingCycle, startDate, nextBillingDate, appUrl } = req.body

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Subscription Confirmed</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Subscription Confirmed!</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${userName},</p>
          
          <p style="font-size: 16px; margin-bottom: 25px;">
            Congratulations! Your <strong>${planName}</strong> subscription is now active.
          </p>
          
          <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #4CAF50; margin-top: 0;">Subscription Details</h3>
            <table style="width: 100%; font-size: 15px;">
              <tr>
                <td style="padding: 8px 0;"><strong>Plan:</strong></td>
                <td style="padding: 8px 0;">${planName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Price:</strong></td>
                <td style="padding: 8px 0;">${price}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Billing Cycle:</strong></td>
                <td style="padding: 8px 0;">${billingCycle}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Start Date:</strong></td>
                <td style="padding: 8px 0;">${startDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Next Billing:</strong></td>
                <td style="padding: 8px 0;">${nextBillingDate}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/courses" 
               style="background: #4CAF50; color: white; padding: 14px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; display: inline-block;">
              Start Learning Now
            </a>
          </div>
        </div>
        
      </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: 'Jeeva Learning <noreply@yourdomain.com>',
      to,
      subject: `🎉 Welcome to ${planName} - Subscription Confirmed!`,
      html,
    })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ success: true, data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/test', async (req, res) => {
  try {
    if (!resend) {
      return res.status(503).json({ 
        error: 'Email service not configured. Please set RESEND_API_KEY environment variable.' 
      })
    }

    const { to } = req.body

    if (!to) {
      return res.status(400).json({ error: 'Email address required' })
    }

    const { data, error } = await resend.emails.send({
      from: 'Jeeva Learning <noreply@yourdomain.com>',
      to,
      subject: '✅ Resend Integration Test - Jeeva Learning',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #007aff;">✅ Email Integration Success!</h2>
          <p>This is a test email from Jeeva Learning Admin Portal.</p>
          <p>Your Resend integration is working perfectly!</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 14px;">Sent via Resend API</p>
        </div>
      `,
    })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ success: true, message: 'Test email sent successfully!', data })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
})

export default router
