import app from './api/app'
import cron from 'node-cron'
import scrapeJobs from './modules/scraper'
import { logger } from './utils/logger'
import { setupDatabase } from './modules/setup'

const PORT = process.env.PORT || 3001

// Start Express server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`)
})

// Schedule scraper to run at 15:00 Kyiv time
cron.schedule(
  '0 15 * * *',
  async () => {
    logger.info('Starting scheduled job scraping...')
    try {
      await setupDatabase()
      await scrapeJobs()
      logger.info('Scheduled job scraping completed')
    } catch (error) {
      logger.error('Scheduled job scraping failed:', error as Error)
    }
  },
  {
    scheduled: true,
    timezone: 'Europe/Kiev',
  }
)

// Initial scrape on startup (optional)
if (process.env.SCRAPE_ON_STARTUP === 'true') {
  setupDatabase()
    .then(() => scrapeJobs())
    .catch((error) => logger.error('Initial scraping failed:', error as Error))
}
