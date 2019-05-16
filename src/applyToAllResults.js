import conf from '../conf.json';
import autoScroll from './autoScroll.js';

async function asyncMap(data, fn, res = []) {
  if (data.length === 0) return res;

  const newResultat = [...res, await fn(data[0])];
  return await asyncMap(data.slice(1), fn, newResultat);
}

async function applyToAllResults(page, fn, exitCondition) {
  await page.waitFor(conf.NETWORK_LATENCY);
  await autoScroll(page);

  const resultItems = await page.$$('li.search-result.search-result__occluded-item.ember-view');
  await asyncMap(resultItems, fn);

  const nextButtonSelector =
    'button.artdeco-pagination__button.artdeco-pagination__button--next.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.artdeco-button--1.artdeco-button--tertiary.ember-view';
  const nextButton = await page.$(nextButtonSelector);
  const nextButtonIsDisabled =
    nextButton && (await page.$eval(nextButtonSelector, button => button.disabled));

  if (!nextButton || nextButtonIsDisabled || (exitCondition && (await exitCondition())))
    return null;

  const navigationPromise = page.waitForNavigation({
    timeout: conf.UI_LATENCY + conf.NETWORK_LATENCY,
  });
  nextButton.click();

  try {
    await navigationPromise;
  } catch (e) {
    console.log(e);
    return;
  }

  return applyToAllResults(page, fn, exitCondition);
}

export default applyToAllResults;
