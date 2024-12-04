import express, { ErrorRequestHandler } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import jobsRouter from './routes/jobs'
import swaggerUi from 'swagger-ui-express'
import { specs } from './swagger'

const app = express()

// Middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  })
)
app.use(express.json())

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Routes
app.use('/api/jobs', jobsRouter)

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

// Serve OpenAPI JSON schema
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.send(specs)
})

// Error handling middleware - must have 4 parameters
const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  console.error(err.stack)
  if (res.headersSent) {
    return next(err)
  }
  res.status(500).json({ error: 'Something broke!' })
}

app.use(errorHandler)

export default app
