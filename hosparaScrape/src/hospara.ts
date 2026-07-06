/*
 * hospara.ts
 *
 * function：scraping hospara app
 **/

// namespace
import { myConst, pageSelector, myProperties, myWindows, mySelector } from './consts/globalvariables';

// import modules
import { BrowserWindow, app, ipcMain, Tray, Menu, nativeImage } from 'electron'; // electron
import * as path from 'node:path'; // path
import { Scrape } from './class/ElScrape0804'; // scraper
import Dialog from './class/ElDialog0721'; // dilog
import Logger from './class/ElLogger'; // logger
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
// loggeer instance
const logger: Logger = new Logger(myConst.COMPANY_NAME, myConst.APP_NAME, myConst.LOG_LEVEL);
// csv
const csvMaker: CSV = new CSV(myConst.CSV_ENCODING, logger);
// dialog
const dialogMaker: Dialog = new Dialog(logger);
// scraper
const puppScraper: Scrape = new Scrape(logger);

// desktop path
const dir_home: string =
  process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'] ?? '';
const dir_desktop: string = path.join(dir_home, 'Desktop');

/*
 main
*/
// mainWindow
let mainWindow: Electron.BrowserWindow;
// isQuiting flg
let isQuiting: boolean;
// urls array
let finalResultArray: any[] = [];

// create window
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
    // load index.html
    mainWindow.loadFile(path.join(globalRootPath, 'www', 'index.html'));
    // ready
    mainWindow.once('ready-to-show', () => {
      if (!app.isPackaged) {
        // dev mode
        mainWindow.webContents.openDevTools();
      }
    });

    // close
    mainWindow.on('close', (event: any): void => {
      // quiting
      if (!isQuiting) {
        // except for apple
        if (process.platform !== 'darwin') {
          // false
          event.returnValue = false;
        }
      }
    });

    // closed
    mainWindow.on('closed', (): void => {
      // destroy window
      mainWindow.destroy();
    });

  } catch (e: unknown) {
    // show error message
    logger.error(e);
    // error
    if (e instanceof Error) {
      // show error
      dialogMaker.showmessage('error', `${e.message}`);
    }
  }
};

// enable sandbox
app.enableSandbox();

// ready
app.on('ready', async () => {
  logger.info('app: electron is ready');
  // create window
  createWindow();  // icon
  const icon: Electron.NativeImage = nativeImage.createFromPath(
    path.join(globalRootPath, 'assets', 'gourmet.png')
  );
  // tray
  const mainTray: Electron.Tray = new Tray(icon);
  // context menu
  const contextMenu: Electron.Menu = Menu.buildFromTemplate([
    // show
    {
      label: 'show',
      click: () => {
        mainWindow.show();
      },
    },
    // close
    {
      label: 'close',
      click: () => {
        app.quit();
      },
    },
  ]);
  // set context menu
  mainTray.setContextMenu(contextMenu);
  // doubleclick
  mainTray.on('double-click', () => mainWindow.show());
});

// activate
app.on('activate', () => {
  // no window
  if (BrowserWindow.getAllWindows().length === 0) {
    // reboot
    createWindow();
  }
});

// close
app.on('before-quit', () => {
  logger.info('ipc: quit mode');
  // close flg
  isQuiting = true;
});

// exit
app.on('window-all-closed', () => {
  logger.info('app: close app');
  // exit app
  app.quit();
});

/*
 IPC
*/
/* page */
ipcMain.on('page', async (_: any, arg: any) => {
  try {
    logger.info('ipc: page mode');
    // target url
    let url: string = '';

    // switch on mode
    switch (arg) {
      // exit_page
      case 'exit_page':
        // except for apple
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

      // url page
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
    // show error message
    logger.error(e);
    // error
    if (e instanceof Error) {
      // show error
      dialogMaker.showmessage('error', `${e.message}`);
    }
  }
});

// CSV
ipcMain.on('csv', async (event: any, _: any) => {
  try {
    logger.info('ipc: csv mode');
    // csv path
    const csvPath: any = await csvMaker.showCSVDialog(mainWindow);
    // get CSV data
    const result: any = await csvMaker.getCsvData(csvPath);
    // return csv data
    event.sender.send('shopinfoCsvlist', result);

  } catch (e: unknown) {
    // show error message
    logger.error(e);
    // error
    if (e instanceof Error) {
      // show error
      dialogMaker.showmessage('error', `${e.message}`);
    }
  }
});

// error
ipcMain.on('error', async (_: any, arg: any) => {
  try {
    logger.info('ipc: error mode');
    // show error
    dialogMaker.showmessage('error', arg);

  } catch (e: unknown) {
    // show error message
    logger.error(e);
    // error
    if (e instanceof Error) {
      // show error
      dialogMaker.showmessage('error', `${e.message}`);
    }
  } finally {
    // close window
    await puppScraper.doClose();
  }
});


// scrape url
ipcMain.on('scrapeurl', async (event: any, arg: any) => {
  try {
    logger.info('ipc: scrape mode');
    // init success counter
    let urlSuccessCounter: number = 0;
    // final Csv Array
    let finalCsvArray: any = [];
    // pref padded
    logger.debug(`scrapeurl: ${myConst.HOSPARA_BASE}${arg}/`);
    // initialize scraper
    await puppScraper.init(false);
    // goto top
    await puppScraper.doGo(`${myConst.HOSPARA_BASE}${arg}/`);
    // wait for datalist
    await puppScraper.doWaitFor(myProperties.WAIT_SECOND);
    // url exists
    if (!await puppScraper.doCheckSelector(mySelector.hosParaTotalSelector)) {
      throw new Error('scrapeurl: scrape area: no key data');
    }
    logger.debug('scrapeurl: url exists');
    // total tag
    const tmpHosparatotal: any = await puppScraper.doMultiEval(
      mySelector.hosParaTotalSelector,
      'innerHTML'
    );
    // wait for datalist
    await puppScraper.doWaitFor(myProperties.WAIT_SECOND);
    // tag removal
    const tmpPrefTotalNum: string = tmpHosparatotal[0].replace(/<[^>]*>/g, '');
    // totalCounter
    const totalPrefCounter: number = Number(tmpPrefTotalNum);
    // pages
    const pageNumbers: number = Math.ceil(totalPrefCounter / 30);
    // pref total
    event.sender.send('urltotal', totalPrefCounter);
    logger.debug(`scrapeurl: prefecture total is ${totalPrefCounter} urls`);
    // numbers for loop
    const areaNumberArray: number[] = makeNumberRange(1, pageNumbers + 1);

    // area loop
    for (let areaNum of areaNumberArray) {
      try {
        // numbers for loop
        const shopNumberArray: number[] = makeNumberRange(1, 30);
        // query
        const fixedQuery: string = areaNum == 1 ? "" : `?page=${areaNum}`;
        console.log(fixedQuery);
        // area url
        const areaUrl: string = `${myConst.HOSPARA_BASE}${arg}/${fixedQuery}`;
        logger.silly(`areaUrl: ${areaUrl}`);
        // update target url
        event.sender.send('statusUpdate', areaUrl);
        // goto top
        await puppScraper.doGo(areaUrl);
        logger.debug(`scrapeurl: ${areaUrl}`);
        // wait for datalist
        await puppScraper.doWaitFor(myProperties.WAIT_SECOND);
        // area loop
        for (let shopNum of shopNumberArray) {
          try {
            // shop data
            let myShopObj: any = {
              url: "", // url
            };
            // url selector
            const hosparaUrlSelector: string = pageSelector.shopurl(shopNum);
            // total tag
            const tmpHosparaUrl: any = await puppScraper.doSingleEval(
              hosparaUrlSelector,
              'href'
            );
            // url
            myShopObj['url'] = tmpHosparaUrl;
            // push into array
            finalCsvArray.push(myShopObj);
            // countup
            urlSuccessCounter++;
            // send success counter
            event.sender.send("urlsuccess", urlSuccessCounter);

          } catch (error: unknown) {
            // error
            logger.error(error);
          }
        }
        console.log("goto next loop");

      } catch (err: unknown) {
        // error
        logger.error(err);
        // error
        if (err instanceof Error) {
          // show error
          dialogMaker.showmessage('error', `${err.message}`);
        }
      }
    }
    // nowtime
    const nowtime: string = `${dir_desktop}\\${new Date().toISOString().replace(/[^\d]/g, '').slice(0, 14)}`;
    // file name
    const targetpath: string = `${nowtime}_${arg}_url.csv`;
    logger.debug('scrapeurl: making csv...');
    console.log(finalCsvArray.flat().flat());
    // make CSV
    await csvMaker.makeCsvData(finalCsvArray.flat().flat(), ['url'], targetpath);
    // show error
    dialogMaker.showmessage('finished', 'URL取得が終わりました');

  } catch (e: unknown) {
    // error
    logger.error(e);
    // error
    if (e instanceof Error) {
      // show error
      dialogMaker.showmessage('error', `${e.message}`);
    }
  }
});

// scrape
ipcMain.on('scrape', async (event: any, arg: any) => {
  try {
    logger.info('ipc: scrape mode');
    // shop success counter
    let shopSuccessCounter: number = 0;
    // shop fail counter
    let shopFailCounter: number = 0;
    // total counter
    let totalCounter: number = arg.urls.record.length;
    // start point
    const tmpPosition: any = arg.pos ?? 0;
    // start point
    const startPosition: number = Number(tmpPosition);
    // url array
    const urlArray: any[] = arg.urls.record.flat();
    // init array
    finalResultArray = [];
    // initialize scraper
    await puppScraper.init(true);
    // update total
    event.sender.send('shoptotal', totalCounter - startPosition);
    // partnumber
    const totalNumber: number[] = makeNumberRange(startPosition, totalCounter);

    // scrape pages
    for (let nm of totalNumber) {
      try {
        // target url
        const targetUrl: string = urlArray[nm];
        // shop data
        let myShopObj: any = {
          url: '', // url
          shopname: '', // shopname
          holiday: '', // holiday
          address: '', // address1
          businesstime: '', // businesstime
          shopphone: '', // shopphone
        };
        // goto top
        await puppScraper.doGo(targetUrl);
        logger.debug(`app: scraping ${targetUrl}`);
        // update target url
        event.sender.send('statusUpdate', targetUrl);
        // goto top
        await puppScraper.doWaitFor(myProperties.WAIT_SECOND);
        // url
        myShopObj['url'] = targetUrl;
        // shopname
        const shopname: string = await doScrape(mySelector.hosParaMainShopnameSelector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedShopName: string = checkEvaluation(shopname);
        myShopObj['shopname'] = checkedShopName;
        // holiday
        const holiday: string = await doScrape(mySelector.hosParaHolidaySelector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedHoliday: string = checkEvaluation(holiday);
        myShopObj['holiday'] = checkedHoliday;
        // address1
        const address1: string = await doScrape(mySelector.hosParaAddressSelector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedAddress1: string = checkEvaluation(address1);
        myShopObj['address'] = checkedAddress1;
        // businesstime
        const businesstime: string = await doScrape(mySelector.hosParaBusinesstimeSelector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedBusinesstime: string = checkEvaluation(businesstime);
        myShopObj['businesstime'] = checkedBusinesstime;
        // shopphone
        const shopphone: string = await doScrape(mySelector.hosParaTelephoneSelector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedShopphone: string = checkEvaluation(shopphone);
        myShopObj['shopphone'] = checkedShopphone;
        // shop counter
        shopSuccessCounter++;
        console.log(myShopObj);
        // push into array
        finalResultArray.push(myShopObj);
        // update target url
        event.sender.send("statusUpdate", myShopObj.shopname);

      } catch (err: unknown) {
        // shop counter
        shopFailCounter++;
        // error
        logger.error(err);

      } finally {
        // send success counter
        event.sender.send('shopsuccess', shopSuccessCounter);
        // send fail counter
        event.sender.send('shopfail', shopFailCounter);
      }
    }
    // CSV file name
    const nowtime: string = `${dir_desktop}\\${new Date()
      .toISOString()
      .replace(/[^\d]/g, '')
      .slice(0, 14)}.csv`;
    // make csv
    csvMaker.makeCsvData(finalResultArray, ['url', 'shopname', 'holiday', 'address', 'businesstime', 'shopphone',], nowtime);
    logger.debug('CSV writing finished');
    // show finished message
    dialogMaker.showmessage('info', 'scraping finished');

  } catch (e: unknown) {
    // error
    logger.error(e);
    // error
    if (e instanceof Error) {
      // show error
      dialogMaker.showmessage('error', `${e.message}`);
    }
  } finally {
    // goback to previous page
    await puppScraper.doClose();
  }
});

// pause
ipcMain.on("pause", async (_: any, __: any) => {
  return new Promise(async (_, __) => {
    try {
      logger.info("ipc: pause mode");
      // CSV file name
      const nowtime: string = `${dir_desktop}\\${myConst.APP_NAME}_${new Date().toISOString().replace(/[^\d]/g, "").slice(0, 14)}.csv`;
      // make csv
      await csvMaker.makeCsvData(finalResultArray, ['url', 'shopname', 'holiday', 'address', 'businesstime', 'shopphone',], nowtime);
      logger.debug("CSV writing finished");
      // show finished message
      dialogMaker.showmessage("info", "scraping stopped");
      // quit app
      app.quit();

    } catch (e: unknown) {
      // error
      logger.error(e);
      // error
      if (e instanceof Error) {
        // show error
        dialogMaker.showmessage("error", `${e.message}`);
      }
      return false;
    } finally {
      // goto top
      await puppScraper.doClose();
    }
  });
});

// exit
ipcMain.on('exit', async () => {
  try {
    logger.info('ipc: exit mode');
    // quit app
    app.quit();

  } catch (e: unknown) {
    // error
    logger.error(e);
    // error
    if (e instanceof Error) {
      // show error
      dialogMaker.showmessage('error', `${e.message}`);
    }
  } finally {
    // goto top
    await puppScraper.doClose();
  }
});

// do scraping
const doScrape = async (selector: string): Promise<string> => {
  return new Promise(async (resolve, _) => {
    try {
      // url exists
      if (await puppScraper.doCheckSelector(selector)) {
        // url
        const tmpValues: any = await puppScraper.doSingleEval(
          selector,
          'innerHTML'
        );
        // empty
        if (tmpValues == '') {
          resolve('error');
        } else {
          // result
          resolve(tmpValues.trim());
        }
      } else {
        // ignore error
        resolve('');
      }
    } catch (e: unknown) {
      // error
      logger.error(e);
      // error
      if (e instanceof Error) {
        // show error
        dialogMaker.showmessage('error', `${e.message}`);
      }
      // ignore error
      resolve('');
    }
  });
};

// number array
const makeNumberRange: any = (start: number, end: number) => [...new Array(end - start).keys()].map(n => n + start);

// empty evaluation
const checkEvaluation = (value: string): any => {
  // tag regexp
  const regex: RegExp = new RegExp('(<([^>]+)>)', 'gi');
  // isEmpty
  const isEmpty: boolean = Object.keys(value).length === 0 && value.constructor === Object;
  // empty
  if (!isEmpty) {
    // tag exists
    if (regex.test(value)) {
      // tag removal
      return value.replace(/(<([^>]+)>)/gi, '');
    } else {
      // tag 
      return value;
    }
  }
}