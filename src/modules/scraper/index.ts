import * as puppeteer from 'puppeteer'
import { PrismaClient } from '@prisma/client'
import { JobListing } from './types/job.types'
import transformJobData from './utils/transform'
import { setupBrowser } from './utils/browser'
import { JOBS_PER_PAGE } from './constants'
import dotenv from 'dotenv'
import { parse } from 'date-fns'

dotenv.config()

class JobScraper {
  private prisma: PrismaClient
  private browser: puppeteer.Browser | null = null
  private page: puppeteer.Page | null = null

  constructor() {
    this.prisma = new PrismaClient()
  }

  private async initialize() {
    const { browser, page } = await setupBrowser()
    this.browser = browser
    this.page = page

    const sessionId = process.env.DJINNI_SESSION_ID
    if (!sessionId) {
      throw new Error('DJINNI_SESSION_ID is not set')
    }

    // Set initial cookies and configuration
    await page.setCookie({
      name: 'sessionid',
      value: sessionId,
      domain: '.djinni.co',
    })
  }

  private async randomDelay() {
    const delay = Math.random() * 15000
    console.log(`Waiting for ${delay.toFixed(2)} ms before next request`)
    await new Promise((resolve) => setTimeout(resolve, delay))
  }

  private async scrapeJobListings(page: puppeteer.Page, technologyId: number) {
    const successfulJobs: JobListing[] = []
    const failedJobs: string[] = []

    try {
      const jobElements = await page.$$('main > ul.list-jobs > li')

      for (const jobElement of jobElements) {
        try {
          // Extract job ID
          const id = await jobElement.evaluate((el) =>
            el.id.replace('job-item-', '')
          )

          // Extract company info
          const company = await jobElement.evaluate((el) => {
            const companyLink = el.querySelector('a[href^="/jobs/?company="]')
            const logoImg = el.querySelector(
              '.userpic-image_img'
            ) as HTMLImageElement
            return {
              name: companyLink?.textContent?.trim() || '',
              logo: logoImg?.src || undefined,
            }
          })

          // Extract statistics with raw date string
          const statistics = await jobElement.evaluate((el) => {
            const viewsText =
              el.querySelector('span.text-nowrap')?.textContent || '0 views'
            const applicationsText =
              el.querySelectorAll('span.text-nowrap')[1]?.textContent ||
              '0 applications'
            const postedAtText =
              el
                .querySelector('span[data-original-title]')
                ?.getAttribute('data-original-title') || ''

            return {
              views: parseInt(viewsText.match(/\d+/)?.[0] || '0'),
              applications: parseInt(applicationsText.match(/\d+/)?.[0] || '0'),
              postedAtText, // Return raw text
            }
          })

          // Parse date outside of evaluate
          const postedAt = statistics.postedAtText
            ? parse(statistics.postedAtText, 'HH:mm dd.MM.yyyy', new Date())
            : new Date()

          // Extract position info
          const position = await jobElement.evaluate((el) => {
            const title =
              el.querySelector('.job-item__title-link')?.textContent?.trim() ||
              ''
            const salary = el
              .querySelector('.text-success')
              ?.textContent?.trim()
            return { title, salary }
          })

          // Extract workplace info
          const workplaceInfo = await jobElement.evaluate((el) => {
            const locationEl = el.querySelector('.location-text')
            const experienceEl = Array.from(
              el.querySelectorAll('.text-nowrap')
            ).find((el) => el.textContent?.includes('years of experience'))
            const englishEl = Array.from(
              el.querySelectorAll('.text-nowrap')
            ).find((el) => el.textContent?.includes('-Intermediate'))
            const isRemote = Array.from(
              el.querySelectorAll('.text-nowrap')
            ).some((el) => el.textContent?.includes('Full Remote'))

            return {
              remote: isRemote,
              location: locationEl?.textContent?.trim() || '',
              experienceYears: experienceEl?.textContent?.trim() || '',
              englishLevel: englishEl?.textContent?.trim() || '',
            }
          })

          // Extract full description
          const description = await jobElement.evaluate(
            (el) =>
              el.querySelector('.js-original-text')?.textContent?.trim() || ''
          )

          const job: JobListing = {
            jobId: id,
            company,
            statistics: {
              ...statistics,
              postedAt, // Use parsed date
            },
            position,
            workplaceInfo,
            description,
            technologyId,
          }

          successfulJobs.push(job)
        } catch (error) {
          console.error(`Error scraping individual job: ${error}`)
          failedJobs.push(await jobElement.evaluate((el) => el.outerHTML))
        }
      }
    } catch (error) {
      console.error(`Error in scrapeJobListings: ${error}`)
    }

    return { successfulJobs, failedJobs }
  }

  private async getTotalPages(keyword: string): Promise<number> {
    try {
      const url = `https://djinni.co/jobs/?primary_keyword=${keyword}&region=UKR`

      // Navigate to the page and wait for content to load
      await this.page?.goto(url, {
        waitUntil: 'networkidle0', // Wait until network is idle
        timeout: 30000, // 30 seconds timeout
      })

      // Wait for the specific element to be present
      await this.page?.waitForSelector('h1 span.text-muted', {
        timeout: 5000,
      })

      // Get the total jobs count
      const totalJobsText = await this.page?.$eval(
        'h1 span.text-muted',
        (el) => el.textContent
      )

      // For debugging
      console.log('Total jobs text:', totalJobsText)

      const totalJobs = parseInt(totalJobsText?.match(/\d+/)?.[0] || '15', 10)
      return Math.ceil(totalJobs / JOBS_PER_PAGE)
    } catch (error) {
      console.warn(
        `Could not find job count for ${keyword}, defaulting to one page. Error: ${error}`
      )
      return 1
    }
  }

  private async processTechnology(keyword: string, technologyId: number) {
    try {
      const baseUrl = `https://djinni.co/jobs/?primary_keyword=${keyword}&region=UKR`
      const totalPages = await this.getTotalPages(keyword)
      console.log(baseUrl)
      console.log(`Processing ${keyword}: ${totalPages} pages found`)

      for (let page = 1; page <= totalPages; page++) {
        try {
          await this.randomDelay()
          await this.page?.goto(`${baseUrl}&page=${page}`)
          const results = await this.scrapeJobListings(this.page!, technologyId)

          if (results.successfulJobs.length > 0) {
            await this.prisma.job.createMany({
              data: results.successfulJobs.map((job) => transformJobData(job)),
              skipDuplicates: true,
            })
          }

          console.log(
            `Page ${page}/${totalPages}: ${results.successfulJobs.length} succeeded, ${results.failedJobs.length} failed`
          )
        } catch (error) {
          console.error(
            `Error processing page ${page} for ${keyword}: ${error}`
          )
        }
      }
    } catch (error) {
      console.error(`Error processing technology ${keyword}: ${error}`)
    }
  }

  public async start() {
    try {
      await this.initialize()

      const technologies = await this.prisma.technology.findMany({
        select: { id: true, djinniKeyword: true },
      })

      for (const { djinniKeyword, id } of technologies) {
        await this.randomDelay()
        await this.processTechnology(djinniKeyword, id)
      }
    } catch (error) {
      console.error('Scraper error:', error)
    } finally {
      await this.browser?.close()
      await this.prisma.$disconnect()
    }
  }
}

// Export an instance of the scraper
const scraper = new JobScraper()
export default scraper.start.bind(scraper)
