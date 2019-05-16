import puppeteer from 'puppeteer-core';
import rimraf from 'rimraf';
import login from './login';
import conf from '../conf.json';

export default async function getLoggedInPage(launchConf = {}) {
  const envConf = {
    headless: false,
    executablePath: process.env.EXE_PATH,
  }
  if (process.env.USER_DATA_DIR) {
    envConf.userDataDir = process.env.USER_DATA_DIR;
    rimraf(process.env.USER_DATA_DIR_WSL)
  }
  const browser = await puppeteer.launch({
    ...envConf,
    ...launchConf,
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: conf.WIDTH,
    height: conf.HEIGHT,
  });
  await login(page);
  return { browser, page };
}
