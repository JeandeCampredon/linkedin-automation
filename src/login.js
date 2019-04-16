module.exports = async page => {
  await page.goto('https://www.linkedin.com/');

  await page.waitForSelector(
    '.global-wrapper > .header > .wrapper > .login-form > #login-password',
  );
  await page.type(
    '.global-wrapper > .header > .wrapper > .login-form > #login-email',
    process.env.USERNAME,
    {delay: 50}
  );

  await page.waitForSelector(
    '.global-wrapper > .header > .wrapper > .login-form > #login-password',
  );
  await page.type(
    '.global-wrapper > .header > .wrapper > .login-form > #login-password',
    process.env.PASSWORD,
    {delay: 50}
  );

  await page.waitForSelector('.global-wrapper > .header > .wrapper > .login-form > #login-submit');
  await page.click('.global-wrapper > .header > .wrapper > .login-form > #login-submit');

  await page.waitForNavigation();

  return null;
};
