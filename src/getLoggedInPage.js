import puppeteer from 'puppeteer';
import login from './login';
import conf from '../conf.json';

export default async function getLoggedInPage(launchConf = {}) {
  const browser = await puppeteer.launch({ headless: false, ...launchConf });
  const page = await browser.newPage();
  await page.setViewport({
    width: conf.WIDTH,
    height: conf.HEIGHT,
  });
  await login(page);
  return page;
}
