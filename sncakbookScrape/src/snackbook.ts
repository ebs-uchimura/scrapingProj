/*
 * snackbook.ts
 *
 * function：scraping snackbook app
 **/

// namespace
import { myConst, myProperties, myWindows, mySelector, pageColumn } from './consts/globalvariables';

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
// filename
let globalSnackbookTitle: string = '';
// selected index
let globalSelectedIndex: number = 0;
// final Csv Array
let finalCsvArray: any = [];
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
        //mainWindow.webContents.openDevTools();
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
    path.join(globalRootPath, 'assets', 'snackbook.ico')
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
    logger.info('ipc: scrape url mode');
    // init success counter
    let urlSuccessCounter: number = 0;
    // init csv array
    finalCsvArray = [];
    // selected pref index
    globalSelectedIndex = arg.prefindex;
    // initialize scraper
    await puppScraper.init(false);
    // numbers for loop
    const genreNumberArray: number[] = makeNumberRange(1, 26);

    // loop for genres
    for (const genre of genreNumberArray) {
      // pref padded
      logger.debug(`scrapeurl: ${myConst.SNACKBOOK_BASE}${arg.pref}/genre/${genre}`);
      // goto top
      await puppScraper.doGo(`${myConst.SNACKBOOK_BASE}${arg.pref}/genre/${genre}`);
      // wait for datalist
      await puppScraper.doWaitFor(myProperties.WAIT_SECOND);
      // url exists
      if (await puppScraper.doCheckSelector(mySelector.snackbookTotalSelector)) {

        logger.debug('scrapeurl: url exists');
        // title tag
        globalSnackbookTitle = await puppScraper.doSingleEval(
          mySelector.snackbookHeaderSelector,
          'innerHTML'
        );
        // total tag
        const tmpSnackbooktotal: any = await puppScraper.doSingleEval(
          mySelector.snackbookTotalSelector,
          'innerHTML'
        );
        // wait for datalist
        await puppScraper.doWaitFor(myProperties.WAIT_SECOND);
        // totalCounter
        const totalShopCounter: number = Number(tmpSnackbooktotal);
        // pref total
        event.sender.send('urltotal', totalShopCounter);
        logger.debug(`scrapeurl: prefecture total is ${totalShopCounter} urls`);
        // page counter
        const totalPageCounter: number = Math.ceil(totalShopCounter / myProperties.PAGE_NUMBER);
        // numbers for loop
        const pageNumberArray: number[] = makeNumberRange(2, totalPageCounter + 2);

        // page loop
        for (let pageNum of pageNumberArray) {
          try {
            // update target url
            event.sender.send('statusUpdate', pageNum);
            // wait for datalist
            await puppScraper.doWaitFor(myProperties.WAIT_SECOND);
            // total tag
            const tmpSnackbbokUrl: any = await puppScraper.doMultiEval(
              mySelector.snackbookShopUrlSelector,
              'href',
            );

            // make url obj
            const tmpUrlObj: any = tmpSnackbbokUrl.map((url: any) => {
              return {
                url: url, // url
              }
            });
            // push into array
            finalCsvArray.push(tmpUrlObj);
            console.log(tmpUrlObj);
            // countup
            urlSuccessCounter++;
            // send success counter
            event.sender.send("urlsuccess", urlSuccessCounter);
            // goto top
            await puppScraper.doGo(`${myConst.SNACKBOOK_BASE}${arg.pref}/genre/${genre}?page=${pageNum}`);
            // wait for datalist
            await puppScraper.doWaitFor(myProperties.WAIT_SECOND);

          } catch (error: unknown) {
            // error
            logger.error(error);
          }
        }
      }
    }
    // nowtime
    const nowtime: string = `${dir_desktop}\\${String(globalSelectedIndex).padStart(2, '0')}`;
    // file name
    const targetpath: string = `${nowtime}_${globalSnackbookTitle.trim()}_url.csv`;
    logger.debug('scrapeurl: making csv...');
    // make CSV
    await csvMaker.makeCsvData(finalCsvArray.flat(), ['url'], targetpath);
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
    let totalCounter: number = arg.record.flat().length;
    // init array
    finalResultArray = [];
    // initialize scraper
    await puppScraper.init(false);
    // update total
    event.sender.send('shoptotal', totalCounter);
    // partnumber
    const totalNumber: number[] = makeNumberRange(1, totalCounter);

    // scrape pages
    for (let nm of totalNumber) {
      try {
        // target url
        const targetUrl: string = arg.record.flat()[nm];
        // shop data
        let myShopObj: any = {
          url: '', // url
          shopname: '', // shopname
          area: '', // area
          businesstime: '', // businesstime
          holiday: '', // holiday
          shopphone: '', // shopphone
          address: '', // address
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
        const shopname: string = await doScrape(mySelector.snackbookMainShopnameSelector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedShopName: string = checkEvaluation(shopname);
        myShopObj['shopname'] = checkedShopName;
        // areaname
        const areaname: string = await doScrape(mySelector.snackbookAreaSelector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedAreaName: string = checkEvaluation(areaname);
        myShopObj['area'] = checkedAreaName;
        // businesstime
        const businesstime: string = await doScrape(mySelector.snackbookBusinesstimeSelector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedBusinesstime: string = checkEvaluation(businesstime);
        myShopObj['businesstime'] = checkedBusinesstime;
        // holiday
        const holiday: string = await doScrape(mySelector.snackbookHolidaySelector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedHoliday: string = checkEvaluation(holiday);
        myShopObj['holiday'] = checkedHoliday;
        // shopphone
        const shopphone: string = await doScrape(mySelector.snackbookTelephoneSelector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedShopphone: string = checkEvaluation(shopphone);
        myShopObj['shopphone'] = checkedShopphone;
        // address1
        const address1: string = await doScrape(mySelector.snackbookAddressSelector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedAddress1: string = checkEvaluation(address1);
        myShopObj['address'] = checkedAddress1;
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
    csvMaker.makeCsvData(finalResultArray.flat(), pageColumn.csvColumns, nowtime);
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
ipcMain.on("pause", async (_: any, arg: any) => {
  return new Promise(async (_, __) => {
    try {
      logger.info("ipc: pause mode");
      // csv array
      let csvArray: any[] = [];
      // csv array
      let csvColumns: string[] = [];
      // nowtime
      const nowtime: string = `${dir_desktop}\\${String(globalSelectedIndex).padStart(2, '0')}`;
      // file name
      const targetpath: string = `${nowtime}_${globalSnackbookTitle.trim()}_url.csv`;
      console.log(targetpath);
      // url
      if (arg == "url") {
        csvArray = finalCsvArray;
        csvColumns = ['url'];
      } else if (arg == "shop") {
        csvArray = finalResultArray;
        csvColumns = pageColumn.csvColumns;
      }
      // make csv
      await csvMaker.makeCsvData(csvArray.flat(), csvColumns, targetpath);
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