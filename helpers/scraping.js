// helpers/scraping.js

const puppeteer = require('puppeteer');
const { getNextProxy, launchBrowserWithProxy } = require('./proxy');

async function scrapeCarPage(page, browser, url) {

  await page.goto(url, { waitUntil: 'networkidle2' });


  const carData = await page.evaluate((carLink) => {
    const getTextContent = selector => document.querySelector(selector)?.textContent.trim().toString() || '';

    let mark = getTextContent('.offer-used-container__car-title').split(' ')[0];
    let model = getTextContent('.offer-used-container__car-title').split(' ').slice(1).join(' ');
    let price = getTextContent('.offer-lower-price__price-big') || getTextContent('.offer-lower-price__price-new-big');
    let carInfo = Array.from(document.querySelectorAll('.offer-used-general-info__item'));
    let carImg = Array.from(document.querySelectorAll('.slick-slide:not(.slick-cloned) img.gallery__big-item-img'), img => img.getAttribute('src'));
    console.log(`Price: ${price}`)
    const carData = {
      carLink,
      mark,
      model,
      price,
      run: '',
      year: '',
      horsePower: '',
      engine: '',
      bodyType: '',
      color: '',
      transmission: '',
      displacement: '',
      fuel: '',
      driveType: '',
      images: carImg.join(', ')
    }

    carInfo.forEach(item => {
      const titleElement = item.querySelector('.offer-used-general-info__name');
      const valueElement = item.querySelector('.offer-used-general-info__value');
      const title = titleElement ? titleElement.innerText.trim() : '';
      const value = valueElement ? valueElement.innerText.trim() : '';
      switch (title) {
        case "Пробег":
          carData.run = value || '';
          break;
        case "Кузов":
          carData.bodyType = value || ''
          break;
        case "Двигатель":
          carData.engine = value.split(',')[0]?.trim() || '';
          carData.displacement = value.split(',')[1]?.trim() || '';
          carData.horsePower = value.split(',')[2]?.trim() || '';
          break;
        case "Коробка":
          carData.transmission = value.split(',')[0]?.trim() || '';
          break;
        case "Привод":
          carData.driveType = value || '';
          break;
        case "Расход топлива, л":
          carData.fuel = value.split(' ')[0];
          break;
        case "Год выпуска":
          carData.year = value || '';
          break;
        case "Цвет":
          carData.color = value || '';
          break
      }
    });

    return carData;
  }, url);

  // await browser.close();
  return carData;
}

module.exports = { scrapeCarPage };