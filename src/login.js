require('dotenv').config();

export default async page => {
  await page.goto('https://www.linkedin.com/uas/login?trk=guest_homepage-basic_nav-header-signin');

  const inputSelector =
    'html > body > #app__container > main > div > form > div:nth-child(7) > #username';
  await page.waitForSelector(inputSelector);
  await page.type(inputSelector, process.env.USERNAME, { delay: 50 });

  const passwordSelector =
    'html > body > #app__container > main > div > form > div:nth-child(25) > #password';
  await page.waitForSelector(passwordSelector);
  await page.type(passwordSelector, process.env.PASSWORD, { delay: 50 });

  await page.click(
    'html > body > #app__container > main > div > form > div:nth-child(26) > button',
  );

  await page.waitForNavigation();

  return null;
};
