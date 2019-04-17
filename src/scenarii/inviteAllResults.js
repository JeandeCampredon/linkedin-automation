import conf from '../../conf.json';

import { TimeoutError } from 'puppeteer/Errors';
import getLoggedInPage from '../getLoggedInPage';
import applyToAllResults from '../applyToAllResults';

const ensureFindConfirmButton = async (page, open, counter = 0) => {
  if (counter > 3) return null;
  await open();

  try {
    return await page.waitForSelector('.artdeco-button.artdeco-button--3.ml1', {
      timeout: conf.UI_LATENCY,
    });
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
  let total = 0;
  const button = await elt.$(
    '.search-result__action-button.search-result__actions--primary.artdeco-button.artdeco-button--default.artdeco-button--2.artdeco-button--secondary',
  );
  const innerText = await page.evaluate(b => b && b.innerText.toLowerCase().trim(), button);

  if (innerText !== 'connect' || button.disabled) return null;

  const confirmButton = await ensureFindConfirmButton(page, () => button.click());

  if (!confirmButton) return null;

  if (await page.evaluate(b => b && b.disabled, confirmButton)) {
    const closeButton = await page.waitFor('send-invite__cancel-btn');
    await closeButton.click();
  } else {
    await confirmButton.click();
    total += 1;
  }

  await page.waitFor(conf.UI_LATENCY);

  return total;
};

const inviteAllResult = async (url, max = 300) => {
  let totalSent = 0;
  const page = await getLoggedInPage();

  await page.goto(url);
  const inviteCount = async (...arg) => {
    const res = await invite(page)(...arg);
    totalSent += res || 0;
    return res;
  };

  await applyToAllResults(page, inviteCount, async () => {
    try {
      await page.waitForSelector('artdeco-modal-overlay', { timeout: conf.UI_LATENCY });
    } catch (e) {
      return false;
    }

    return true;
  });

  await new Promise(res => setTimeout(res, 5000));

  await browser.close();
};

export default inviteAllResult;
