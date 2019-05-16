require('dotenv').config();
import getLoggedInPage from './getLoggedInPage';
import conf from '../conf.json';
import autoScroll from './autoScroll.js';

const oldRegex = /\s(week|month|semaine|mois)s?\s/;

const getOldElements = async page => {
  const elements = await page.$$('ul.mn-invitation-list li');
  const verifiedElements = await Promise.all(
    elements.map(async elt => {
      const time = await elt.$eval('time', t => t.innerText);
      return time.match(oldRegex) ? elt : null;
    }),
  );
  return verifiedElements.filter(x => x);
};

const withdrawOldInvitationsFromPage = async page => {
  await autoScroll(page);
  const oldElements = await getOldElements(page);

  if (oldElements.length === 0) return;

  await Promise.all(
    oldElements.map(async elt => {
      await elt.$eval('input', i => i.click());
    }),
  );
  const button = await page.$('.mn-list-toolbar__right-button button');
  await button.click();
  await page.waitFor(conf.UI_LATENCY + conf.NETWORK_LATENCY);

  await withdrawOldInvitationsFromPage(page);
};

const withdrawOldInvitationsFromAllPages = async page => {
  await withdrawOldInvitationsFromPage(page);
  const currentURL = page.url();

  try {
    page.$eval('.mn-invitation-pagination', list => list.lastElementChild.click());
    await page.waitForNavigation({ timeout: conf.UI_LATENCY + conf.NETWORK_LATENCY });
  } catch (e) {
    console.log(e);
    return;
  }

  await withdrawOldInvitationsFromAllPages();
};

const withdrawOldInvitations = async page => {
  await page.goto('https://www.linkedin.com/mynetwork/invitation-manager/sent/');

  await withdrawOldInvitationsFromAllPages(page);
};

export default withdrawOldInvitations;
