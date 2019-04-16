const puppeteer = require('puppeteer');
const login = require('../src/login');
const sendMessagePopup = require('../src/sendMessagePopup');
require('dotenv').config();
const applyToAllResults = require('../src/applyToAllResults.js');

const genericMessage = fn => `Bonjour${fn ? ` ${fn[0].toUpperCase()}${fn.slice(1)}` : ''},

Je suis Lead Dev de la société WeAssur opérant la plateforme AssurVisor:

  https://assurvisor.co/home

Depuis le début de l'année, nous animons un Meetup afin de fédérer la communauté des startupers et développeurs sur Aix en Provence:

  Aix Talks - https://aixtalks.com/

Le prochain est dédié au devops et se déroule jeudi 25 avril.

  http://meetu.ps/e/Gkw3c/tggDm/f

Qui plus est nous ouvrons une nouvelle formation pour la programmation web avec des programmes complets et d’autres sur-mesure :

  DigitalTrainingJS - http://digitaltrainingjs.com/ - maîtriser les outils du développement web essentiels à votre essor.

Au plaisir de vous rencontrer,
Jean de Campredon`;

const sendMessagePageItem = page => async elt => {
  const spanName = await elt.$('span.name.actor-name');
  const name =  await page.evaluate(b => b && b.innerText.toLowerCase().trim(), spanName)
  const firstName = name && name.split(/\s/)[0];
  console.log(name, firstName);
  const button = await elt.$('button');

  await sendMessagePopup({
    page,
    open: () => button.click(),
    messageGen: previousMessage => (previousMessage ? null : genericMessage(firstName)),
  });

  return null;
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1020 });
  await login(page);

  await page.goto(
    'https://www.linkedin.com/search/results/people/?facetGeoRegion=%5B%22fr%3A5211%22%5D&facetNetwork=%5B%22F%22%5D&origin=GLOBAL_SEARCH_HEADER&page=32',
  );

  await applyToAllResults(page, sendMessagePageItem(page));

  await new Promise(res => setTimeout(res, 5000));

  await browser.close();
})();
