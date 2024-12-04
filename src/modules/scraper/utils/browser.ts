import * as puppeteer from 'puppeteer'

export async function setupBrowser() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()

  // Set default timeout
  page.setDefaultTimeout(30000)

  // Set viewport
  await page.setViewport({ width: 1280, height: 800 })

  return { browser, page }
}
