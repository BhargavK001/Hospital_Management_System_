const puppeteer = require("puppeteer");
const logger = require("./logger");

let browser = null;

const initBrowser = async () => {
  if (!browser || !browser.isConnected()) {
    logger.info("Launching new Puppeteer browser instance...");
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Memory optimization
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote', 
        '--disable-gpu'
      ]
    });

    browser.on('disconnected', () => {
      logger.warn("Puppeteer browser disconnected.");
      browser = null;
    });
  }
  return browser;
};

/**
 * Generates a PDF buffer from HTML content using a shared browser instance.
 * @param {string} htmlContent - The HTML string to render.
 * @returns {Promise<Buffer>} - The generated PDF buffer.
 */
const generatePdf = async (htmlContent) => {
  const browserInstance = await initBrowser();
  const page = await browserInstance.newPage();

  try {
    // Set content and wait for network idle to ensure fonts load
    // Optimization: 'networkidle0' waits for 0 network connections for 500ms
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' }
    });

    return pdfBuffer;
  } catch (error) {
    logger.error("Error generating PDF page", { error: error.message });
    // If page crashes, we might want to recycle the browser in extreme cases, 
    // but usually closing the page is enough.
    throw error;
  } finally {
    if (page) await page.close();
  }
};

// Graceful shutdown hook
process.on('SIGINT', async () => {
  if (browser) await browser.close();
  process.exit();
});

module.exports = { generatePdf };
