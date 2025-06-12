import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) return res.status(400).json({ error: "Missing URL" });

  let browser = null;

  try {
    const executablePath = await chromium.executablePath();

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });

    await page.waitForSelector("video", { timeout: 10000 });

    const videoUrl = await page.$eval("video", (vid) => vid.src);

    await browser.close();

    if (!videoUrl) {
      return res.status(500).json({ error: "Video not found" });
    }

    return res.status(200).json({ status: true, url: videoUrl });
  } catch (err) {
    if (browser) await browser.close();
    return res.status(500).json({ error: err.message });
  }
}
