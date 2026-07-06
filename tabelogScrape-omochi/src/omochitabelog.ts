/*
 * omochitabelog.ts
 *
 * function：scraping electron app
 **/

// namespace
import { myConst, myWindows, myProperties, mySelector, myArrays } from './consts/globalvariables';

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
        // mainWindow.webContents.openDevTools();
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
    path.join(globalRootPath, 'assets', 'omochitabelog.ico')
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

// scrape
ipcMain.on('scrape', async (event: any, arg: any) => {
  try {
    logger.info('ipc: scrape mode');
    // shop success counter
    let shopSuccessCounter: number = 0;
    // shop fail counter
    let shopFailCounter: number = 0;
    // url array
    const urlArray: any[] = arg.urls.record.flat();
    // start point
    const tmpPosition: any = arg.pos ?? 0;
    // total counter
    let urlLength: number = urlArray.length;
    // init array
    finalResultArray = [];
    // initialize scraper
    await puppScraper.init(false);
    // update total
    event.sender.send('shoptotal', urlLength - tmpPosition);
    // partnumber
    const totalNumber: number[] = makeNumberRange(0, urlLength);

    // scrape pages
    for await (let nm of totalNumber) {
      try {
        // target url
        const targetUrl: string = urlArray[nm];
        // shop data
        let myShopObj: any = {
          url: '', // url
          introductionHead: '', // introductionHead
          introduction: '', // introduction
          shopname: '', // shopname
          detail1: '', // detail1
          detail2: '', // detail2
          detail3: '', // detail3
          detail4: '', // detail4
          detail5: '', // detail5
          detail6: '', // detail6
          detail7: '', // detail7
          detail8: '', // detail8
          detail9: '', // detail9
          detail10: '', // detail10
          detail11: '', // detail11
          seat: '', // seat
          menu1: '', // menu1
          menu2: '', // menu2
          menu3: '', // menu3
          official1: '', // official1
          official2: '', // official2
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
        const shopname: string = await doScrape(mySelector.tabeLogMainShopnameSelector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedShopName: string = checkEvaluation(shopname);
        myShopObj['shopname'] = checkedShopName;
        // detail1
        const detail1: string = await doScrape(mySelector.tabelLogDetailSelector1);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkDetail1: string = checkEvaluation(detail1);
        myShopObj['detail1'] = checkDetail1;
        // detail2
        const detail2: string = await doScrape(mySelector.tabelLogDetailSelector2);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkDetail2: string = checkEvaluation(detail2);
        myShopObj['detail2'] = checkDetail2;
        // detail3
        const detail3: string = await doScrape(mySelector.tabelLogDetailSelector3);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkDetail3: string = checkEvaluation(detail3);
        myShopObj['detail3'] = checkDetail3;
        // detail4
        const detail4: string = await doScrape(mySelector.tabelLogDetailSelector4);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkDetail4: string = checkEvaluation(detail4);
        myShopObj['detail4'] = checkDetail4;
        // detail5
        const detail5: string = await doScrape(mySelector.tabelLogDetailSelector5);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkDetail5: string = checkEvaluation(detail5);
        myShopObj['detail5'] = checkDetail5;
        // detail6
        const detail6: string = await doScrape(mySelector.tabelLogDetailSelector6);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkDetail6: string = checkEvaluation(detail6);
        myShopObj['detail6'] = checkDetail6;
        // detail7
        const detail7: string = await doScrape(mySelector.tabelLogDetailSelector7);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkDetail7: string = checkEvaluation(detail7);
        myShopObj['detail7'] = checkDetail7;
        // detail8
        const detail8: string = await doScrape(mySelector.tabelLogDetailSelector8);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkDetail8: string = checkEvaluation(detail8);
        myShopObj['detail8'] = checkDetail8;
        // detail9
        const detail9: string = await doScrape(mySelector.tabelLogDetailSelector9);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkDetail9: string = checkEvaluation(detail9);
        myShopObj['detail9'] = checkDetail9;
        // detail10
        const detail10: string = await doScrape(mySelector.tabelLogDetailSelector10);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkDetail10: string = checkEvaluation(detail10);
        myShopObj['detail10'] = checkDetail10;
        // detail11
        const detail11: string = await doScrape(mySelector.tabelLogDetailSelector11);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkDetail11: string = checkEvaluation(detail11);
        myShopObj['detail11'] = checkDetail11;
        // seat
        const seat: string = await doScrape(mySelector.tabeLogSeatSelector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        console.log(seat);
        const checkedSeat: string = checkEvaluation(seat);
        myShopObj['seat'] = checkedSeat;
        // menu1
        const menu1: string = await doScrape(mySelector.tabeLogMenu1Selector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedMenu1: string = checkEvaluation(menu1);
        myShopObj['menu1'] = checkedMenu1;
        // menu2
        const menu2: string = await doScrape(mySelector.tabeLogMenu2Selector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedMenu2: string = checkEvaluation(menu2);
        myShopObj['menu2'] = checkedMenu2;
        // menu3
        const menu3: string = await doScrape(mySelector.tabeLogMenu3Selector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedMenu3: string = checkEvaluation(menu3);
        myShopObj['menu3'] = checkedMenu3;
        // official1
        const official1: string = await doScrape(mySelector.tabeLogMenu3Selector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedOfficialAccount1: string = checkEvaluation(official1);
        myShopObj['official1'] = checkedOfficialAccount1;
        // official2
        const official2: string = await doScrape(mySelector.tabeLogMenu3Selector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedOfficialAccount2: string = checkEvaluation(official2);
        myShopObj['official2'] = checkedOfficialAccount2;
        // shop counter
        shopSuccessCounter++;
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
    console.log(nowtime);
    // make csv
    csvMaker.makeCsvData(finalResultArray, myArrays.columns, nowtime);
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
  return new Promise(async (resolve, _) => {
    try {
      logger.info("ipc: pause mode");
      // CSV file name
      const nowtime: string = `${dir_desktop}\\${myConst.APP_NAME}_${new Date().toISOString().replace(/[^\d]/g, "").slice(0, 14)}.csv`;
      // make csv
      await csvMaker.makeCsvData(finalResultArray, myArrays.columns, nowtime);
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