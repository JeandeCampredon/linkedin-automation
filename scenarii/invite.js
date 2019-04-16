const puppeteer = require('puppeteer');
const login = require('../src/login');
require('dotenv').config();
const applyToAllResults = require('../src/applyToAllResultsMulti.js');
const { UI_LATENCY } = require('../src/constants.js');
const { TimeoutError } = require('puppeteer/Errors');

const ensureFindConfirmButton = async (page, open, counter = 0) => {
  if (counter > 3) return null;
  await open();

  try {
    return await page.waitForSelector('.artdeco-button.artdeco-button--3.ml1', { timeout: UI_LATENCY });
  } catch (e) {
    if (e instanceof TimeoutError) {
      return await ensureFindConfirmButton(page, open, counter + 1);
    } else {
      console.log(e);
    }
  }

  return null;
};

const invite = page => async elt => {
  const button = await elt.$('.search-result__action-button.search-result__actions--primary.artdeco-button.artdeco-button--default.artdeco-button--2.artdeco-button--secondary');
  const innerText =  await page.evaluate(b => b && b.innerText.toLowerCase().trim(), button)

  if (!button || innerText !== 'connect' || button.disabled) return null;

  const confirmButton = await ensureFindConfirmButton(page, () => button.click());

  if (!confirmButton) return null;

  await confirmButton.click();

  await page.waitFor(UI_LATENCY);

  return null;
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1020 });
  await login(page);

  const url = 'https://www.linkedin.com/search/results/people/?facetGeoRegion=%5B%22fr%3A5211%22%5D&facetNetwork=%5B%22S%22%2C%22O%22%5D&keywords=dev%20web&origin=GLOBAL_SEARCH_HEADER';
  await page.goto(url);
  const pages = await Promise.all(
    Array(30).fill(0).map(
      async (_, index) => {
        const newPage = await browser.newPage();
        await newPage.setViewport({ width: 1920, height: 1020 });
        await newPage.goto(`${url}&page=${index+2}`)
        return newPage
      }
    )
  )

  await applyToAllResults([page, ...pages], invite);

  await new Promise(res => setTimeout(res, 5000));

  await browser.close();
})();
