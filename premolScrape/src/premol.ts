/*
 * premol.ts
 *
 * function：scraping electron app
 **/

// namespace
import { myConst, myWindows, mySelector, myArrays } from './consts/globalvariables';

// import modules
import { BrowserWindow, app, ipcMain, Tray, Menu, nativeImage } from 'electron'; // electron
import * as path from 'node:path'; // path
import { Scrape } from './class/ElScrapeCore0914'; // scraper
import Dialog from "./class/ElDialog0721"; // logger
import ELLogger from './class/ElLogger'; // logger
import CSV from './class/ElCsv0414'; // csv

/// Variables
let globalRootPath: string; // root path
// production
if (!myConst.DEV_FLG) {
  globalRootPath = path.join(path.resolve(), 'resources');
  // development
} else {
  globalRootPath = path.join(__dirname, '..');
}

/// constants
const CSV_ENCODING: string = 'SJIS'; // csv encoding
const PREMOL_URL: string = 'https://gourmet.suntory.co.jp/search/f__'; // prefecture URL

/// config
// logger
const logger: ELLogger = new ELLogger(myConst.COMPANY_NAME, myConst.APP_NAME, myConst.LOG_LEVEL);
// csv
const csvMaker: CSV = new CSV(CSV_ENCODING, logger);
// dialog
const dialogMaker: Dialog = new Dialog(logger);
// puppeteer scraper
const puppScraper: Scrape = new Scrape(logger);
// desktop path
const dir_home = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"] ?? '';
const dir_desktop = path.join(dir_home, "Desktop");

// init gloabal array
let globalFinalCsvArray: any[] = [];
let globalFinalResultArray: any[] = [];

/*
 main
*/
// mainWindow
let mainWindow: Electron.BrowserWindow;
// isQuiting flg
let isQuiting: boolean;

// create windows
const createWindow = (): void => {
  try {
    // window
    mainWindow = new BrowserWindow({
      width: myWindows.WINDOW_WIDTH, // width
      height: myWindows.WINDOW_HEIGHT, // height
      webPreferences: {
        nodeIntegration: false, // Node.js usable
        contextIsolation: true, // isolate context
        preload: path.join(__dirname, 'preload.js'), // preload
      },
    });

    // hide menu bar
    mainWindow.setMenuBarVisibility(false);
    // index.html load
    mainWindow.loadFile(path.join(globalRootPath, "www", "index.html"));
    // ready
    mainWindow.once('ready-to-show', () => {
      // dev mode
      // mainWindow.webContents.openDevTools();
    });

    // close
    mainWindow.on('close', (event: any): void => {
      // quitting
      if (!isQuiting) {
        // except for apple
        if (process.platform !== 'darwin') {
          // return false
          event.returnValue = false;
        }
      }
    });

    // close
    mainWindow.on('closed', (): void => {
      // destroy window
      mainWindow.destroy();
    });

  } catch (e: unknown) {
    // error
    if (e instanceof Error) {
      // error
      logger.error(`${e.message})`);
    }
  }
}

// enable sandbox
app.enableSandbox();

// ready
app.on('ready', async () => {
  logger.info('app: electron is ready');
  // open window
  createWindow();
  // icon
  const icon: Electron.NativeImage = nativeImage.createFromPath(
    path.join(globalRootPath, "assets", "ico.ico")
  );
  // tray
  const mainTray: Electron.Tray = new Tray(icon);
  // context menu
  const contextMenu: Electron.Menu = Menu.buildFromTemplate([
    // show
    {
      label: 'show', click: () => {
        mainWindow.show();
      }
    },
    // close
    {
      label: 'close', click: () => {
        app.quit();
      }
    }
  ]);
  // set context menu
  mainTray.setContextMenu(contextMenu);
  // reopen
  mainTray.on('double-click', () => mainWindow.show());
});

// when activate
app.on('activate', () => {
  // no open window
  if (BrowserWindow.getAllWindows().length === 0) {
    // reopen window
    createWindow();
  }
});

// when quit
app.on('before-quit', () => {
  logger.info('ipc: quit mode');
  // on quitflg
  isQuiting = true;
});

// when all closed
app.on('window-all-closed', () => {
  logger.info('app: close app');
  // quit app
  app.quit();
});

/*
 IPC
*/
/* page */
ipcMain.on('page', async (_, arg) => {
  try {
    logger.info('ipc: page mode');
    console.log(arg);
    // transfer url
    let url: string;

    // switch on mode
    switch (arg) {
      // exit page
      case 'exit_page':
        // xcept for apple
        if (process.platform !== 'darwin') {
          // quit app
          app.quit();
          return false;
        }
        // clear url
        url = '';
        break;

      // top page
      case 'top_page':
        // set url
        url = 'index.html';
        break;

      // URL page
      case 'url_page':
        // set url
        url = 'url.html';
        break;

      // shop page
      case 'shop_page':
        // set url
        url = 'shop.html';
        break;

      default:
        // clear url
        url = '';
    }
    // transfer
    await mainWindow.loadFile(path.join(globalRootPath, 'www', url));

  } catch (e: unknown) {
    // error
    if (e instanceof Error) {
      // show error message
      logger.error(e.message);
    }
  }
});


// CSV
ipcMain.on('csv', async (event, _) => {
  try {
    logger.info('ipc: csv mode');
    // csv path
    const csvPath: any = await csvMaker.showCSVDialog(mainWindow);
    // get CSV data
    const result: any = await csvMaker.getCsvData(csvPath);
    // send csv list
    event.sender.send('shopinfoCsvlist', result);

  } catch (e: unknown) {
    // error
    if (e instanceof Error) {
      // error
      logger.error(e.message);
    }
  }
});

// scrape url
ipcMain.on('scrapeurl', async (_: any, arg: any) => {
  try {
    logger.info('ipc: scrape url mode');
    // counter
    let counter: number = 0;
    // url list
    let targetShopLinkArray: string[] = [];
    // shot total
    const targetShopTotal: string = '#gourmet_container > div.search_header > div > div.search_header_pageNation > p > span:nth-child(7)';
    // shop links
    const shopLinks: number[] = makeNumberRange(1, 20);

    // loop for links
    for await (const j of shopLinks) {
      // push links array
      targetShopLinkArray.push(`div.search_main_left > div:nth-child(${j}) > a > div > div.search_shop_header_ttl > div.ttl`);
    }
    // initialize
    await puppScraper.init();
    // selector
    const prefUrl: string = PREMOL_URL + String(arg).padStart(2, '0');
    // goto top page
    await puppScraper.doGo(prefUrl);
    logger.debug(`scraping ${prefUrl}`);
    // wait for 1 sec
    await puppScraper.doWaitFor(1000);
    // chack age
    await doAgeChack();
    logger.debug('age checked');
    // wait for 1 sec
    await puppScraper.doWaitFor(1000);

    // url exists
    if (await puppScraper.doCheckSelector(targetShopTotal)) {
      // url
      const tmpTotalNumber: any = await puppScraper.doSingleEval(
        targetShopTotal,
        'innerHTML'
      );
      // remove ,
      const tmpFinalNumber: string = tmpTotalNumber.replace(',', '');
      // total pages
      const totalPageNumber: number = Math.ceil(Number(tmpFinalNumber) / 20);
      // page links
      const pageLinks: number[] = makeNumberRange(0, totalPageNumber);
      logger.debug(`total pages = ${totalPageNumber}`);

      // link collect loop
      for await (const i of pageLinks) {
        try {
          // selector
          const pageNum: string = String(20 * i + 1).padStart(2, '0');
          // page URL
          const pageUrl: string = `${prefUrl}/b__${pageNum}`;
          // goto top
          await puppScraper.doGo(pageUrl);

          // loop shops
          for await (const link of targetShopLinkArray) {
            try {
              // wait for 5 sec
              await puppScraper.doWaitFor(5000);

              // url exists
              if (await puppScraper.doCheckSelector(link)) {
                // clink target link
                await puppScraper.doClick(link);
                // wait for 3 sec
                await puppScraper.doWaitFor(3 * 1000);
                // target URL
                const targetUrl: string = await puppScraper.getUrl();
                // CSV
                globalFinalCsvArray.push({
                  'url': targetUrl,
                });
                logger.debug(targetUrl);
                logger.debug(counter.toString());
                // increment
                counter++;
                // goback
                await puppScraper.doGoBack();

              } else {
                // break
                break;
              }

            } catch (error: unknown) {
              // error
              if (error instanceof Error) {
                // error
                logger.error(error.message);
              }
            }
          }

        } catch (e: unknown) {
          // error
          if (e instanceof Error) {
            // error
            logger.error(e.message);
          }
        }
      }

    } else {
      // error
      throw new Error('no element error');
    }
    // CSV file name
    const nowtime: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, "").slice(0, 14)}_url.csv`;
    // make CSV file
    await csvMaker.makeCsvData(globalFinalCsvArray, myArrays.columns, nowtime);

  } catch (err: unknown) {
    // error
    if (err instanceof Error) {
      // error
      logger.error(err.message);

    }
    // destroy puppeteer
    await puppScraper.doClose();
  }
});

// scrape
ipcMain.on('scrape', async (_: any, arg: any) => {
  try {
    logger.info('ipc: scrape mode');
    // counter
    let counter: number = 0;

    console.log(arg);

    // initialize CSV array
    globalFinalResultArray = [];

    /// selector
    // all selectors
    const premolSelectors: any = {
      shopname: mySelector.targetShopName,
      genre: mySelector.targetShopGenre,
      station: mySelector.targetShopCloseStation,
      budget: mySelector.targetShopBudget,
      shopphone: mySelector.targetPhoneNumber,
      address: mySelector.targetShopAddress,
      businesstime: mySelector.targetShopBusinessTime,
      holiday: mySelector.targetShopHoliday,
      seat: mySelector.targetShopSheet,
    };
    // initialize puppeteer
    await puppScraper.init();

    // loop
    for await (const url of arg) {
      try {
        // shop data
        let myShopObj: any = {
          shopname: '', // shopname
          genre: '', // genre
          station: '', // status
          budget: '', // budget
          shopphone: '', // shopphone
          address: '', // address
          businesstime: '', // business time
          holiday: '', // holiday
          seat: '', // seat
        };
        // goto top
        await puppScraper.doGo(url);
        // wait for 2 sec
        await puppScraper.doWaitFor(2 * 1000);
        // chack age
        await doAgeChack();
        logger.debug('age checked');
        logger.debug(`app: scraping ${url}`);
        // scrape shopname
        const shopnameresult: string = await doScrape(premolSelectors['shopname']);
        // shopname
        myShopObj['shopname'] = shopnameresult;
        // scrape genre
        const genreresult: string = await doScrape(premolSelectors['genre']);
        // genre
        myShopObj['genre'] = genreresult;
        // scrape station
        const stationresult: string = await doScrape(premolSelectors['station']);
        // station
        myShopObj['station'] = stationresult;
        // scrape budget
        const budgetresult: string = await doScrape(premolSelectors['budget']);
        // budget
        myShopObj['budget'] = budgetresult;
        // scrape phone
        const phoneresult: string = await doScrape(premolSelectors['shopphone']);
        // phone
        myShopObj['shopphone'] = phoneresult;
        // scrape address
        const addressresult: string = await doScrape(premolSelectors['address']);
        // address
        myShopObj['address'] = addressresult;
        // scrape businesstime
        const businessresult: string = await doScrape(premolSelectors['businesstime']);
        // check businesstime
        const businessTxt: string = await doCheck(businessresult);
        myShopObj['businesstime'] = businessTxt;
        // scrape businesstime
        const holidayresult: string = await doScrape(premolSelectors['holiday']);
        // holiday
        const holidayTxt: string = await doCheck(holidayresult);
        myShopObj['holiday'] = holidayTxt;
        // scrape seat
        const seatresult: string = await doScrape(premolSelectors['seat']);
        // seat
        const seatTxt: string = await doCheck(seatresult);
        myShopObj['seat'] = seatTxt;
        // increment
        counter++;
        // push into array
        globalFinalResultArray.push(myShopObj);

      } catch (err: unknown) {
        // error
        if (err instanceof Error) {
          // error
          logger.error(err.message);
        }
      }
    }

    // CSV filename
    const nowtime: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, "").slice(0, 14)}.csv`;
    // make CSV
    await csvMaker.makeCsvData(globalFinalResultArray, myArrays.columns, nowtime);
    logger.debug('CSV writing finished');
    // close window
    await puppScraper.doClose();
    // show message
    dialogMaker.showmessage('info', 'scrape finished.');

  } catch (e: unknown) {
    // error
    if (e instanceof Error) {
      // error
      logger.error(e.message);
    }
    // close puppeteer
    await puppScraper.doClose();
  }
});

// pause scraper
ipcMain.on('pause', async (_: any, arg: any) => {
  try {
    logger.info('ipc: pause mode');
    // csv path
    let targetpath: string = '';
    // csv columns
    let targetColumns: string[] = [];
    // csv data array
    let targetCsvArray: any[] = [];
    // show question dialog
    const selected: number = dialogMaker.showQuetion('Q', 'stop', 'app will stop ok？scraped data is written to csv file.');

    // yes
    if (selected == 0) {
      // pause message
      dialogMaker.showmessage('info', 'stopped.');

      // now time
      const nowtime: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, '').slice(0, 14)}`;

      if (arg == 'url') {
        // target csv data
        targetCsvArray = globalFinalCsvArray;
        // csv columns
        targetColumns = myArrays.urlcolumns;
        // csv file name
        targetpath = `${nowtime}_url.csv`;

      } else if (arg == 'shop') {
        // target CSV
        targetCsvArray = globalFinalResultArray;
        // csv columns
        targetColumns = myArrays.columns;
        // csv file name
        targetpath = `${nowtime}.csv`;
      }

      // make CSV
      await csvMaker.makeCsvData(targetCsvArray, targetColumns, targetpath);

    } else {
      return false;
    }

  } catch (e: unknown) {
    // error
    if (e instanceof Error) {
      // error
      logger.error(e.message);
    }
  }
});

// exit app
ipcMain.on('exit', async () => {
  try {
    logger.info('ipc: exit mode');
    // exit app
    await exitApp();

  } catch (e: unknown) {
    // error
    if (e instanceof Error) {
      // error
      logger.error(e.message);
    }
  }
});

// do check
const doCheck = async (word: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // result string
      let tmpResult: string;
      // tag string
      const regex: RegExp = new RegExp('(<([^>]+)>)', 'gi');
      // line breaks
      const retregex: RegExp = new RegExp(/\r?\n/g, 'gi');
      // unnecessary tag
      const noregex: RegExp = new RegExp(/\t/g, 'gi');

      // tag exists
      if (regex.test(word)) {
        tmpResult = word.replace(regex, '');

      } else {
        tmpResult = word;
      }
      // tag exists
      if (retregex.test(tmpResult)) {
        tmpResult = tmpResult.replace(retregex, '');
      }
      // tag exists
      if (noregex.test(tmpResult)) {
        tmpResult = tmpResult.replace(noregex, '');
      }
      // finish
      resolve(tmpResult);

    } catch (e: unknown) {
      // error
      if (e instanceof Error) {
        // error
        logger.error(e.message);
      }
      reject();
    }
  });
}

// do scraping
const doScrape = async (selector: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // url exists
      if (await puppScraper.doCheckSelector(selector)) {
        // url
        const tmpValues: any = await puppScraper.doSingleEval(
          selector,
          'innerHTML'
        );
        // finish
        resolve(tmpValues.trim());

      } else {
        // return empty
        resolve('');
      }

    } catch (e: unknown) {
      // error
      if (e instanceof Error) {
        // error
        logger.error(e.message);
      }
      reject();
    }
  });
}

// do agecheck
const doAgeChack = async (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      // age check selector
      const initCheckYearSelector: string = '#age_check_year';
      const initCheckMonthSelector: string = '#age_check_monthselect';
      const initCheckDateSelector: string = '#age_check_day';
      const initCheckConfirmSelector: string = '#ac_modal_btn > span.jp_txt';

      // birthday
      await puppScraper.doType(initCheckYearSelector, '1980');
      // wait for selector
      await puppScraper.doWaitSelector(initCheckMonthSelector, 1000);
      // birth month
      await puppScraper.doSelect(initCheckMonthSelector, '1');
      // wait for selector
      await puppScraper.doWaitSelector(initCheckDateSelector, 1000);
      // birth date
      await puppScraper.doType(initCheckDateSelector, '1');
      // wait for selector
      await puppScraper.doWaitSelector(initCheckConfirmSelector, 1000);
      // click confim button
      await puppScraper.doClick(initCheckConfirmSelector);

      // finish
      resolve();

    } catch (e: unknown) {
      // error
      if (e instanceof Error) {
        // error
        logger.error(e.message);
      }
      reject();
    }
  });
}

// exit App
const exitApp = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      logger.info('ipc: exit mode');
      // show question dialog
      const selected: number = dialogMaker.showQuetion('Q', 'exit', 'app will exist ok？ scraped data will be trashed.');
      // yes
      if (selected == 0) {
        // close
        app.quit();
        // finish
        resolve();

      } else {
        // error
        throw new Error('exit');
      }

    } catch (e: unknown) {
      // error
      if (e instanceof Error) {
        // error
        logger.error(e.message);
      }
      // reject
      reject();
    }
  });
}

// number array
const makeNumberRange = (start: number, end: number) => [...new Array(end - start).keys()].map(n => n + start);