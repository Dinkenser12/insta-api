const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

module.exports = async (req, res) => {
  const { url } = req.query;

  if (!url || !url.includes("instagram.com")) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  try {
    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const videoURL = await page.evaluate(() => {
      const el = document.querySelector('meta[property="og:video"]');
      return el ? el.content : null;
    });

    await browser.close();

    if (!videoURL) {
      return res.status(404).json({ error: "No video found" });
    }

    res.json({ status: true, url: videoURL });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
