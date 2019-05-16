export default async function autoScroll(page){
  await page.evaluate(async () => {
      window.scrollTo(0, 0);
      await new Promise((resolve, reject) => {
          var totalHeight = 0;
          var distance = 200;
          var timer = setInterval(() => {
              var scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;

              if(totalHeight >= scrollHeight){
                  clearInterval(timer);
                  resolve();
              }
          }, 100);
      });
  });
}
