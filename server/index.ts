import express from 'express'
import cors from 'cors'
import emailRoutes from './routes/email.js'
import chatRoutes from './routes/chat.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/email', emailRoutes)
app.use('/api/chat', chatRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API server running (Email + AI Chat)' })
})

app.listen(PORT, () => {
  console.log(`✅ API server running on port ${PORT}`)
  console.log(`   - Email API: /api/email`)
  console.log(`   - Chat API: /api/chat`)
})
