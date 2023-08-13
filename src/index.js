/* eslint-disable linebreak-style */
/**
 * @file Main file
 * @module edutatar
 * @author Ildar Khuzhiakhmetov <github.com/sxpso>
 * @license MIT
*/

const axios = require('axios');
const cheerio = require('cheerio');

class edutatar {
  constructor(session) {
    this.session = session || null;
  }

  /**
     * Login method
     *
     * Метод авторизации пользователя
     * @param {string} login - Логин пользователя
     * @param {string} password - Пароль пользователя
     * @param {object} proxy - Прокси-сервер (необязательно)
     * @returns {Promise} - В случае успеха возвращается пустой промис и сессия сохраняется
    */
  login = (login, password, proxy) => new Promise((resolve, reject) => {
    if (proxy !== undefined) {
      const HttpsProxyAgent = require('https-proxy-agent');
      axios.defaults.proxy = false;
      axios.defaults.httpsAgent = new HttpsProxyAgent(proxy);
    }
    axios.post('https://edu.tatar.ru/logon', {
      main_login2: login,
      main_password2: password,
    }, {
      headers: {
        Host: 'edu.tatar.ru',
        Connection: 'keep-alive',
        'Content-Length': '48',
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
        'Upgrade-Insecure-Requests': '1',
        Origin: 'https://edu.tatar.ru',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Sec-GPC': '1',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document',
        Referer: 'https://edu.tatar.ru/logon',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 303,
      withCredentials: true,
    }).then((response) => {
      if (response.headers['set-cookie'] !== undefined) {
        this.session = (`${response.headers['set-cookie']}`).split(';')[0];
        resolve();
      } else {
        reject(new Error('Invalid login or password. Check up if data is correct and your IP is Russian'));
      }
    }).catch((error) => {
      reject(error);
    });
  });

  /**
     * Get basic user info such as name, login, position, etc.
     *
     * Возвращает основную информацию о пользователе, такую как имя, логин, должность, и т.д.
     * @returns {Promise} - Возвращает промис с основной информацией о пользователе
  */
  get = () => new Promise((resolve, reject) => {
    this.call('user/anketa')
      .then((anketa) => {
        const body = cheerio.load(anketa);
        const tbody = body('tbody');
        resolve({
          name: tbody.find('tr:nth-child(1) > td:nth-child(2)').text().replace(/[^а-яёА-ЯЁ ]/g, ''),
          login: tbody.find('tr:nth-child(2) > td:nth-child(2)').text().replace(/[^а-яёА-ЯЁ]/g, ''),
          position: tbody.find('tr:nth-child(3) > td:nth-child(2)').text().replace(/[^а-яёА-ЯЁ]/g, ''),
          birthday: tbody.find('tr:nth-child(4) > td:nth-child(2)').text().replace(/[^а-яёА-ЯЁ]/g, ''),
          sex: tbody.find('tr:nth-child(5) > td:nth-child(2)').text().replace(/[^а-яёА-ЯЁ]/g, ''),
          interests: tbody.find('tr:nth-child(6) > td:nth-child(2)').text().replace(/[^а-яёА-ЯЁ]/g, ''),
          subjects: tbody.find('tr:nth-child(7) > td:nth-child(2)').text().replace(/[^а-яёА-ЯЁ]/g, ''),
          extra: tbody.find('tr:nth-child(8) > td:nth-child(2)').text().replace(/[^а-яёА-ЯЁ]/g, ''),
        });
      })
      .catch((error) => {
        reject(error);
      });
  });

  /**
   * Get user's email and password data
   *
   * Возвращает данные почты пользователя
   * @returns {Promise} - Возвращает промис с данными почты пользователя
  */
  getEmailData = () => new Promise((resolve, reject) => {
    this.call('user/anketa')
      .then((anketa) => {
        const body = cheerio.load(anketa);
        resolve({
          login: body("input[name='Login']").attr('value'),
          mail: `${body("input[name='Login']").attr('value')}@edu.tatar.ru`,
          password: body("input[name='Password']").attr('value'),
        });
      })
      .catch((error) => {
        reject(error);
      });
  });

  /**
   * Call any page.
   *
   * Отправить запрос на любую страницу
   * @param {string} path - Путь к странице
   * @param {string} method - Метод запроса (GET, POST, PUT, DELETE, PATCH)
   * @returns {Promise} - Возвращает промис с ответом сервера
  */
  call = (path, method) => new Promise((resolve, reject) => {
    axios({
      method: method || 'GET',
      url: `https://edu.tatar.ru/${path}`,
      headers: {
        Host: 'edu.tatar.ru',
        Cookie: `${this.session}`,
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Sec-GPC': '1',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document',
        Referer: 'https://edu.tatar.ru/',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      withCredentials: true,
    }).then((response) => {
      resolve(response.data);
    }).catch((error) => {
      reject(error);
    });
  });
}

module.exports = { edutatar };
