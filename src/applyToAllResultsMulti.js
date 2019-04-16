const { NETWORK_LATENCY } = require('./constants.js');
const autoScroll = require('./autoScroll.js');

async function asyncMap(data, fn, res = []) {
  if (data.length === 0) return res;

  const newResultat = [...res, await fn(data[0])];
  return await asyncMap(data.slice(1), fn, newResultat);
};

async function applyToAllResults(page, fn) {
  await page.waitFor(NETWORK_LATENCY);
  await autoScroll(page);

  const resultItems = await page.$$('li.search-result.search-result__occluded-item.ember-view');
  await asyncMap(resultItems, fn);
};


async function applyToAllResultsMutli(pages, fn) {

  await asyncMap(pages, async page => {
    await page.bringToFront();
    await applyToAllResults(page, fn(page));
  });

};

module.exports = applyToAllResultsMutli;
