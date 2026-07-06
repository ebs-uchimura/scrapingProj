/*
 * ryokan.ts
 *
 * function：scraping ryokan app
 **/

'use strict';

// 定数
// namespace
import { myConst, myWindows, myArrays } from "./consts/globalvariables";

// import modules
import { BrowserWindow, app, ipcMain, Tray, Menu, nativeImage } from "electron"; // electron
import * as path from "node:path"; // path
import { Scrape } from "./class/ElScrape0804"; // scraper
import Dialog from "./class/ElDialog0721"; // dilog
import Logger from "./class/ElLogger"; // logger
import CSV from "./class/ElCsv0414"; // csv
/// Variables
let globalRootPath: string; // root path
// production
if (!myConst.DEV_FLG) {
  globalRootPath = path.join(path.resolve(), 'resources')
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
  process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"] ?? "";
// desktop
const dir_desktop: string = path.join(dir_home, "Desktop");

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
        preload: path.join(__dirname, "preload.js"), // preload
      },
    });
    // hide menu bar
    mainWindow.setMenuBarVisibility(false);
    // load index.html
    mainWindow.loadFile(path.join(globalRootPath, "www", "index.html"));
    // ready
    mainWindow.once("ready-to-show", () => {
      if (!app.isPackaged) {
        // dev mode
        //mainWindow.webContents.openDevTools();
      }
    });

    // close
    mainWindow.on("close", (event: any): void => {
      // quiting
      if (!isQuiting) {
        // except for apple
        if (process.platform !== "darwin") {
          // false
          event.returnValue = false;
        }
      }
    });

    // closed
    mainWindow.on("closed", (): void => {
      // destroy window
      mainWindow.destroy();
    });

  } catch (e: unknown) {
    // show error message
    logger.error(e);
    // error
    if (e instanceof Error) {
      // show error
      dialogMaker.showmessage("error", `${e.message}`);
    }
  }
};

// enable sandbox
app.enableSandbox();

// ready
app.on("ready", async () => {
  logger.info("app: electron is ready");
  // create window
  createWindow();
  // icon
  const icon: Electron.NativeImage = nativeImage.createFromPath(
    path.join(globalRootPath, "assets", "pepper.ico")
  );
  // tray
  const mainTray: Electron.Tray = new Tray(icon);
  // context menu
  const contextMenu: Electron.Menu = Menu.buildFromTemplate([
    // show
    {
      label: "show",
      click: () => {
        mainWindow.show();
      },
    },
    // close
    {
      label: "close",
      click: () => {
        app.quit();
      },
    },
  ]);
  // set context menu
  mainTray.setContextMenu(contextMenu);
  // doubleclick
  mainTray.on("double-click", () => mainWindow.show());
});

// activate
app.on("activate", () => {
  // no window
  if (BrowserWindow.getAllWindows().length === 0) {
    // reboot
    createWindow();
  }
});

// close
app.on("before-quit", () => {
  logger.info("ipc: quit mode");
  // close flg
  isQuiting = true;
});

// exit
app.on("window-all-closed", () => {
  logger.info("app: close app");
  // exit app
  app.quit();
});

/*
 IPC
*/
// scrape mail
ipcMain.on("scrapemail", async (event: any, arg: any) => {
  try {
    logger.info("ipc: scrape mail mode");
    // initialize scraper
    await puppScraper.init(true);
    // shop mail success counter
    let shopMailSuccessCounter: number = 0;
    // shop success counter
    let shopSuccessCounter: number = 0;
    // shop fail counter
    let shopFailCounter: number = 0;
    // init array
    finalResultArray = [];
    // total counter
    let totalCounter: number = arg.urls.record.length;
    // start point
    const tmpPosition: any = arg.pos ?? 0;
    // url array
    const urlArray: any[] = arg.urls.record.flat();
    // partnumber
    const totalNumber: number[] = makeNumberRange(tmpPosition, totalCounter);
    // send success counter
    event.sender.send('shoptotal', totalCounter - tmpPosition);
    // scrape pages
    for (let nm of totalNumber) {
      try {
        // target url
        const targetUrl: string = urlArray[nm];
        // wait for 1 sec
        await puppScraper.doWaitFor(500);
        // goto top
        await puppScraper.doGo(targetUrl);
        logger.debug(`ipc: scraping ${targetUrl}...`);
        // wait for 2 sec
        await puppScraper.doWaitFor(2000);
        // all links
        const alllinks: string[] = await puppScraper.getAllLinks();
        // remove duplicates
        const uniqueLinks: string[] = Array.from(new Set(alllinks));

        // scrape pages
        for (let link of uniqueLinks) {
          try {
            // ryokan data
            let myRyokanObj: any = {
              originurl: '',
              url: '', // url
              mailaddress: '', // mailaddress
            };
            // goto top
            await puppScraper.doGo(link);
            // wait for 1 sec
            await puppScraper.doWaitFor(2000);
            logger.silly(`ipc: scraping ${link}...`);
            // all links
            const allTexts: any = await puppScraper.getAllTexts();
            // regexp
            const regexp = /\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/g;
            // mailaddress exists
            if (regexp.test(allTexts)) {
              // mail address
              const mailaddresses: any[] = allTexts.match(regexp);
              myRyokanObj['originurl'] = targetUrl; // originurl
              myRyokanObj['url'] = link; // url
              myRyokanObj['mailaddress'] = mailaddresses[0]; // mail
              // push into array
              finalResultArray.push(myRyokanObj);
              logger.silly(`ipc: mail ${mailaddresses[0]} exists. break...`);
              // if mail exists break
              if (mailaddresses[0] != '') {
                shopMailSuccessCounter++;
                break;
              }
            }
            shopSuccessCounter++;
          } catch (err: unknown) {
            // error
            logger.error(err);
          }
        }
      } catch (err: unknown) {
        // shop counter
        shopFailCounter++;
        // error
        logger.error(err);

      } finally {
        // send mailsuccess counter
        event.sender.send('mailsuccess', shopMailSuccessCounter);
        // send success counter
        event.sender.send('shopsuccess', shopSuccessCounter);
        // send fail counter
        event.sender.send('shopfail', shopFailCounter);
      }
    }
    // nowtime
    const nowtime: string = `${dir_desktop}\\${new Date()
      .toISOString()
      .replace(/[^\d]/g, "")
      .slice(0, 14)}`;
    // file name
    const targetpath: string = `${nowtime}.csv`;
    logger.debug('scrapeurl: making csv...');
    // make CSV
    await csvMaker.makeCsvData(finalResultArray, myArrays.columns, targetpath);
    // show error
    dialogMaker.showmessage("finished", "URL取得が終わりました");

  } catch (e: unknown) {
    // error
    logger.error(e);
    // error
    if (e instanceof Error) {
      // show error
      dialogMaker.showmessage("error", `${e.message}`);
    }
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
ipcMain.on("exit", async () => {
  try {
    logger.info("ipc: exit mode");
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
  } finally {
    // goto top
    await puppScraper.doClose();
  }
});

// number array
const makeNumberRange: any = (start: number, end: number) => [...new Array(end - start).keys()].map(n => n + start);