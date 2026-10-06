/*
 * navtime.ts
 *
 * function：scraping electron app
 **/

'use strict';

// namespace
import { myConst, mySelector, myColumns } from './consts/globalvariables';

// import modules
import {
  BrowserWindow,
  app,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
} from "electron"; // electron
import * as path from "node:path"; // path
import { Scrape } from "./class/ElScrape0123"; // scraper
import Dialog from "./class/ElDialog1124"; // logger
import Logger from "./class/ElLogger"; // logger
import CSV from "./class/ElCsv0126"; // csv

/// Variables
// root path
let globalRootPath: string;
// production
if (!myConst.DEV_FLG) {
  globalRootPath = path.join(path.resolve(), 'resources')
  // development
} else {
  globalRootPath = path.join(__dirname, '..');
}

/// const
// scraping site
const DEF_NAVTIME_URL: string = "https://www.navitime.co.jp/postcode";
// csv char code
const CSV_ENCODING: string = "utf-8";
// logger
const logger: Logger = new Logger(myConst.COMPANY_NAME, myConst.APP_NAME, 'info');
// csv
const csvMaker: CSV = new CSV(CSV_ENCODING, logger);
// dialog
const dialogMaker: Dialog = new Dialog(logger);
// scraper
const puppScraper: Scrape = new Scrape(logger);
// desktop path
const dir_home =
  process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"] ?? "";
const dir_desktop = path.join(dir_home, "Desktop");

/* main */
// main window
let mainWindow: Electron.BrowserWindow;
// quit
let isQuiting: boolean;
// finalshop result
let finalShopResultArray: any = [];

// create window
const createWindow = (): void => {
  try {
    // window
    mainWindow = new BrowserWindow({
      width: 1200, // width
      height: 1000, // height
      webPreferences: {
        nodeIntegration: false, // Node.js usable
        contextIsolation: true, // isolate context
        preload: path.join(__dirname, "preload.js"), // preload
      },
    });

    // hide menu bar
    mainWindow.setMenuBarVisibility(false);
    // load index.html
    mainWindow.loadFile(path.join(globalRootPath, 'www', 'index.html'));
    // ready
    mainWindow.once("ready-to-show", () => {
      // dev mode
      // mainWindow.webContents.openDevTools();
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
    // error
    if (e instanceof Error) {
      // show error message
      logger.error(`${e.message})`);
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
    path.join(globalRootPath, 'assets', 'zipcode.png')
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
  // close flg
  isQuiting = true;
});

// exit
app.on("window-all-closed", () => {
  logger.info("app: close app");
  // exit app
  app.quit();
});

/* IPC */
// scraping
ipcMain.on("scrape", async (_: any, arg: any) => {
  try {
    logger.info("ipc: scrape mode");
    // total counter
    let totalCounter: number = arg.record.flat().length;
    // initialize scraper
    await puppScraper.init(true);
    // wait for 1 sec
    await puppScraper.doWaitFor(1000);
    // go to google.com
    await puppScraper.doGo(DEF_NAVTIME_URL);
    // wait for 1 sec
    await puppScraper.doWaitFor(5000);
    // partnumber
    const totalNumber: number[] = makeNumberRange(1, totalCounter);

    // scrape pages
    for (let nm of totalNumber) {
      try {
        // zipcode obj
        let zipcodeObj: any = {
          address: "",
          zipcode: "",
        };
        // target address
        const targetAddress: string = arg.record.flat()[nm];
        // set address
        zipcodeObj['address'] = targetAddress;
        // wait for 5 sec
        await puppScraper.doWaitFor(1000);
        // type words
        await puppScraper.doType(mySelector.navtimeInputSelector, targetAddress);
        // wait for 5 sec
        await puppScraper.doWaitFor(3000);
        // click button
        await puppScraper.doClick(mySelector.navtimeSendButtonSelector);
        // wait for 5 sec
        await puppScraper.doWaitFor(3000);
        // click button
        await puppScraper.doClick(mySelector.navtimeUrlSelector);
        // wait for 5 sec
        await puppScraper.doWaitFor(3000);
        // scraped zipcode
        const result: string = await goScrape(mySelector.navtimeZipcodeSelector);
        // set zipcode
        zipcodeObj['zipcode'] = result;
        console.log(zipcodeObj);
        // push word and zipcode
        finalShopResultArray.push(zipcodeObj);
        // wait for 5 sec
        await puppScraper.doWaitFor(1000);

      } catch (err: unknown) {
        // error
        logger.error(err);
      } finally {
        // go to google.com
        await puppScraper.doGo(DEF_NAVTIME_URL);
      }
    }
    // nowtime
    const nowtime: string = `${dir_desktop}\\${new Date()
      .toISOString()
      .replace(/[^\d]/g, "")
      .slice(0, 14)}`;
    // CSV file name
    const targetpath: string = `${nowtime}.csv`;
    // write CSV
    await csvMaker.makeCsvData(finalShopResultArray, myColumns.navtimeColumns, targetpath);
    // show message
    dialogMaker.showmessage("info", "scraping finished.");

  } catch (e: unknown) {
    // error
    if (e instanceof Error) {
      // error
      logger.error(e.message);
    }
  }
});

// pause
ipcMain.on("pause", async () => {
  try {
    logger.info("ipc: pause mode");
    // show question dialog
    const selected: number = dialogMaker.showQuetion('Q', 'stop', 'app will stop ok？scraped data is written to csv file.');
    // yes
    if (selected == 0) {
      // nowtime
      const nowtime: string = `${dir_desktop}\\${new Date()
        .toISOString()
        .replace(/[^\d]/g, "")
        .slice(0, 14)}`;
      // csv file name
      const targetpath: string = `${nowtime}.csv`;
      // write to CSV
      await csvMaker.makeCsvData(finalShopResultArray, myColumns.navtimeColumns, targetpath);
      // pause message
      dialogMaker.showmessage("info", "stopped.");
      // close
      app.quit();

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

// exit
ipcMain.on("exit", async () => {
  try {
    logger.info("ipc: exit mode");
    // show question dialog
    const selected: number = dialogMaker.showQuetion('Q', 'exit', 'app will exist ok？ scraped data will be trashed.');

    // yes
    if (selected == 0) {
      // exit app
      app.quit();
    }
  } catch (e: unknown) {
    // error
    if (e instanceof Error) {
      // error
      logger.error(e.message);
    }
  }
});

// go scraping
const goScrape = async (selector: string): Promise<string> => {
  return new Promise(async (resolve, _) => {
    try {
      // url exists
      if (await puppScraper.doCheckSelector(selector)) {
        // wait for selector
        await puppScraper.doWaitFor(1000);
        // got value
        const tmpValues: any = await puppScraper.doSingleEval(
          selector,
          "innerHTML"
        );
        // result
        const tmpResult: string = tmpValues.trim();
        // return result
        resolve(tmpResult);

      } else {
        // error
        logger.debug("no selector");
        resolve("");
      }

    } catch (e: unknown) {
      // error
      if (e instanceof Error) {
        // error
        logger.error(e.message);
      }
      resolve("");
    }
  });
};

// number array
const makeNumberRange: any = (start: number, end: number) => [...new Array(end - start).keys()].map(n => n + start);
