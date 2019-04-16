const { TimeoutError } = require('puppeteer/Errors');
const { UI_LATENCY, NETWORK_LATENCY } = require('./constants.js');

const ensureOpenPopupMessage = async (page, open) => {
  await open();

  try {
    await page.waitForSelector('.msg-form__contenteditable', { timeout: UI_LATENCY });
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
  await ensureOpenPopupMessage(page, open);

  await page.waitFor(NETWORK_LATENCY + UI_LATENCY);
  const previousMessage = await page.$('.msg-s-message-list__event.clearfix');
  const messageToSend = messageGen(previousMessage);

  if (messageToSend) {
    await page.type('.msg-form__contenteditable', messageGen(previousMessage));

    // await page.click(".msg-form__contenteditable", {clickCount: 3})
    // await page.keyboard.press('Backspace')

    await page.waitForSelector('button.msg-form__send-button.artdeco-button.artdeco-button--1');
    await page.click('button.msg-form__send-button.artdeco-button.artdeco-button--1');

    await page.waitFor(NETWORK_LATENCY);
  }

  await page.waitForSelector(
    '.msg-overlay-bubble-header__controls > .js-msg-close > li-icon > .artdeco-icon > .small-icon',
  );
  await page.click(
    '.msg-overlay-bubble-header__controls > .js-msg-close > li-icon > .artdeco-icon > .small-icon',
  );

  await page.waitFor(UI_LATENCY);

  return null;
};
