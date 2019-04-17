import conf from '../conf.json';
import autoScroll from './autoScroll.js';

async function asyncMap(data, fn, res = []) {
  if (data.length === 0) return res;

  const newResultat = [...res, await fn(data[0])];
  return await asyncMap(data.slice(1), fn, newResultat);
}

async function applyToAllResults(page, fn, exitCondition) {
  await page.waitFor(conf.NETWORK_LATENCY);
  console.log(page.url());
  await autoScroll(page);

  const resultItems = await page.$$('li.search-result.search-result__occluded-item.ember-view');
  await asyncMap(resultItems, fn);

  const nextButton = await page.$(
    'button.artdeco-pagination__button.artdeco-pagination__button--next.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.artdeco-button--1.artdeco-button--tertiary.ember-view',
  );

  if (!nextButton || (exitCondition && (await exitCondition()))) return null;

  nextButton.click();
  return applyToAllResults(page, fn);
}

export default applyToAllResults;
