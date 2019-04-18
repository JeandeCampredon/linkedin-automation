import { TimeoutError } from 'puppeteer-core/Errors';
import conf from '../conf.json';

const ensureOpenPopupMessage = async (page, open) => {
  await open();

  try {
    await page.waitForSelector('.msg-form__contenteditable', { timeout: conf.UI_LATENCY });
  } catch (e) {
    if (e instanceof TimeoutError) {
      await ensureOpenPopupMessage(page, open);
    } else {
      console.log(e);
    }
  }

  return null;
};

module.exports = async ({ page, open, messageGen }) => {
  let total = 0;
  await ensureOpenPopupMessage(page, open);

  await page.waitFor(conf.NETWORK_LATENCY + conf.UI_LATENCY);
  const previousMessage = await page.$('.msg-s-message-list__event.clearfix');
  const messageToSend = messageGen(previousMessage);

  if (messageToSend) {
    await page.type('.msg-form__contenteditable', messageToSend);

    // await page.click(".msg-form__contenteditable", {clickCount: 3})
    // await page.keyboard.press('Backspace')

    await page.waitForSelector('button.msg-form__send-button.artdeco-button.artdeco-button--1');
    await page.click('button.msg-form__send-button.artdeco-button.artdeco-button--1');

    await page.waitFor(conf.NETWORK_LATENCY);
    total += 1;
  }

  await page.waitForSelector(
    '.msg-overlay-bubble-header__controls > .js-msg-close > li-icon > .artdeco-icon > .small-icon',
  );
  await page.click(
    '.msg-overlay-bubble-header__controls > .js-msg-close > li-icon > .artdeco-icon > .small-icon',
  );

  await page.waitFor(conf.UI_LATENCY);

  return total;
};
