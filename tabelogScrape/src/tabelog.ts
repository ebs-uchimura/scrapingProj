/*
 * tabelog.ts
 *
 * function：scraping electron app
 **/

// import modules
import {
  BrowserWindow,
  app,
  ipcMain,
  dialog,
  Tray,
  Menu,
  nativeImage,
} from "electron"; // electron
import * as path from "path"; // path
import { Scrape } from "./class/Scrape1103"; // scraper
import Dialog from "./class/ElectronDialog0118"; // logger
import Logger from "./class/Logger0928"; // logger
import CSV from "./class/ElectronCsv0119"; // csv

// const
const CSV_ENCODING: string = "SJIS"; // csv encoding

// csv
const csvMaker: CSV = new CSV(CSV_ENCODING);
// logger
const logger: Logger = new Logger("../logs");
// dialog
const dialogMaker: Dialog = new Dialog();
// scraper
const puppScraper: Scrape = new Scrape();

// Tabelog selector
const tabeLogUrlSelector: string = ".list-rst__rst-name-target";
// Tabelog hit selector
const tabeLogTotalSelector: string = ".c-page-count__num";
// Tabelog genre selector
const tabelLogGenreSelector: string =
  "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(2) > td > span";
// Tabelog mainshopname selector
const tabeLogMainShopnameSelector: string =
  "#rstdtl-head > div.rstdtl-header > section > div.rdheader-title-data > div.rdheader-rstname-wrap > div > h2 > span";
// Tabelog mainshopname ruby selector
const tabeLogMainShopnameRubySelector: string =
  "#rstdtl-head > div.rstdtl-header > section > div.rdheader-title-data > div.rdheader-rstname-wrap > div > span";
// Tabelog station selector
const tabeLogStationSelector: string =
  "#rstdtl-head > div.rstdtl-header > section > div.rdheader-info-data > div > div > div:nth-child(1) > dl.rdheader-subinfo__item.rdheader-subinfo__item--station > dd > div > div.linktree__parent > a > span";
// Tabelog subshopname selector
const tabeLogMainSubshopname: string =
  "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(1) > td > div > span";
// Tabelog reserve telephone selector
const tabeLogReservephoneSelector: string =
  "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(3) > td > p > strong";
// Tabelog reservable selector
const tabeLogReservableSelector: string =
  "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(4) > td > p";
// Tabelog address1 selector
const tabeLogAddress1Selector: string =
  "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(5) > td > p > span:nth-child(1)";
// Tabelog address2 selector
const tabeLogAddress2Selector: string =
  "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(5) > td > p > span:nth-child(2)";
// Tabelog businesstime monday selector
const tabeLogBusinesstimeMonSelector: string =
  "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(1) > ul > li";
// Tabelog businesstime tuesday selector
const tabeLogBusinesstimeTueSelector: string =
  "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(2) > ul > li";
// Tabelog businesstime wednesday selector
const tabeLogBusinesstimeWedSelector: string =
  "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(3) > ul > li";
// Tabelog businesstime thursday selector
const tabeLogBusinesstimeThuSelector: string =
  "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(4) > ul > li";
// Tabelog businesstime friday selector
const tabeLogBusinesstimeFriSelector: string =
  "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(5) > ul > li";
// Tabelog businesstime saturday selector
const tabeLogBusinesstimeSatSelector: string =
  "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(6) > ul > li";
// Tabelog businesstime sunday selector
const tabeLogBusinesstimeSunSelector: string =
  "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(7) > ul > li";
// Tabelog businesstime holiday selector
const tabeLogBusinesstimeHolSelector: string =
  "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > div > ul > li";
// Tabelog payment card selector
const tabeLogPaymentCardSelector: string =
  "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(10) > td > div:nth-child(1) > p";
// Tabelog payment electronic mony selector
const tabeLogPaymentElSelector: string =
  "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(10) > td > div:nth-child(2) > p";
// Tabelog payment code selector
const tabeLogPaymentCodeSelector: string =
  "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(10) > td > div:nth-child(3) > p";
// Tabelog sheet selector
const tabeLogSheetSelector: string =
  "#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(1) > td > p";
// Tabelog reserve limit selector
const tabeLogReserveLimitSelector: string =
  "#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(2) > td > p";
// Tabelog privateroom selector
const tabeLogPrivateRoomSelector: string =
  "#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(3) > td > p";
// Tabelog rental selector
const tabeLogRentalSelector: string =
  "#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(4) > td > p:nth-child(1)";
// Tabelog smoking selector
const tabeLogSmokingSelector: string =
  "#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(5) > td";
// Tabelog parking selector
const tabeLogParkingSelector: string =
  "#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(6) > td";
// Tabelog alldrink selector
const tabeLogAlldrinkSelector: string =
  "#rst-data-head > table:nth-child(6) > tbody > tr:nth-child(1) > td > p";
// Tabelog homepage selector
const tabeLogHomepageSelector: string =
  "#rst-data-head > table:nth-child(9) > tbody > tr:nth-child(5) > td > p > a > span";
// Tabelog telephone selector
const tabeLogTelephoneSelector: string =
  "#rst-data-head > table:nth-child(9) > tbody > tr:nth-child(6) > td > p > strong";
// Tabelog telephone2 selector
const tabeLogTelephone2Selector: string =
  "#rst-data-head > table:nth-child(9) > tbody > tr:nth-child(5) > td > p > strong";

// all selectors
const tabeLogSelectors: any = {
  shopname: tabeLogMainShopnameSelector,
  shopnameruby: tabeLogMainShopnameRubySelector,
  station: tabeLogStationSelector,
  shopname2: tabeLogMainSubshopname,
  genre: tabelLogGenreSelector,
  telephone: tabeLogReservephoneSelector,
  reservable: tabeLogReservableSelector,
  address1: tabeLogAddress1Selector,
  address2: tabeLogAddress2Selector,
  monday: tabeLogBusinesstimeMonSelector,
  tuesday: tabeLogBusinesstimeTueSelector,
  wednesday: tabeLogBusinesstimeWedSelector,
  thursday: tabeLogBusinesstimeThuSelector,
  friday: tabeLogBusinesstimeFriSelector,
  saturday: tabeLogBusinesstimeSatSelector,
  sunday: tabeLogBusinesstimeSunSelector,
  holiday: tabeLogBusinesstimeHolSelector,
  creditcard: tabeLogPaymentCardSelector,
  electronicmoney: tabeLogPaymentElSelector,
  codepayment: tabeLogPaymentCodeSelector,
  seat: tabeLogSheetSelector,
  capacity: tabeLogReserveLimitSelector,
  privateroom: tabeLogPrivateRoomSelector,
  vip: tabeLogRentalSelector,
  smoking: tabeLogSmokingSelector,
  parking: tabeLogParkingSelector,
  alldrink: tabeLogAlldrinkSelector,
  homepage: tabeLogHomepageSelector,
  shopphone: tabeLogTelephoneSelector,
  shopphone2: tabeLogTelephone2Selector,
};

// columns
const globalColumns: { [key: string]: string } = {
  shopname: "shopname", // shopname
  shopnameruby: "shopnameruby", // shopname ruby
  station: "station", // station
  shopname2: "shopname2", // shopname2
  genre: "genre", // genre
  telephone: "telephone", // telephone
  reservable: "reservable", // reservable
  address1: "address1", // address1
  address2: "address2", // address2
  monday: "monday", // monday
  tuesday: "tuesday", // tuesday
  wednesday: "wednesday", // wednesday
  thursday: "thursday", // thursday
  friday: "friday", // friday
  saturday: "saturday", // saturday
  sunday: "sunday", // sunday
  holiday: "holiday", // holiday
  creditcard: "creditcard", // creditcard
  electronicmoney: "electronicmoney", // electronic money
  codepayment: "codepayment", // code payment
  seat: "seat", // seat
  capacity: "capacity", // capacity
  privateroom: "privateroom", // privateroom
  vip: "vip", // vip
  smoking: "smoking", // smoking
  parking: "parking", // parking
  alldrink: "alldrink", // alldrink
  homepage: "homepage", // homepage
  shopphone: "shopphone", // shopphone
  shopphone2: "shopphone2", // shopphone2
};

// desktop path
const dir_home =
  process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"] ?? "";
const dir_desktop = path.join(dir_home, "Desktop");

/*
 main
*/
// mainWindow
let mainWindow: Electron.BrowserWindow;
// isQuiting flg
let isQuiting: boolean;
// final Csv Array
let finalCsvArray: any = [];
// final Result Array
let finalResultArray: any = [];

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
        preload: path.join(__dirname, "preload/preload.js"), // preload
      },
    });

    // hide menu bar
    mainWindow.setMenuBarVisibility(false);
    // load index.html
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
    // ready
    mainWindow.once("ready-to-show", () => {
      // dev mode
      // mainWindow.webContents.openDevTools();
    });

    // minimize
    mainWindow.on("minimize", (event: any): void => {
      // cancel
      event.preventDefault();
      // hide window
      mainWindow.hide();
      // return false
      event.returnValue = false;
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
      logger.error(e.message);
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
    path.join(__dirname, "../assets/gourmet.ico")
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
/* page */
ipcMain.on("page", async (_, arg) => {
  try {
    logger.info("ipc: page mode");
    // target url
    let url: string;

    // switch on mode
    switch (arg) {
      // exit_page
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
        url = "../index.html";
        break;

      // url page
      case "url_page":
        // set url
        url = "../url.html";
        break;

      // shop page
      case "shop_page":
        // set url
        url = "../shop.html";
        break;

      default:
        // clear url
        url = "";
    }
    // transfer
    await mainWindow.loadFile(path.join(__dirname, url));
  } catch (e: unknown) {
    // error
    if (e instanceof Error) {
      // show error message
      logger.error(e.message);
    }
  }
});

// CSV
ipcMain.on("csv", async (event, _) => {
  try {
    logger.info("ipc: csv mode");
    // get CSV data
    const result: any = await csvMaker.getCsvDataDialog();
    // return csv data
    event.sender.send("shopinfoCsvlist", result);
  } catch (e: unknown) {
    // error
    if (e instanceof Error) {
      // show error message
      logger.error(e.message);
    }
  }
});

// scrape
ipcMain.on("scrape", async (event: any, arg: any) => {
  try {
    logger.info("ipc: scrape mode");
    // total counter
    let totalCounter: number = arg.length;
    // success counter
    let successCounter: number = 0;
    // fail counter
    let failCounter: number = 0;
    // error array
    let errorResultArray: any[] = [];
    // initialize CSV array
    finalResultArray = [];
    // tag regexp
    const regex: RegExp = new RegExp("(<([^>]+)>)", "gi");
    // initialize scraper
    await puppScraper.init();
    // update total
    event.sender.send("total", totalCounter);

    // scrape pages
    for (let url of arg) {
      try {
        // shop data
        let myShopObj: any = {
          shopname: "", // shopname
          shopnameruby: "", // shopname ruby
          station: "", // status
          shopname2: "", // shopname2
          genre: "", // genre
          telephone: "", // telephone
          reservable: "", // reservable
          address1: "", // address1
          address2: "", // address2
          monday: "", // monday
          tuesday: "", // tuesday
          wednesday: "", // wednesday
          thursday: "", // thursday
          friday: "", // friday
          saturday: "", // saturday
          sunday: "", // sunday
          holiday: "", // holiday
          creditcard: "", // creditcard
          electronicmoney: "", // electronic money
          codepayment: "", // code payment
          seat: "", // seat
          capacity: "", // reservable
          privateroom: "", // privateroom
          vip: "", // vip
          smoking: "", // smoking
          parking: "", // parking
          alldrink: "", // alldrink
          homepage: "", // homepage
          shopphone: "", // shopphone
          shopphone2: "", // shopphone2
        };

        // goto top
        await puppScraper.doGo(url);
        // wait for 2 sec
        await puppScraper.doWaitFor(2 * 1000);
        logger.debug(`app: scraping ${url}`);
        // update target url
        event.sender.send("statusUpdate", url);

        // URLloop
        Object.keys(tabeLogSelectors).forEach(async (key: any) => {
          // result
          let tmpResult: string;
          // scrape
          const result: string = await doScrape(tabeLogSelectors[key]);
          // empty evaluation
          const isEmpty =
            Object.keys(result).length === 0 && result.constructor === Object;

          // empty
          if (!isEmpty) {
            // tag exists
            if (regex.test(result)) {
              tmpResult = result.replace(/(<([^>]+)>)/gi, "");
            } else {
              tmpResult = result;
            }
            // set result
            myShopObj[`${key}`] = tmpResult;
          }
        });
        // increment success
        successCounter++;
        // push into array
        finalResultArray.push(myShopObj);
      } catch (err) {
        // error
        if (err instanceof Error) {
          // push into error url array
          errorResultArray.push({ url: url });
          // error
          logger.error(err.message);
          // increment fail
          failCounter++;
        }
      } finally {
        // update success
        event.sender.send("success", successCounter);
        // update fail
        event.sender.send("fail", failCounter);
      }
    }

    // CSV file name
    const nowtime: string = `${dir_desktop}\\${new Date()
      .toISOString()
      .replace(/[^\d]/g, "")
      .slice(0, 14)}.csv`;
    // make csv
    csvMaker.makeCsvData(finalResultArray, globalColumns, nowtime);
    logger.debug("CSV writing finished");

    // error exists
    if (errorResultArray.length > 0) {
      // error csv file name
      const errornowtime: string = `${dir_desktop}\\error_${new Date()
        .toISOString()
        .replace(/[^\d]/g, "")
        .slice(0, 14)}.csv`;
      // make csv
      csvMaker.makeCsvData(errorResultArray, globalColumns, errornowtime);
      logger.debug("error CSV writing finished");
    }

    // close puppeteer
    await puppScraper.doClose();
    // show finished message
    dialogMaker.showmessage("info", "scraping finished");
  } catch (e: unknown) {
    // error
    if (e instanceof Error) {
      // error
      logger.error(e.message);
    }
  }
});

// scrape url
ipcMain.on("scrapeurl", async (event: any, arg: any) => {
  try {
    logger.info("ipc: scrape mode");
    // total counter
    let finalTotalCounter: number = 0;
    // success counter
    let successCounter: number = 0;
    // fail counter
    let failCounter: number = 0;
    // initialize array
    finalCsvArray = [];

    // initialize puppeteer
    await puppScraper.init();
    // goto top
    await puppScraper.doGo(`${arg}/1`);

    logger.debug(`scraping ${arg}/1`);

    // wait for 2 sec
    await puppScraper.doWaitFor(2 * 1000);

    // url exists
    if (await puppScraper.doCheckSelector(tabeLogTotalSelector)) {
      logger.info("url exists");
      // wait for datalist
      await puppScraper.doWaitSelector(tabeLogTotalSelector, 10000);
      // url
      const tmptotal: any = await puppScraper.doMultiEval(
        tabeLogTotalSelector,
        "innerHTML"
      );
      // totalCounter
      const totalCounter =
        Number(tmptotal[2].replace(/(<([^>]+)>)/gi, "")) / 20;
      logger.info(`total is ${totalCounter} pages`);

      // over limit
      if (totalCounter > 60) {
        // set limit
        finalTotalCounter = 60;
      } else {
        // rounddown
        finalTotalCounter = Math.floor(totalCounter);
      }
      logger.info(`final total is ${finalTotalCounter}`);

      // not isNaN
      if (!isNaN(finalTotalCounter)) {
        // send total
        event.sender.send("total", finalTotalCounter);
      }
    }

    // get url list
    const urls: string[] = [...Array(Math.ceil(finalTotalCounter)).keys()].map(
      (i) => `${arg}/${++i}`
    );

    // collect loop
    for (let url of urls) {
      try {
        // goto top
        await puppScraper.doGo(url);
        logger.debug(`app: scraping ${url}`);
        // result
        const result: string[] = await doScrapeUrl(tabeLogUrlSelector);
        // push into array
        finalCsvArray.push(result);
        logger.debug(`app: scraping ${url} success`);
        // success
        successCounter++;
      } catch (err) {
        // error
        if (err instanceof Error) {
          // error
          logger.error(err.message);
          // fail
          failCounter = failCounter++;
        }
      } finally {
        // status update
        event.sender.send("statusUpdate", url);
        // success
        event.sender.send("success", successCounter);
        // fail
        event.sender.send("fail", failCounter);
      }
    }

    // nowtime
    const nowtime: string = `${dir_desktop}\\${new Date()
      .toISOString()
      .replace(/[^\d]/g, "")
      .slice(0, 14)}_url.csv`;
    // write to file
    await csvMaker.makeCsvData(finalResultArray, globalColumns, nowtime);
    logger.info("CSV writing finished");

    logger.debug("CSV writing finished");

    // show finish message
    dialogMaker.showmessage("info", "scraping url finished");

    // close puppeteer
    await puppScraper.doClose();
  } catch (e: unknown) {
    // error
    if (e instanceof Error) {
      // error
      logger.error(e.message);
    }
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
    // show question dialog
    const selected: number = dialogMaker.showQuetion(
      "Q",
      "stop",
      "app will stop ok？scraped data is written to csv file."
    );

    // yes
    if (selected == 0) {
      // show pause message
      dialogMaker.showmessage("info", "stopped.");

      // nowtime
      const nowtime: string = `${dir_desktop}\\${new Date()
        .toISOString()
        .replace(/[^\d]/g, "")
        .slice(0, 14)}`;

      if (arg == "url") {
        // CSV data
        targetCsvArray = finalCsvArray;
        // file name
        targetpath = `${nowtime}_url.csv`;
      } else if (arg == "shop") {
        // CSV data
        targetCsvArray = finalResultArray;
        // file name
        targetpath = `${nowtime}.csv`;
      }
      // make CSV
      await csvMaker.makeCsvData(targetCsvArray, globalColumns, targetpath);
    } else {
      // throw error
      throw new Error("selected no");
    }
  } catch (e: unknown) {
    // error
    if (e instanceof Error) {
      // error
      logger.error(e.message);
    }
    return false;
  }
});

// exit
ipcMain.on("exit", async () => {
  try {
    logger.info("ipc: exit mode");
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

// do scraping
const doScrape = async (selector: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // wait for 5 sec
      await puppScraper.doWaitFor(5 * 1000);

      // url exists
      if (await puppScraper.doCheckSelector(selector)) {
        // wait for datalist
        await puppScraper.doWaitSelector(selector, 10000);
        // url
        const tmpValues: any = await puppScraper.doSingleEval(
          selector,
          "innerHTML"
        );
        logger.debug(tmpValues.trim());
        // result
        resolve(tmpValues.trim());
      } else {
        // ignore error
        resolve("");
      }
    } catch (e: unknown) {
      // error
      if (e instanceof Error) {
        // error
        logger.error(e.message);
      }
      // ignore error
      resolve("");
    }
  });
};

// do scraping
const doScrapeUrl = async (selector: string): Promise<any> => {
  return new Promise(async (resolve, _) => {
    try {
      // wait for 2 sec
      await puppScraper.doWaitFor(2 * 1000);

      // url exists
      if (await puppScraper.doCheckSelector(selector)) {
        // wait for datalist
        await puppScraper.doWaitSelector(selector, 10000);
        // url
        const tmpUrls: any = await puppScraper.doMultiEval(selector, "href");
        // result
        resolve(tmpUrls);
      }
    } catch (e: unknown) {
      // error
      if (e instanceof Error) {
        // error
        logger.error(e.message);
      }
      // ignore result
      resolve("");
    }
  });
};

// exit
const exitApp = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      logger.info("ipc: exit mode");
      // show question dialog
      const selected: number = dialogMaker.showQuetion(
        "Q",
        "exit",
        "app will exist ok？ scraped data will be trashed."
      );

      // yes
      if (selected == 0) {
        // quit app
        app.quit();
        resolve();
      } else {
        reject();
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
};
