import puppeteer from "puppeteer-extra"


import 'puppeteer-extra-plugin-stealth/evasions/chrome.app';
import 'puppeteer-extra-plugin-stealth/evasions/chrome.csi';
import 'puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes';
import 'puppeteer-extra-plugin-stealth/evasions/chrome.runtime';
import 'puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow';
import 'puppeteer-extra-plugin-stealth/evasions/media.codecs';
import 'puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency';
import 'puppeteer-extra-plugin-stealth/evasions/navigator.languages';
import 'puppeteer-extra-plugin-stealth/evasions/navigator.permissions';
import 'puppeteer-extra-plugin-stealth/evasions/navigator.plugins';
import 'puppeteer-extra-plugin-stealth/evasions/navigator.vendor';
import 'puppeteer-extra-plugin-stealth/evasions/navigator.webdriver';
import 'puppeteer-extra-plugin-stealth/evasions/sourceurl';
import 'puppeteer-extra-plugin-stealth/evasions/user-agent-override';
import 'puppeteer-extra-plugin-stealth/evasions/webgl.vendor';
import 'puppeteer-extra-plugin-stealth/evasions/window.outerdimensions';
import 'puppeteer-extra-plugin-stealth/evasions/defaultArgs';
import 'puppeteer-extra-plugin-user-preferences';
// Enhanced version of Puppeteer for additional functionality
import { NextRequest, NextResponse } from "next/server";
// Import and use stealth plugin to prevent detection of the browser automation
import StealthPlugin from "puppeteer-extra-plugin-stealth"
puppeteer.use(StealthPlugin());


export async function POST(request) {
  console.log("hello")
  try {
    const reqBody = await request.json();
    const { country, cityName, keyword } = reqBody;
    console.log(reqBody);
    const browser = await puppeteer.launch({
      headless: true,
      
      // args: [`--disable-gpu`, `--disable-setuid-sandbox`, `--no-sandbox`, `--no-zygote`],
      // args: [`--no-sandbox`, `--headless`, `--disable-gpu`, `--disable-dev-shm-usage`],
       // Run browser in headless mode (no UI)
      //args: [`--proxy-server=${newProxyUrl}`], // Use the anonymized proxy

    });
    const page = await browser.newPage();
    const searchParams = `${country}+${cityName}+${keyword}`
  // Navigate to Google Maps and search for the keyword
    await page.goto(`https://www.google.com/maps/search/${searchParams}/`);

    try {
      const acceptCookiesSelector = "form:nth-child(2)";
      await page.waitForSelector(acceptCookiesSelector, { timeout: 5000 });
      await page.click(acceptCookiesSelector);
    } catch (error) {
      // If the selector is not found or times out, catch the error and continue
    }
    
    await page.evaluate(async () => {
      const searchResultsSelector = 'div[role="feed"]';
      const wrapper = document.querySelector(searchResultsSelector);
  
      await new Promise((resolve, reject) => {
        var totalHeight = 0;
        var distance = 1000; // How much to scroll each time
        var scrollDelay = 3000; // Wait time between scrolls
  
        var timer = setInterval(async () => {
          var scrollHeightBefore = wrapper.scrollHeight;
          wrapper.scrollBy(0, distance);
          totalHeight += distance;
  
          // If we've scrolled to the bottom, wait, then check if more content loaded
          if (totalHeight >= scrollHeightBefore) {
            totalHeight = 0;
            await new Promise((resolve) => setTimeout(resolve, scrollDelay));
  
            var scrollHeightAfter = wrapper.scrollHeight;
  
            // If no new content, stop scrolling and finish
            if (scrollHeightAfter > scrollHeightBefore) {
              return;
            } else {
              clearInterval(timer);
              resolve();
            }
          }
        }, 200); // Interval time between each scroll
      });
    });
  
    // Extract data from the loaded search results
    const results = await page.evaluate(() => {
      const items = Array.from(
        document.querySelectorAll('div[role="feed"] > div > div[jsaction]')
      );
  
      return items.map((item) => {
        let data = {};
  
        // Extract the title, link, and website from each search result, handling errors gracefully
        try {
          data.title = item.querySelector(".fontHeadlineSmall").textContent;
        } catch (error) {}
  
        try {
          data.link = item.querySelector("a").getAttribute("href");
        } catch (error) {}
  
        try {
          data.website = item
            .querySelector('[data-value="Website"]')
            .getAttribute("href");
        } catch (error) {}
  
        // Extract the rating and number of reviews
        try {
          const ratingText = item
            .querySelector('.fontBodyMedium > span[role="img"]')
            .getAttribute("aria-label")
            .split(" ")
            .map((x) => x.replace(",", "."))
            .map(parseFloat)
            .filter((x) => !isNaN(x));
  
          data.stars = ratingText[0];
          data.reviews = ratingText[1];
        } catch (error) {}
  
        // Extract phone numbers from the text, using regex to match formats
        try {
          const textContent = item.innerText;
          const phoneRegex =
            /((\+?\d{1,2}[ -]?)?(\(?\d{3}\)?[ -]?\d{3,4}[ -]?\d{4}|\(?\d{2,3}\)?[ -]?\d{2,3}[ -]?\d{2,3}[ -]?\d{2,3}))/g;
  
          const matches = [...textContent.matchAll(phoneRegex)];
          let phoneNumbers = matches
            .map((match) => match[0])
            .filter((phone) => (phone.match(/\d/g) || []).length >= 10);
  
          let phoneNumber = phoneNumbers.length > 0 ? phoneNumbers[0] : null;
          if (phoneNumber) {
            phoneNumber = phoneNumber.replace(/[ -]/g, "");
          }
  
          data.phone = phoneNumber;
        } catch (error) {}
  
        return data; // Return the extracted data for each item
      });
    });
  
    // Filter out results without titles and write them to a file
    const filteredResults = results.filter((result) => result.title);
    
    console.log("Completed"); // Log completion message
    // return res.json(filteredResults)
    
    await browser.close()

    return NextResponse.json(filteredResults, {status: 200})
  } catch (error) {
    console.log(error.message)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

