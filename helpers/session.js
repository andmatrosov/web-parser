const fs = require('fs');
const path = require('path');

const COOKIES_PATH = path.join(__dirname,  '../assets/cookies.json');
const LOCAL_STORAGE_PATH = path.join(__dirname, '../assets/localStorage.json');
const SESSION_STORAGE_PATH = path.join(__dirname, '../assets/sessionStorage.json');

async function saveSession(page) {
  try {
    // Сохранение cookies
    const cookies = await page.cookies();
    fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));

    // Сохранение данных LocalStorage
    const localStorageData = await page.evaluate(() => JSON.stringify(localStorage));
    fs.writeFileSync(LOCAL_STORAGE_PATH, localStorageData);

    // Сохранение данных SessionStorage
    const sessionStorageData = await page.evaluate(() => JSON.stringify(sessionStorage));
    fs.writeFileSync(SESSION_STORAGE_PATH, sessionStorageData);

    console.log('Session saved successfully.');
  } catch (e) {
    console.error('Error saving session:', e);
  }
}

async function loadSession(page) {
  try {
    // Загрузка cookies
    if (fs.existsSync(COOKIES_PATH)) {
      const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH));
      await page.setCookie(...cookies);
      console.log('Cookies loaded')
    }

    // Загрузка данных в LocalStorage
    if (fs.existsSync(LOCAL_STORAGE_PATH)) {
      const localStorageData = JSON.parse(fs.readFileSync(LOCAL_STORAGE_PATH));
      await page.evaluate((data) => {
        try {
          for (const [key, value] of Object.entries(data)) {
            localStorage.setItem(key, value);
          }
          console.log('LocalStorage loaded')
        } catch (e) {
          console.error('Error loading localStorage:', e);
        }
      }, localStorageData);
    }

    // Загрузка данных в SessionStorage
    if (fs.existsSync(SESSION_STORAGE_PATH)) {
      const sessionStorageData = JSON.parse(fs.readFileSync(SESSION_STORAGE_PATH));
      await page.evaluate((data) => {
        try {
          for (const [key, value] of Object.entries(data)) {
            sessionStorage.setItem(key, value);
          }
          console.log('SessionStorage loaded')
        } catch (e) {
          console.error('Error loading sessionStorage:', e);
        }
      }, sessionStorageData);
    }

    console.log('Session loaded successfully.');
  } catch (e) {
    console.error('Error loading session:', e);
  }
}

module.exports = {saveSession, loadSession}