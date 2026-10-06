/*
 * travelko.ts
 *
 * function：travelko scraping electron app
 **/

// namespace
import { myConst, myProperties, myWindows, urlSelector, hotelSelector, myArrays } from './consts/globalvariables';

// import modules
import { BrowserWindow, app, ipcMain, Tray, Menu, nativeImage } from 'electron'; // electron
import * as path from 'node:path'; // path
import { Scrape } from './class/ElScrape0804'; // scraper
import Dialog from './class/ElDialog0721'; // dilog
import Logger from './class/ElLogger'; // logger
import CSV from './class/ElCsv0126'; // csv
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
// csv array
let finalUrlArray: any[] = [];
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
  createWindow();
  // icon
  const icon: Electron.NativeImage = nativeImage.createFromPath(
    path.join(globalRootPath, 'assets', 'hotel.png')
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

// scrape url
ipcMain.on('scrapeurl', async (event: any, arg: any) => {
  try {
    logger.info('ipc: scrape url mode');
    // success counter
    let successCounter: number = 0;
    // fail counter
    let failCounter: number = 0;
    logger.debug(`scrapeurl: ${myConst.TRAVELKO_BASE}`);
    // start point
    const tmpPosition: number = arg == 0 ? 1 : Number(arg);
    // initialize scraper
    await puppScraper.init(true);
    // numbers for loop
    const pageNumbers: number[] = makeNumberRange(tmpPosition, myConst.TOTAL_PAGES);
    // pref total
    event.sender.send('urltotal', myConst.TOTAL_PAGES - tmpPosition);

    // area loop
    for (const pageNum of pageNumbers) {
      try {
        // hotel url
        const hotelUrl: string = `${myConst.TRAVELKO_BASE}?hotel_type=3,12,13&pg=${pageNum}`;
        // update target url
        event.sender.send('statusUpdate', hotelUrl);
        logger.debug(`scrapeurl: scrape ${hotelUrl} start`);
        // goto page
        await puppScraper.doGo(hotelUrl);
        // wait for 1 sec
        await puppScraper.doWaitFor(myProperties.WAIT_SECOND * 15);
        logger.debug("check finished.");
        // url
        const tmpDataurls: any = await puppScraper.doMultiEval(urlSelector.travelkoDataUrlSelector, 'href');
        // push into array
        for (const url of tmpDataurls) {
          // hotel data
          let myHotelObj: any = {
            url: '', // url
          };
          // url
          myHotelObj['url'] = url;
          // push into arrray
          finalUrlArray.push(myHotelObj);
        }
        // increment success counter
        successCounter++;

      } catch (e: unknown) {
        // error
        logger.error(e);
        // increment success counter
        failCounter++;

      } finally {
        // update success
        event.sender.send('urlsuccess', successCounter);
        // update fail
        event.sender.send('urlfail', failCounter);
      }
    }
    // nowtime
    const nowtime: string = `${dir_desktop}\\${new Date().toISOString().replace(/[^\d]/g, '').slice(0, 14)}`;
    // file name
    const targetpath: string = `${nowtime}_url.csv`;
    logger.debug('scrapeurl: making csv...');
    // make CSV
    await csvMaker.makeCsvData(finalUrlArray.flat(), myArrays.urlcolumns, targetpath);
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
    await puppScraper.init(false);
    // update total
    event.sender.send('shoptotal', totalCounter - startPosition);
    // part number
    const totalNumber: number[] = makeNumberRange(startPosition, totalCounter);

    // scrape pages
    for (let nm of totalNumber) {
      try {
        // target url
        const targetUrl: string = urlArray[nm];
        // hotel data
        let myHotelObj: any = {
          url: '', // url
          hotelname: '', // hotelname
          address: '', // address
          homepage: '', // homepage
          telephone: '', // telephone
        };
        // goto top
        await puppScraper.doGo(targetUrl);
        logger.debug(`app: scraping ${targetUrl}`);
        // update target url
        event.sender.send('statusUpdate', targetUrl);
        // url
        myHotelObj['url'] = targetUrl;
        // hotelname
        const hotelname: string = await doScrape(hotelSelector.travelkoHotelNameSelector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedHotelName: string = checkEvaluation(hotelname);
        myHotelObj['hotelname'] = checkedHotelName;
        // address
        const address: string = await doScrape(hotelSelector.travelkoHotelAddressSelector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedAddress: string = checkEvaluation(address);
        myHotelObj['address'] = checkedAddress;
        // homepage
        const homepage: string = await doScrape(hotelSelector.travelkoHotelHomepageSelector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedHomepage: string = checkEvaluation(homepage);
        myHotelObj['homepage'] = checkedHomepage;
        // telephone
        const telephone: string = await doScrape(hotelSelector.travelkoHotelTelephoneSelector);
        await puppScraper.doWaitFor(myProperties.WAIT_MILLSECOND);
        const checkedTelephone: string = checkEvaluation(telephone);
        myHotelObj['telephone'] = checkedTelephone;
        // goto top
        await puppScraper.doWaitFor(10 * myProperties.WAIT_SECOND);
        // shop counter
        shopSuccessCounter++;
        // push into array
        finalResultArray.push(myHotelObj);
        console.log(myHotelObj);
        // update target url
        event.sender.send("statusUpdate", myHotelObj.shopname);

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
    csvMaker.makeCsvData(finalResultArray, myArrays.hotelcolumns, nowtime);
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
  return new Promise(async (resolve, _) => {
    try {
      logger.info("ipc: pause mode");
      // CSV file name
      const nowtime: string = `${dir_desktop}\\${myConst.APP_NAME}_${new Date().toISOString().replace(/[^\d]/g, "").slice(0, 14)}.csv`;
      // toggle array
      const pauseCsvArray: any[] = arg ? finalResultArray : finalUrlArray;
      // make csv
      await csvMaker.makeCsvData(pauseCsvArray, myArrays.hotelcolumns, nowtime);
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