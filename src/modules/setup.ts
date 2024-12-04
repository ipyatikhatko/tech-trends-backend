import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'
import { technologies } from '../constants'

export async function setupDatabase(): Promise<void> {
  const prisma = new PrismaClient()

  try {
    // Clean up existing jobs
    logger.info('Cleaning up existing jobs...')
    await prisma.job.deleteMany()

    // Reset the job ID sequence
    await prisma.$executeRaw`ALTER SEQUENCE jobs_id_seq RESTART WITH 1;`

    // Check and seed technologies
    logger.info('Checking technologies...')
    for (const tech of technologies) {
      await prisma.technology.upsert({
        where: { name: tech.name },
        update: { djinniKeyword: tech.djinniKeyword },
        create: tech,
      })
    }

    logger.info('Database setup completed successfully')
  } catch (error) {
    logger.error('Database setup failed:', error as Error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}
