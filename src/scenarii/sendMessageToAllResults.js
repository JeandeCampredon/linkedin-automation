require('dotenv').config();
import getLoggedInPage from '../getLoggedInPage';
import sendMessagePopup from '../sendMessagePopup';
import applyToAllResults from '../applyToAllResults.js';
import readDataFromResultElement from '../readDataFromResultElement.js';

const sendMessageToAllResults = async (startUrl, messageGen, max = 200) => {
  let totalSent = 0;
  const { browser, page } = await getLoggedInPage();

  await page.goto(startUrl);

  const sendMessagePageItem = async elt => {
    const data = await readDataFromResultElement(elt);
    const button = await elt.$('button');

    totalSent += await sendMessagePopup({
      page,
      open: () => button.click(),
      messageGen: messageGen(data),
    });

    return null;
  };

  await applyToAllResults(page, sendMessagePageItem, () => totalSent > max);

  await browser.close();
};

export default sendMessageToAllResults;
