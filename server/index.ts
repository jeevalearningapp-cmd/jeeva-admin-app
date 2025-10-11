import express from 'express'
import cors from 'cors'
import emailRoutes from './routes/email.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/email', emailRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Email API server running' })
})

app.listen(PORT, () => {
  console.log(`✅ Email API server running on port ${PORT}`)
})
