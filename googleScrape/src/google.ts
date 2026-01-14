/*
 * google.ts
 *
 * function：scraping electron app
 **/

'use strict';

// namespace
import { myConst } from './consts/globalvariables';

// import modules
import { config as dotenv } from "dotenv"; // dotenv
import {
  BrowserWindow,
  app,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
} from "electron"; // electron
import * as path from "node:path"; // path
import { Scrape } from "./class/ElScrape0804"; // scraper
import Dialog from "./class/ElDialog0721"; // logger
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
// const
const DEF_GOOGLE_URL: string = "https://www.google.com/"; // scraping site
const CSV_ENCODING: string = "utf-8"; // csv char code
// logger
const logger: Logger = new Logger(myConst.COMPANY_NAME, myConst.APP_NAME, 'info');
// csv
const csvMaker: CSV = new CSV(CSV_ENCODING, logger);
// dialog
const dialogMaker: Dialog = new Dialog(logger);
// scraper
const puppScraper: Scrape = new Scrape(logger);
// env
dotenv({ path: path.join(__dirname, "../.env") });

// shopinfo selector
interface shopinfoselector {
  shopname: string;
  address: string;
  subaddress?: string;
  businesstime?: string;
  telephone: string;
  genre?: string;
  review?: string;
}
// shopinfo
interface shopinfoobj {
  word: string;
  shopname: string;
  businesstime: string;
  address: string;
  telephone: string;
  genre: string;
  review: string;
}

/// selector
const robotPageSelector: string = "#infoDiv";
// searchbox
const pageSearchBoxSelectorA: string = ".gLFyf";
// shopbusiness
const shopbusinessSelector: string = `div.b2JWxc.h-n > span > span > span > span > span:nth-child(1) > span`;
// shop info
const shopaddressSelector: string = `span.LrzXr`;
const shoptelephoneSelector: string = `span.LrzXr > a > span`;
// typeA(business)
const shatusBase: string = "div.nwVKo > div.loJjTe > div";
const shopnameSelector: string = `div.QpPSMb > div > div`;
const shopreviewSelector: string = `${shatusBase} > span.Aq14fc`;
const shopgenreSelector: string = 'span.E5BaQ';
// desktop path
const dir_home =
  process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"] ?? "";
const dir_desktop = path.join(dir_home, "Desktop");

// selectorsA
const googleSelectors: shopinfoselector = {
  shopname: shopnameSelector,
  review: shopreviewSelector,
  genre: shopgenreSelector,
  address: shopaddressSelector,
  businesstime: shopbusinessSelector,
  telephone: shoptelephoneSelector,
};

// columns
const globalColumns: string[] = [
  'word', // word
  'shopname', // shopname
  'address', // address
  'businesstime', // businesstime
  'telephone', // telephone
  'genre', // genre
  'review', // review
];

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
      //mainWindow.webContents.openDevTools();
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
    path.join(globalRootPath, 'assets', 'gourmet.png')
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
ipcMain.on("scrape", async (event: any, arg: any) => {
  // flg
  let firstFlg: boolean = false;
  // success Counter
  let successCounter: number = 0;
  // fail Counter
  let failCounter: number = 0;

  try {
    logger.info("ipc: scrape mode");
    // totalWords
    const totalWords: number = arg.length;
    // send totalWords
    event.sender.send("total", totalWords);
    // initialize scraper
    await puppScraper.init();

    // loop for arg
    for (const info of arg) {
      try {
        // wait for 1 sec
        await puppScraper.doWaitFor(1000);
        // go to google.com
        await puppScraper.doGo(DEF_GOOGLE_URL);
        // wait for 1 sec
        await puppScraper.doWaitFor(1000);
        // scrape
        const result: any = await doScrape(info, firstFlg);
        firstFlg = true;

        // result empty
        if (result != "") {
          // isempty
          const isEmpty: boolean =
            Object.keys(result).length === 0 && result.constructor === Object;
          // shop obj
          const emptyObj: shopinfoobj = {
            word: info,
            shopname: "",
            address: "",
            telephone: "",
            businesstime: "",
            genre: "",
            review: "",
          };

          // if empty
          if (result == "" || isEmpty) {
            // increment fail
            failCounter++;
            // push empty into array
            finalShopResultArray.push(emptyObj);
            // send error
            event.sender.send("statusUpdate", "error");

          } else {
            // increment success
            successCounter++;
            // push into array
            finalShopResultArray.push(result);
            // send success
            event.sender.send("statusUpdate", result);
          }
        } else {
          break;
        }
      } catch (err: unknown) {
        // fail
        failCounter++;
        // error
        if (err instanceof Error) {
          // error
          logger.error(err.message);
        }
      } finally {
        // send success
        event.sender.send("success", successCounter);
        // send fail
        event.sender.send("fail", failCounter);
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
    await csvMaker.makeCsvData(finalShopResultArray, globalColumns, targetpath);
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

// CSV
ipcMain.on("csv", async (event, _) => {
  try {
    logger.info("ipc: csv mode");
    // get CSV file name
    const filenames: any = await csvMaker.showCSVDialog(mainWindow);
    // get CSV data
    const csvResult: any = await csvMaker.getCsvData(filenames);
    // send
    const sendObj: any = {
      record: csvResult.record.flat(), // CSV data
      filename: csvResult.filename, // file name
    };
    // send result list
    event.sender.send("shopinfoCsvlist", sendObj);

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
      await csvMaker.makeCsvData(finalShopResultArray, globalColumns, targetpath);
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

// do scraping
const doScrape = async (info: string, flg: boolean): Promise<shopinfoobj | string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // data exists
      let existFlg: boolean = false;
      // shop data
      let tmpShopObj: shopinfoobj;
      // wait for 1 sec
      await puppScraper.doWaitFor(1000);

      // searchbox exists
      if (await puppScraper.doCheckSelector(pageSearchBoxSelectorA)) {
        logger.info(`searching for ${info}`);
        // wait for 3 sec
        await puppScraper.doWaitFor(3000);
        // type seach word
        await puppScraper.doType(pageSearchBoxSelectorA, info);
        // press enter
        await puppScraper.pressEnter();
        // wait for 2 sec
        await puppScraper.doWaitFor(2000);

        // robotcheck exists
        if ((await puppScraper.doCheckSelector(robotPageSelector))) {
          logger.info("ipc: waiting for robot check");
          // when first try
          if (!flg) {
            // wait for 1 min
            await puppScraper.doWaitFor(60000);
          } else {
            // error
            reject("");
          }

        } else {
          // wait for 1 sec
          await puppScraper.doWaitFor(2000);
        }
        // wait for 0.1 sec
        await puppScraper.doWaitFor(100);
        // shopname
        const shopname: string = await goScrape(googleSelectors.shopname);
        // no shopname
        if (shopname == "") {
          logger.info("no shopname found");
        } else {
          logger.info(`shopname is ${shopname}`);
          // wait for 0.1 sec
          await puppScraper.doWaitFor(100);
          existFlg = true;
        }

        // address
        const address: string = await goScrape(googleSelectors.address);
        // no address
        if (address == "") {
          logger.info("no address found");
        } else {
          logger.info(`address is ${address}`);
          // wait for 0.1 sec
          await puppScraper.doWaitFor(100);
          existFlg = true;
        }

        // telephone
        const telephone: string = await goScrape(googleSelectors.telephone);
        // no telephone
        if (telephone == "") {
          logger.info("no telephone found");
        } else {
          logger.info(`telephone is ${telephone}`);
          // wait for 0.1 sec
          await puppScraper.doWaitFor(100);
          existFlg = true;
        }

        // review
        const review: string = await goScrape(googleSelectors.review!);
        // no review
        if (review == "") {
          logger.info("no review found");
        } else {
          logger.info(`review is ${review}`);
          // wait for 0.1 sec
          await puppScraper.doWaitFor(100);
          existFlg = true;
        }

        // businesstime
        const businesstime: string = await goScrape(googleSelectors.businesstime!);
        //  no businesstime
        if (businesstime == "") {
          logger.info("no businesstime found");
        } else {
          logger.info(`businesstime is ${businesstime}`);
          // wait for 0.1 sec
          await puppScraper.doWaitFor(100);
          existFlg = true;
        }

        // genre
        const genre: string = await goScrape(googleSelectors.genre!);
        // no genre
        if (genre == "") {
          logger.info("no genre found");
        } else {
          logger.info(`genre is ${genre}`);
          // wait for 0.1 sec
          await puppScraper.doWaitFor(100);
          existFlg = true;
        }

        // site exists
        if (existFlg) {
          // shop data
          tmpShopObj = {
            word: info,
            shopname: shopname,
            address: address,
            businesstime: businesstime,
            telephone: telephone,
            genre: genre,
            review: review,
          };
          // return shop data
          resolve(tmpShopObj);
        } else {
          logger.debug(`error`);
          // error
          reject("error");
        }
      }

    } catch (e) {
      // empty shop data
      const emptyErrObj: shopinfoobj = {
        word: info,
        shopname: "",
        address: "",
        businesstime: "",
        telephone: "",
        genre: "",
        review: "",
      };
      // push into array
      finalShopResultArray.push(emptyErrObj);
      // return data
      resolve(emptyErrObj);
    }
  });
};

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
