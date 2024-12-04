import swaggerJsdoc from 'swagger-jsdoc'
import { schemas } from './schemas'
import { paths } from './paths'

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Jobs API',
      version: '1.0.0',
      description: 'API for tech jobs statistics',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      schemas,
    },
    paths,
  },
  apis: [], // We're not using JSDoc comments anymore
}

export const specs = swaggerJsdoc(options)
