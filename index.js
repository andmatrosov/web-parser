const puppeteer  = require('puppeteer');

// Импорт функций
const {loadSession} = require('./helpers/session');
const { scrapeCarPage } = require('./helpers/scraping');
const { processCarData } = require('./helpers/dataProcessing');
const { validateProxies, getNextProxy, launchBrowserWithProxy} = require('./helpers/proxy');
const logger = require('./helpers/logger');
const {createSheet, saveCarLinks} = require('./helpers/writeFiles');

const refSiteName = 'autospot-used';
const requestOptions = '?bodies=SD,SUV,HB,LB,SW,CP&price_from=450000&price_to=3000000&engine_capacity_to=3&engine_power_to=300&sort=-views_count&limit=12&year_from=2012&year_to=2023&run_to=200000&count_owners=2&conditions=1&mode=0'
let allCarsLinks = ['https://autospot.ru/brands/volkswagen/passat_cm/sedan/used/534503/'];
let carsInfo = [];


const PARSED_PATH = '';
/*
    TODO: Сделать парсинг из файлы
    TODO: Добавить провернку на уникальность ссылок на тачки
    TODO: Понять почему в какой-то момент перебор страниц застревает на одном месте и по кругу гоняет одни и те же страницы
*/

(async () => {
    // await checkProxies(false);
    await validateProxies();
    try {
        if(!PARSED_PATH || PARSED_PATH === '') {
            const { browser, page } = await launchBrowserWithProxy();
            await page.setRequestInterception(true);

            page.on('request', (req) => {
                if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
                    req.abort();
                }
                else {
                    req.continue();
                }
            });

            await page.goto(`https://autospot.ru/used-car/` + requestOptions, { waitUntil: 'networkidle2' });

            console.log('going to catalog page');


            await new Promise(resolve => setTimeout(resolve, 2000));
            // await saveSession(page);

            const pageNumbers = await page.evaluate(() => {
                const paginationList = document.querySelectorAll('.pagination__item');
                return paginationList.length ? paginationList[paginationList.length - 1].innerText : 1;
            });

            //Функция для сбора ссылок в массив
            function setLinkToArr() {
                console.log('copy the links...')
                return new Promise((resolve) => {
                    setTimeout(async () => {
                        let arr = await page.evaluate(() => {
                            let carLinks = Array.from(document.querySelectorAll('.car-card__model-title a'), el => el.getAttribute('href'))
                            return carLinks // Возвращает массив ссылок со страницы
                        })
                        arr.forEach(link => {
                            if(allCarsLinks.indexOf(link)){
                                allCarsLinks.push(link); // Записывает данные из массива ссылок с конкретной страницы, в общий массив ссылок (массивы мои массивы)
                            } else {
                                logger.error(`Дубликат — ${link} уже есть в списке:`);
                            }
                        })
                        resolve();
                        return
                    }, 500);
                });
            };


            console.log(`pagenumbers is ${Number(pageNumbers)}`);

            for (let i = 1; i <= Number(pageNumbers); i++) { //Number(pageNumbers);
                console.log(`going to ${i} page`)
                await setLinkToArr()
                await page
                  .waitForSelector('auto-pagination .mat-focus-indicator.mat-flat-button.mat-button-base.mat-button-custom.button__large', { timeout: 1000 }) // Проверка на то, что на странице есть кнопка "Далее" в навигации
                  .then(async () => {
                      const pageBtn = await page.waitForSelector('auto-pagination .mat-focus-indicator.mat-flat-button.mat-button-base.mat-button-custom.button__large');
                      await pageBtn.click(); // Клик на кнопку "Далее" в навигации, переход на следующую страницу
                      await page.waitForNetworkIdle(); // Ждём завершения запроса
                  })
                  .catch(() => {
                      console.log("can't find a next page selector"); // Если её нет, в консоль падает сообщение, и код работает дальше
                  });
            };

            saveCarLinks(`${refSiteName}-cars`, allCarsLinks)
            logger.info(`Total cars parsed: ${allCarsLinks.length}`);
            console.log('browser closed');
            await browser.close();
        } else {

        }


        if (allCarsLinks.length === 0) throw new Error('Массив пустой');

        for (let i = 0; i < allCarsLinks.length; i += 10) {
            const { browser: carBrowser, page: carPage } = await launchBrowserWithProxy();

            await carPage.setRequestInterception(true);
            carPage.on('request', (req) => {
                if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
                    req.abort();
                }
                else {
                    req.continue();
                }
            });

            const linksBatch = allCarsLinks.slice(i, i + 10);
            for (const carLink of linksBatch) {
                try {
                    const rawCarData = await scrapeCarPage(carPage, carBrowser, carLink);
                    const processedCarData = processCarData(rawCarData);
                    carsInfo.push(processedCarData);
                    logger.info(`[${allCarsLinks.indexOf(carLink) + 1} of ${allCarsLinks.length}] Данные по ${processedCarData.mark} ${processedCarData.model} ${processedCarData.price} успешно обработаны.`);
                } catch (error) {
                    logger.error(`Ошибка при парсинге страницы ${carLink}:`, error);
                }
            }

            await carBrowser.close();
        }

        createSheet(refSiteName, carsInfo);
        logger.info('Данные успешно сохранены в файлы.');
    } catch (error) {
        logger.error('Ошибка при сохранении данных:', error);
        console.log('Ошибка:', error);
    }
})();