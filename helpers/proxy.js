const puppeteer = require("puppeteer");
const proxyChecker = require('proxy-checker');
const {loadSession} = require("./session");
const logger = require("./logger");
const proxyAuth = {
  username: '6YUfqu',
  password: 'X6fda975JG'
};

// http://login:password@host:port
let currentProxyIndex = 0;
let proxyList = [
  'http://2.59.50.123:3000',
  'http://192.144.31.194:3000',
  'http://188.130.211.2:3000',
  'http://45.142.253.164:3000',
  'http://188.130.211.91:3000',
  'http://141.98.134.215:3000',
  'http://185.166.161.2:3000',
  'http://45.89.101.85:3000',
  'http://5.252.28.72:3000',
  'http://45.89.102.185:3000',
];


// Список User-Agent строк
const userAgentList = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/91.0.864.54'
];

// Функция для случайного выбора прокси и User-Agent
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Функция для получения следующего прокси (с ротацией)
async function getNextProxy() {
  const proxy = proxyList[currentProxyIndex];
  currentProxyIndex = (currentProxyIndex + 1) % proxyList.length;
  return proxy;
}

async function launchBrowserWithProxy() {
  try {
    const proxy = await getNextProxy();
    const userAgent = getRandomItem(userAgentList);
    const { username, password } = proxyAuth;

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        `--proxy-server=${proxy}`
      ]
    });

    const page = await browser.newPage();
    await page.setUserAgent(userAgent);
    await page.setViewport({ width: 800, height: 800 });

    // Устанавливаем аутентификацию прокси (если требуется)
    if (proxyAuth) {
      await page.authenticate({
        username,
        password
      });
    }

    // Загружаем сессию
    const sessionLoaded = await loadSession(page);
    if (!sessionLoaded) {
      console.warn('Session could not be loaded. Starting with a fresh session.');
    }

    console.log(`Browser opened with proxy: ${proxy}`);
    return { browser, page };
  } catch (error) {
    console.error('Error launching browser with proxy:', error);
    throw error; // Пробрасываем ошибку дальше, чтобы она могла быть обработана в вызывающем коде
  }
}

// Проверяем все прокси на доступность
async function validateProxies() {
  const validProxies = [];
  for (const proxy of proxyList) {
    const isValid = await checkProxy(proxy);
    if (isValid) {
      validProxies.push(proxy);
      logger.info(`Proxy: ${proxy} — Ok`)
    }
  }
  proxyList = validProxies;
  currentProxyIndex = 0;
}

async function checkProxy(proxy, logged = false) {
  const [host, port] = proxy.replace('http://', '').split(':');

  return new Promise((resolve, reject) => {
    proxyChecker.checkProxy(`${proxyAuth.username}:${proxyAuth.password}@${host}`, port, {
      url: 'http://ya.ru',
    }, function (host, port, ok, statusCode, err) {
      if (ok) {
        if (logged) console.log("\x1b[32m", `Proxy: ${proxy} — OK.`, "\x1b[0m");
        resolve(true);
      } else {
        if (logged) console.log("\x1b[31m", `Proxy: ${proxy} — FUCKING SHIT. REMOVED FROM LIST`, "\x1b[0m");
        // proxyList = proxyList.map(item => item).filter(item => item !== proxy);
        resolve(false);
      }
    });
  });
}

module.exports = {launchBrowserWithProxy, getRandomItem, getNextProxy, validateProxies, checkProxy}