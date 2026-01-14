/*
 * omochi.ts
 *
 * function：scraping omochi app
 **/

'use strict';

// 定数
// namespace
import { myConst, myWindows, mySelector } from "./consts/globalvariables";

// import modules
import { BrowserWindow, app, ipcMain, Tray, Menu, nativeImage } from "electron"; // electron
import * as path from "node:path"; // path
import { Scrape } from "./class/ElScrapeCore0801"; // scraper
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
// scrape url
ipcMain.on("scrapeurl", async (_: any, arg: any) => {
  try {
    logger.debug("ipc: scrape mode");
    // csv array
    let finalCsvArray = [];
    // initialize scraper
    await puppScraper.init();
    // wait for 1 sec
    await puppScraper.doWaitFor(1000);
    // goto top
    await puppScraper.doGo(arg);
    logger.debug(`ipc: scraping ${arg}...`);
    //  wait for 2 sec
    await puppScraper.doWaitFor(2000);
    // url
    const tmpUrls: any = await puppScraper.doMultiEval(mySelector.omochiLinkSelector, "href");
    logger.debug(tmpUrls);
    // make url obj
    const tmpUrlObj: any = tmpUrls.map((url: any) => {
      return {
        url: url
      }
    });
    console.log(tmpUrlObj);
    // make url obj
    finalCsvArray.push(tmpUrlObj);
    
    // nowtime
    const nowtime: string = `${dir_desktop}\\${new Date()
      .toISOString()
      .replace(/[^\d]/g, "")
      .slice(0, 14)}`;
    // file name
    const targetpath: string = `${nowtime}_url.csv`;
    logger.debug('scrapeurl: making csv...');
    // make CSV
    await csvMaker.makeCsvData(finalCsvArray.flat().flat(), ['url'], targetpath);
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

