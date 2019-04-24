import { TimeoutError } from 'puppeteer-core/Errors';
import clipboardy from 'clipboardy';
import conf from '../conf.json';

const ensureOpenPopupMessage = async (page, open) => {
  await open();

  const popupClassName = '.msg-overlay-conversation-bubble';
  let element;

  try {
    await page.waitForSelector(popupClassName, { timeout: conf.UI_LATENCY });
    const popupElements = await page.$$(popupClassName).catch(() => []);

    if (popupElements.length != 1) {
      await Promise.all(
        popupElements.map(async elt => {
          const button = await elt.$('button.js-msg-close');
          await button.click();
        }),
      );

      return ensureOpenPopupMessage(page, open);
    }

    element = popupElements[0];
  } catch (e) {
    if (e instanceof TimeoutError) {
      return ensureOpenPopupMessage(page, open);
    }

    console.log(e);
    return element;
  }

  return element;
};

module.exports = async ({ page, open, messageGen }) => {
  let total = 0;
  const popupElt = await ensureOpenPopupMessage(page, open);

  await page.waitFor(conf.NETWORK_LATENCY + conf.UI_LATENCY);
  const previousMessage = await popupElt.$('.msg-s-message-list__event.clearfix');
  const messageToSend = await messageGen(previousMessage);

  if (messageToSend) {
    const isMac = await page.evaluate(() => /Mac|iPod|iPhone|iPad/.test(window.navigator.platform));

    if (isMac) {
      await page.type('.msg-form__contenteditable', messageToSend);
    } else {
      clipboardy.writeSync(messageToSend);
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyV');
      await page.keyboard.up('Control');
    }

    const sendButton = await popupElt.$(
      'button.msg-form__send-button.artdeco-button.artdeco-button--1',
    );
    await sendButton.click();

    await page.waitFor(conf.NETWORK_LATENCY);
    total += 1;
  }

  const closeButton = await popupElt.$('button.js-msg-close');
  await closeButton.click();

  await page.waitFor(conf.UI_LATENCY);

  return total;
};
