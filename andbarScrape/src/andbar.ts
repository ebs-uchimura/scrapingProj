/*
 * andbar.ts
 *
 * function：scraping andbar app
 **/

"use strict";

/// namespace
import { myConst, myWindows, mySelector, myColumn } from "./consts/globalvariables";

/// modules
import { BrowserWindow, app, ipcMain, Tray, Menu, nativeImage } from "electron"; // electron
import * as path from "node:path"; // path
import { Scrape } from "./class/ElScrapeCore0719"; // scraper
import Dialog from "./class/ElDialog0721"; // dialog
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

// logger
const logger: Logger = new Logger(myConst.COMPANY_NAME, myConst.APP_NAME, 'all');
// dialog
const dialogMaker: Dialog = new Dialog(logger);
// csv
const csvMaker: CSV = new CSV(myConst.CSV_ENCODING, logger);
// puppeteer scraper
const puppScraper: Scrape = new Scrape(logger);
// root path
const dir_home: string =
  process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"] ?? "";
// desktop path
const dir_desktop: string = path.join(dir_home, "Desktop");

/*
 main
*/
// main window
let mainWindow: Electron.BrowserWindow;
// quitting flg
let isQuiting: boolean;
// final csv array
let finalCsvArray: any = [];
// final shopfinfo array
let finalResultArray: any = [];

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
        preload: path.join(__dirname, "preload.js"), // preload
      },
    });

    // hide menu bar
    mainWindow.setMenuBarVisibility(false);
    // index.html load
    mainWindow.loadFile(path.join(globalRootPath, 'www', 'index.html'));

    // ready
    mainWindow.once("ready-to-show", (): void => {
      // dev mode
      //mainWindow.webContents.openDevTools();
    });

    // close
    mainWindow.on("close", (event: any): void => {
      // quitting
      if (!isQuiting) {
        // except for apple
        if (process.platform !== "darwin") {
          // return false
          event.returnValue = false;
        }
      }
    });

    // close
    mainWindow.on("closed", (): void => {
      // destroy window
      mainWindow.destroy();
    });

  } catch (e: unknown) {
    // show error message
    logger.error(e);
  }
};

// enable sandbox
app.enableSandbox();

// avoid double boot of main process
const gotTheLock: boolean = app.requestSingleInstanceLock();
if (!gotTheLock) {
  logger.error("main process duplicated. exit.");
  app.quit();
}

// ready
app.on("ready", async () => {
  logger.info("app: electron is ready");
  // open window
  createWindow();
  // icon
  const icon: Electron.NativeImage = nativeImage.createFromPath(
    path.join(globalRootPath, 'assets', 'andbar.ico')
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
  // reopen
  mainTray.on("double-click", () => mainWindow.show());
});

// when activate
app.on("activate", () => {
  // no open window
  if (BrowserWindow.getAllWindows().length === 0) {
    // reopen window
    createWindow();
  }
});

// when quit
app.on("before-quit", () => {
  logger.info("ipc: quit mode");
  // on quitflg
  isQuiting = true;
});

// when all closed
app.on("window-all-closed", () => {
  logger.info("app: close app");
  // quit app
  app.quit();
});

/*
 IPC
*/
/* page */
ipcMain.on("page", async (_, arg) => {
  try {
    logger.info("ipc: page mode");
    // transfer url
    let url: string = "";

    // switch on mode
    switch (arg) {
      // exit page
      case "exit_page":
        // except for apple
        if (process.platform !== "darwin") {
          // quit app
          app.quit();
          return false;
        }
        // clear url
        url = "";
        break;

      // top page
      case "top_page":
        // set url
        url = "index.html";
        break;

      // URL page
      case "url_page":
        // set url
        url = "url.html";
        break;

      // shop page
      case "shop_page":
        // set url
        url = "shop.html";
        break;

      default:
        // clear url
        url = "";
    }
    // transfer
    await mainWindow.loadFile(path.join(globalRootPath, 'www', url));

  } catch (e: unknown) {
    // show error message
    logger.error(e);
  }
});

// CSV
ipcMain.on("csv", async (event, _) => {
  try {
    logger.info("ipc: csv mode");
    // get CSV data
    const csvPath: any = await csvMaker.showCSVDialog(mainWindow);
    // get CSV data
    const result: any = await csvMaker.getCsvData(csvPath);
    // return csv data
    event.sender.send("shopinfoCsvlist", result);

  } catch (e: unknown) {
    // show error message
    logger.error(e);
  }
});

// scrape
ipcMain.on("scrape", async (event: any, arg: any) => {
  try {
    logger.info("ipc: scrape mode");
    // selector
    let selectorVariable: number = 0;
    // success counter
    let successCounter: number = 0;
    // fail counter
    let failCounter: number = 0;
    // total counter
    let totalCounter: number = arg.length;
    // tag regexp
    const regex: RegExp = new RegExp("(<([^>]+)>)", "gi");
    // initialize CSV array
    finalResultArray = [];
    // initialize scraper
    await puppScraper.init();
    // update total
    event.sender.send("total", totalCounter);

    // collect urls
    for (let url of arg) {
      try {
        // businesstime flg
        let BusinessTimeFlg: boolean = false;
        // shopname selector
        let AndBarShopnameSelector: string;
        // budget selector
        let AndBarBudgetSelector: string;
        // telephone selector
        let AndBarTelephoneSelector: string;
        // address selector
        let AndBarAddressSelector: string;
        // system selector
        let AndBarSystemSelector: string;
        // businesstime selector
        let AndBarBusinessTimeSelector: string;
        // businesstime1 selector
        let AndBarBusinessTime1Selector: string;
        // businesstime2 selector
        let AndBarBusinessTime2Selector: string;
        // businesstime3 selector
        let AndBarBusinessTime3Selector: string;
        // businesstime4 selector
        let AndBarBusinessTime4Selector: string;
        // businesstime5 selector
        let AndBarBusinessTime5Selector: string;
        // businesstime6 selector
        let AndBarBusinessTime6Selector: string;
        // businesstime7 selector
        let AndBarBusinessTime7Selector: string;
        // businesstime8 selector
        let AndBarBusinessTime8Selector: string;
        // andbar info 2 selector
        let AndBarInfo2Selector: string;
        // andbar info 3 selector
        let AndBarInfo3Selector: string;
        // andbar info 4 selector
        let AndBarInfo4Selector: string;
        // andbar info 5 selector
        let AndBarInfo5Selector: string;
        // andbar info 6 selector
        let AndBarInfo6Selector: string;
        // andbar info 7 selector
        let AndBarInfo7Selector: string;
        // andbar info 8 selector
        let AndBarInfo8Selector: string;
        // andbar info 9 selector
        let AndBarInfo9Selector: string;
        // andbar info 10 selector
        let AndBarInfo10Selector: string;
        // andbar info 11 selector
        let AndBarInfo11Selector: string;
        // andbar info 12 selector
        let AndBarInfo12Selector: string;
        // andbar info 13 selector
        let AndBarInfo13Selector: string;
        // andbar info 14 selector
        let AndBarInfo14Selector: string;
        // andbar selectors
        let AndBarSelectors: any;

        // all selectors
        const myShopObj: any = {
          url: url,
          shopname: "",
          budget: "",
          telephone: "",
          address: "",
          system: "",
          businesstime1: "",
          businesstime2: "",
          businesstime3: "",
          businesstime4: "",
          businesstime5: "",
          businesstime6: "",
          businesstime7: "",
          businesstime8: "",
          info2: "",
          info3: "",
          info4: "",
          info5: "",
          info6: "",
          info7: "",
          info8: "",
          info9: "",
          info10: "",
          info11: "",
          info12: "",
          info13: "",
          info14: "",
        };
        // goto top page
        await puppScraper.doGo(url);
        // wait 1 sec
        await puppScraper.doWaitFor(1000);
        logger.debug(`app: scraping ${url}`);
        // business time
        AndBarBusinessTimeSelector = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(1) > h3`;
        logger.debug("app: scraping businesstime");
        // url
        const tmpValues: any = await puppScraper.doSingleEval(
          AndBarBusinessTimeSelector,
          "innerHTML"
        );
        // business time 
        if (tmpValues.indexOf("営業時間") != -1) {
          BusinessTimeFlg = true;
          logger.debug("businesstime exists");
        }
        // shop name selector
        AndBarShopnameSelector = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mtkwgb > div > div > div > div > div > p.css-3gxuzy`;
        // shop name selector
        AndBarBudgetSelector = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div.css-15ldb09 > div > p:nth-child(3)`;
        // shop name selector
        AndBarTelephoneSelector = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mtkwgb > div > div > div > div > a > span:nth-child(2)`;
        // business time 
        if (BusinessTimeFlg) {
          // shop business time 1 selector
          AndBarBusinessTime1Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(1) > div > p:nth-child(1)`;
          // shop business time 2 selector
          AndBarBusinessTime2Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(1) > div > p:nth-child(2)`;
          // shop business time 3 selector
          AndBarBusinessTime3Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(1) > div > p:nth-child(3)`;
          // shop business time 4 selector
          AndBarBusinessTime4Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(1) > div > p:nth-child(4)`;
          // shop business time 5 selector
          AndBarBusinessTime5Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(1) > div > p:nth-child(5)`;
          // shop business time 6 selector
          AndBarBusinessTime6Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(1) > div > p:nth-child(6)`;
          // shop business time 7 selector
          AndBarBusinessTime7Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(1) > div > p:nth-child(7)`;
          // shop business time 8 selector
          AndBarBusinessTime8Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(1) > div > p:nth-child(8)`;
          // shop address selector
          AndBarAddressSelector = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(2) > div > p:nth-child(1)`;
          // shop system selector
          AndBarSystemSelector = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > section:nth-child(5) > div:nth-child(2) > div > p`;
          // info 2
          AndBarInfo2Selector = "";

        } else {
          // business time 1 selector
          AndBarBusinessTime1Selector = "";
          // business time 2 selector
          AndBarBusinessTime2Selector = "";
          // business time 3 selector
          AndBarBusinessTime3Selector = "";
          // business time 4 selector
          AndBarBusinessTime4Selector = "";
          // business time 5 selector
          AndBarBusinessTime5Selector = "";
          // business time 6 selector
          AndBarBusinessTime6Selector = "";
          // business time 7 selector
          AndBarBusinessTime7Selector = "";
          // business time 8 selector
          AndBarBusinessTime8Selector = "";
          // address selector
          AndBarAddressSelector = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(1) > div > p:nth-child(1)`;
          // system selector
          AndBarSystemSelector = "";
          // info 2 selector
          AndBarInfo2Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(2) > div`;
        }
        // info 3 selector
        AndBarInfo3Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(3) > div`;
        // info 4 selector
        AndBarInfo4Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(4) > div`;
        // info 5 selector
        AndBarInfo5Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(5) > div`;
        // info 6 selector
        AndBarInfo6Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(6) > div`;
        // info 7 selector
        AndBarInfo7Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(7) > div`;
        // info 8 selector
        AndBarInfo8Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(8) > div`;
        // info 9 selector
        AndBarInfo9Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(9) > div`;
        // info 10 selector
        AndBarInfo10Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(10) > div`;
        // info 11 selector
        AndBarInfo11Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(11) > div`;
        // info 12 selector
        AndBarInfo12Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(12) > div`;
        // info 13 selector
        AndBarInfo13Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(13) > div`;
        // info 14 selector
        AndBarInfo14Selector = `#root > div.css-sbhcw1 > section.css-3m41uf > div > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(14) > div`;

        // all selectors
        AndBarSelectors = {
          shopname: AndBarShopnameSelector,
          budget: AndBarBudgetSelector,
          telephone: AndBarTelephoneSelector,
          address: AndBarAddressSelector,
          system: AndBarSystemSelector,
          businesstime1: AndBarBusinessTime1Selector,
          businesstime2: AndBarBusinessTime2Selector,
          businesstime3: AndBarBusinessTime3Selector,
          businesstime4: AndBarBusinessTime4Selector,
          businesstime5: AndBarBusinessTime5Selector,
          businesstime6: AndBarBusinessTime6Selector,
          businesstime7: AndBarBusinessTime7Selector,
          businesstime8: AndBarBusinessTime8Selector,
          info2: AndBarInfo2Selector,
          info3: AndBarInfo3Selector,
          info4: AndBarInfo4Selector,
          info5: AndBarInfo5Selector,
          info6: AndBarInfo6Selector,
          info7: AndBarInfo7Selector,
          info8: AndBarInfo8Selector,
          info9: AndBarInfo9Selector,
          info10: AndBarInfo10Selector,
          info11: AndBarInfo11Selector,
          info12: AndBarInfo12Selector,
          info13: AndBarInfo13Selector,
          info14: AndBarInfo14Selector,
        };

        // loop for URL
        for (const key of Object.keys(AndBarSelectors)) {
          try {
            // result
            let tmpResult: string = "";
            // wait for 0.2s
            await puppScraper.doWaitFor(200);
            logger.silly("app: scraping information");
            // get result
            const result: any = await doScrape(AndBarSelectors[key]);
            console.log(result);

            // if empty
            if (result != "") {
              // tag exists
              if (regex.test(result)) {
                // remove tag
                tmpResult = result.replace(/(<([^>]+)>)/gi, "");
              } else {
                // as is
                tmpResult = result;
              }
              // set result
              myShopObj[`${key}`] = tmpResult;
            }

          } catch (error: unknown) {
            // show error message
            logger.error(error);
          }
        }
        // increment success counter
        successCounter++;
        // is empty
        const isEmpty =
          Object.keys(myShopObj).length === 0 &&
          myShopObj.constructor === Object;

        // if empty
        if (!isEmpty) {
          // push into array
          finalResultArray.push(myShopObj);
        }

      } catch (err: unknown) {
        // show error message
        logger.error(err);
        // increment fail counter
        failCounter++;

      } finally {
        // update status
        event.sender.send("statusUpdate", url);
        // update success
        event.sender.send("success", successCounter);
        // update fail
        event.sender.send("fail", failCounter);
      }
    }

    // CSVfile name
    const nowtime: string = `${dir_desktop}\\${new Date()
      .toISOString()
      .replace(/[^\d]/g, "")
      .slice(0, 14)}.csv`;
    // write to file
    await csvMaker.makeCsvData(finalResultArray, myColumn.columns, nowtime);
    logger.debug("CSV writing finished");
    // close scraper
    await puppScraper.doClose();
    // end message
    dialogMaker.showmessage("info", "scraping finished.");

  } catch (e: unknown) {
    // show error message
    logger.error(e);
  }
});

// scrape url 
ipcMain.on("scrapeurl", async (event: any, arg: any) => {
  try {
    logger.info("ipc: scrape mode");
    // seemore selector
    let seemoreSelector: string = "";
    // success counter
    let successCounter: number = 0;
    // fail counter
    let failCounter: number = 0;
    // page counter
    let pageCounter: number = 1;
    // total number
    let totalNumber: any = 0;
    // init CSV array
    finalCsvArray = [];
    // init scraper
    await puppScraper.init();
    // target URL
    const targetURL: string = myConst.PEPPER_BASE + String(arg);
    // goto top
    await puppScraper.doGo(targetURL);
    logger.debug(`app: scraping ${targetURL}`);
    // wait for 1s
    await puppScraper.doWaitFor(3000);

    // page not exists
    if (!(await puppScraper.doCheckSelector(mySelector.AndBarTotalSelector))) {
      // throw error
      throw new Error("no page");
    }
    logger.debug("app: scraping total");
    // total number
    totalNumber = await doScrape(mySelector.AndBarTotalSelector);
    // update total
    event.sender.send("total", Number(totalNumber));

    // loop numbers
    const numbers = [...Array(Number(totalNumber)).keys()];

    // loop
    for await (const i of numbers) {
      try {
        // wait for 0.2sec
        await puppScraper.doWaitFor(200);

        // pageMAX
        if (i % myConst.PAGE_COUNT == 0) {
          if (i / myConst.PAGE_COUNT == 1) {
            seemoreSelector = mySelector.AndBarSeemoreSelector;
          } else {
            seemoreSelector = mySelector.AndBarSeemoreNextSelector;
          }
          // click seemore
          await puppScraper.doClick(seemoreSelector);
          logger.debug("app: seamore clicked");
          // wait for 0.5sec
          await puppScraper.doWaitFor(500);
          // increment page counter
          pageCounter++;
        }
        logger.debug("app: scraping url");
        // URL
        const tmpUrl: any = await doScrapeUrl((i % myConst.PAGE_COUNT) + 1);

        // fail
        if (tmpUrl == "") {
          // increment fail counter
          failCounter++;
        } else {
          // success
          finalCsvArray.push({
            url: tmpUrl,
          });
          // increment success counter
          successCounter++;
        }

      } catch (err) {
        // show error message
        logger.error(err);
        // increment fail counter
        failCounter++;

      } finally {
        // update success
        event.sender.send("success", successCounter);
        // update fail
        event.sender.send("fail", failCounter);
      }
    }
    // now time
    const nowtime: string = `${dir_desktop}\\${new Date()
      .toISOString()
      .replace(/[^\d]/g, "")
      .slice(0, 14)}`;
    // CSVfile name
    const targetpath: string = `${nowtime}_url.csv`;
    console.log(finalCsvArray);
    // write to CSV file
    await csvMaker.makeCsvData(finalCsvArray, myColumn.columns, targetpath);
    // end message
    dialogMaker.showmessage("info", "finished scraping url.");

  } catch (e: unknown) {
    // show error message
    logger.error(e);
    // error
    throw new Error("error");
  }
});

// pause
ipcMain.on("pause", async (_: any, arg: any) => {
  try {
    logger.info("ipc: pause mode");
    // CSV path
    let targetpath: string = "";
    // CSV data
    let targetCsvArray: any = [];
    // tmp columns
    let tmpColumns: string[] = [];
    // show question dialog
    const selected: number = dialogMaker.showQuetion('Q', 'stop', "app will stop ok？scraped data is written to csv file.");

    // yes
    if (selected == 0) {
      // now time
      const nowtime: string = `${dir_desktop}\\${new Date()
        .toISOString()
        .replace(/[^\d]/g, "")
        .slice(0, 14)}`;

      // URL
      if (arg == "url") {
        // columns
        tmpColumns = myColumn.urlColumns;
        // CSV
        targetCsvArray = finalCsvArray;
        // CSV file name
        targetpath = `${nowtime}_url.csv`;

      } else if (arg == "shop") {
        // columns
        tmpColumns = myColumn.columns;
        // CSV
        targetCsvArray = finalResultArray;
        // CSV file name
        targetpath = `${nowtime}.csv`;
      }
      console.log(targetCsvArray);
      // make CSV
      await csvMaker.makeCsvData(targetCsvArray, tmpColumns, targetpath);
      // close scraper
      await puppScraper.doClose();
      // show pause message
      dialogMaker.showmessage("info", "stopped.");

    } else {
      // close dialog
      return false;
    }

  } catch (e: unknown) {
    // show error message
    logger.error(e);
  }
});

// exit
ipcMain.on("exit", async () => {
  try {
    logger.info("ipc: exit mode");
    // exit app
    exitApp();

  } catch (e: unknown) {
    // show error message
    logger.error(e);
  }
});

// scrape shop information
const doScrape = async (selector: string): Promise<any> => {
  return new Promise(async (resolve, _) => {
    try {
      // wait for 1 sec
      await puppScraper.doWaitFor(1000);

      // selector exists
      if (selector !== "") {
        // url
        const tmpValues: any = await puppScraper.doSingleEval(
          selector,
          "innerHTML"
        );
        // result
        resolve(tmpValues.trim());

      } else {
        // return blank
        resolve("");
      }

    } catch (e) {
      // show error message
      logger.error(e);
      // return blank
      resolve("");
    }
  });
};

// URL scraping
const doScrapeUrl = async (num: number): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      // URLselector
      const AndBarDetailSelector: string = `#root > div:nth-child(2) > div > section > div.css-1q8fput > div.css-9hqybf > div.css-11yd8q > ul > li:nth-child(${num}) > span > div.css-48hjcm > a`;
      // wait for 0.2 sec
      await puppScraper.doWaitFor(200);

      // page exists
      if (await puppScraper.doCheckSelector(AndBarDetailSelector)) {
        // wait for 0.2 sec
        await puppScraper.doWaitFor(200);
        // tmp url
        const tmpUrl: any = await puppScraper.doSingleEval(
          AndBarDetailSelector,
          "href"
        );
        logger.debug(`scraping: ${tmpUrl}`);
        // success url
        resolve(tmpUrl);

      } else {
        logger.error("no selector.");
        // fail
        throw new Error("no selector");
      }

    } catch (e: unknown) {
      // show error message
      logger.error(e);
      // reject
      reject('error');
    }
  });
};

// exit
const exitApp = (): void => {
  try {
    logger.info("ipc: exit mode");
    // show question dialog
    const selected: number = dialogMaker.showQuetion('Q', 'exit', 'app will exist ok？ scraped data will be trashed.');
    // yes
    if (selected == 0) {
      // quit app
      app.quit();
    }

  } catch (e: unknown) {
    // show error message
    logger.error(e);
  }
};
