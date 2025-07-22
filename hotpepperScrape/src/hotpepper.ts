/*
 * hotpepper.ts
 *
 * function：scraping hotpepper app
 **/

'use strict';

// 定数
// namespace
import { myConst, myPrefNos, myProperties, myWindows, mySelector, myArrays } from "./consts/globalvariables";

// import modules
import { BrowserWindow, app, ipcMain, Tray, Menu, nativeImage } from "electron"; // electron
import * as path from "node:path"; // path
import { Scrape } from "./class/ElScrapeCore0719"; // scraper
import Dialog from "./class/ElDialog0721"; // dilog
import Logger from "./class/ElLogger"; // logger
import CSV from "./class/ElCsv0414"; // csv

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
    mainWindow.loadFile(path.join(__dirname, "../www/index.html"));
    // ready
    mainWindow.once("ready-to-show", () => {
      if (!app.isPackaged) {
        // dev mode
        // mainWindow.webContents.openDevTools();
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
    path.join(__dirname, "../assets/pepper.ico")
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
ipcMain.on("page", async (_: any, arg: any) => {
  try {
    logger.info("ipc: page mode");
    // target url
    let url: string = '';

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
        url = "../www/index.html";
        break;

      // url page
      case "url_page":
        // set url
        url = "../www/url.html";
        break;

      // shop page
      case "shop_page":
        // set url
        url = "../www/shop.html";
        break;

      default:
        // clear url
        url = "";
    }
    // transfer
    await mainWindow.loadFile(path.join(__dirname, url));

  } catch (e: unknown) {
    // show error message
    logger.error(e);
    // error
    if (e instanceof Error) {
      // show error
      dialogMaker.showmessage("error", `${e.message}`);
    }
  }
});

// CSV
ipcMain.on("csv", async (event: any, _: any) => {
  try {
    logger.info("ipc: csv mode");
    // csv path
    const csvPath: any = await csvMaker.showCSVDialog(mainWindow);
    // get CSV data
    const result: any = await csvMaker.getCsvData(csvPath);
    // return csv data
    event.sender.send("shopinfoCsvlist", result);

  } catch (e: unknown) {
    // show error message
    logger.error(e);
    // error
    if (e instanceof Error) {
      // show error
      dialogMaker.showmessage("error", `${e.message}`);
    }
  }
});

// error
ipcMain.on("error", async (_: any, arg: any) => {
  try {
    logger.info("ipc: error mode");
    // show error
    dialogMaker.showmessage("error", arg);

  } catch (e: unknown) {
    // show error message
    logger.error(e);
    // error
    if (e instanceof Error) {
      // show error
      dialogMaker.showmessage("error", `${e.message}`);
    }
  } finally {
    // close window
    await puppScraper.doClose();
  }
});

// scrape
ipcMain.on("scrape", async (event: any, arg: any) => {
  try {
    logger.info("ipc: scrape mode");
    // shop success counter
    let shopSuccessCounter: number = 0;
    // shop fail counter
    let shopFailCounter: number = 0;
    // total counter
    let totalCounter: number = arg.record.length;
    // error array
    let errorResultArray: any[] = [];
    // initialize CSV array
    let finalResultArray: any[] = [];
    // initialize scraper
    await puppScraper.init();
    // update total
    event.sender.send("total", totalCounter);

    // scrape pages
    for (let url of arg.record) {
      try {
        // shop data
        let myShopObj: any = {
          telephone: "", // telephone
          shopname1: "", // shopname1
          area: "", // area
          shopname2: "", // shopname2
          genre: "", // genre
          address: "", // address1
          businesstime: "", // businesstime
        };
        // goto top
        await puppScraper.doGo(url[0]);
        // wait for 2 sec
        await puppScraper.doWaitFor(2 * myProperties.WAIT_SECOND);
        logger.debug(`app: scraping ${url[0]}`);
        // update target url
        event.sender.send("urlUpdate", url[0]);
        // phone number
        // click login button
        await puppScraper.doClick(mySelector.phoneLinkSelector);
        // wait for 3 sec
        await puppScraper.doWaitFor(3 * myProperties.WAIT_SECOND);
        // phonenumber
        const phonenumber: string = await doScrape(mySelector.phoneSelector);
        const checkedPhonenumber: string = checkEvaluation(phonenumber);
        myShopObj['telephone'] = checkedPhonenumber;
        // goback to previous page
        await puppScraper.doGoBack();
        // wait for 2 sec
        await puppScraper.doWaitFor(2 * myProperties.WAIT_SECOND);
        // shopname
        const shopname1: string = await doScrape(mySelector.pepperMainShopnameSelector);
        const checkedShopName: string = checkEvaluation(shopname1);
        myShopObj['shopname1'] = checkedShopName;
        // area
        const area: string = await doScrape(mySelector.pepperAreaSelector);
        const checkedArea: string = checkEvaluation(area);
        myShopObj['area'] = checkedArea;
        // shopname2
        const shopname2: string = await doScrape(mySelector.pepperSubShopnameSelector);
        const checkedShopName2: string = checkEvaluation(shopname2);
        myShopObj['shopname2'] = checkedShopName2;
        // genre
        const genre: string = await doScrape(mySelector.pepperGenreSelector);
        const checkedGenre: string = checkEvaluation(genre);
        myShopObj['genre'] = checkedGenre;
        // address1
        const address: string = await doScrape(mySelector.pepperAddressSelector);
        const checkedAddress: string = checkEvaluation(address);
        myShopObj['address'] = checkedAddress;
        // businesstime
        const businesstime: string = await doScrape(mySelector.pepperBusinesstimeSelector);
        const checkedBusinesstime: string = checkEvaluation(businesstime);
        myShopObj['businesstime'] = checkedBusinesstime;
        // shop counter
        shopSuccessCounter++;
        // push into array
        finalResultArray.push(myShopObj);
        // update target url
        event.sender.send("statusUpdate", myShopObj);

      } catch (err: unknown) {
        // shop counter
        shopFailCounter++;
        // push into error url array
        errorResultArray.push({ url: url[0] });
        // error
        logger.error(err);
      } finally {
        // send success counter
        event.sender.send("success", shopSuccessCounter);
        // send fail counter
        event.sender.send("fail", shopFailCounter);
      }
    }
    // CSV file name
    const nowtime: string = `${dir_desktop}\\${myConst.APP_NAME}_${new Date().toISOString().replace(/[^\d]/g, "").slice(0, 14)}.csv`;
    // make csv
    csvMaker.makeCsvData(finalResultArray, myArrays.columns, nowtime);
    logger.debug("CSV writing finished");
    // show finished message
    dialogMaker.showmessage("info", "scraping finished");

  } catch (e: unknown) {
    // error
    logger.error(e);
    // error
    if (e instanceof Error) {
      // show error
      dialogMaker.showmessage("error", `${e.message}`);
    }
  } finally {
  }
});

// scrape url
ipcMain.on("scrapeurl", async (event: any, arg: any) => {
  try {
    logger.info("ipc: scrape mode");
    // url success counter
    let urlSuccessCounter: number = 0;
    // url fail counter
    let urlFailCounter: number = 0;
    // csv array
    let finalCsvArray = [];
    // pref
    const pref: any = arg.pref ?? 0;
    logger.debug("scrapeurl: db insert finished");
    // error
    if (pref == 0) {
      throw new Error('scrapeurl: scrape area: no key data');
    }
    // converted prefecture no
    const prefNo: string = myPrefNos.prefs[pref];
    logger.silly("scrapeurl: db insert finished");
    // initialize scraper
    await puppScraper.init();
    // goto top
    await puppScraper.doGo(`${myConst.pepper_BASE}/${prefNo}/lst/`);
    logger.debug(`scrapeurl: scraping area: ${myConst.pepper_BASE}/${prefNo}/`);
    // wait for datalist
    await puppScraper.doWaitFor(myProperties.WAIT_SECOND);
    // url exists
    if (!await puppScraper.doCheckSelector(mySelector.pepperTotalNumSelector)) {
      throw new Error('scrapeurl: scrape area: no key data');
    }
    // total tag
    const tmpPreftotal: any = await puppScraper.doMultiEval(
      mySelector.pepperTotalNumSelector,
      "innerHTML"
    );
    // tag removal
    const tmpPrefTotalNum: string = tmpPreftotal[0].replace(/<[^>]*>/g, '');
    // totalCounter
    const totalPrefCounter: number = Number(tmpPrefTotalNum);
    // page counter
    const totalPageCounter: number = Math.ceil(totalPrefCounter / 20);
    // shop total
    event.sender.send("shoptotal", tmpPreftotal);
    logger.debug(`scrapeurl: shop total is ${totalPageCounter} urls`);
    // numbers for loop
    const pageNumberArray: number[] = makeNumberRange(1, totalPageCounter);

    // area loop
    for (let pageNum of pageNumberArray) {
      try {
        // zero
        const numString: string = String(pageNum);
        // area url
        const areaUrl: string = `${myConst.pepper_BASE}/${prefNo}/lst/bgn${numString}`;
        // update target url
        event.sender.send("statusUpdate", areaUrl);
        // goto top
        await puppScraper.doGo(areaUrl);
        logger.silly(`scrapeurl: ${areaUrl}`);
        // wait for datalist
        await puppScraper.doWaitFor(myProperties.WAIT_SECOND);
        // numbers for loop
        const pageNumberArray: number[] = makeNumberRange(6, 27);
        // area loop
        for (let domNum of pageNumberArray) {
          // selector
          const fixedSelector: string = `#basicSearchForm > div.contentWrapper.cf > div.mainContent > div:nth-child(${domNum}) > div > div > div.shopDetailInnerTop > div > div > div > div.shopDetailText > h3 > a`;
          // url exists
          if (!await puppScraper.doCheckSelector(fixedSelector)) {
            logger.silly('scrapeurl: scrape area: no key data');
          } else {
            // url
            const tmpUrls: any = await puppScraper.doMultiEval(fixedSelector, "href");
            // make url obj
            const tmpUrlObj: any = tmpUrls.map((url: any) => {
              return {
                url: url
              }
            });
            logger.silly(tmpUrlObj);
            // success counter
            urlSuccessCounter++;
            // make url obj
            finalCsvArray.push(tmpUrlObj);
          }
        }

      } catch (e: unknown) {
        // error
        logger.error(e);
        // fail counter
        urlFailCounter++;

      } finally {
        // send success counter
        event.sender.send("success", urlSuccessCounter);
        // send fail counter
        event.sender.send("fail", urlFailCounter);
      }
    }
    // nowtime
    const nowtime: string = `${dir_desktop}\\${new Date()
      .toISOString()
      .replace(/[^\d]/g, "")
      .slice(0, 14)}`;
    // file name
    const targetpath: string = `${nowtime}_${pref}_url.csv`;
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

// do scraping
const doScrape = async (selector: string): Promise<string> => {
  return new Promise(async (resolve, _) => {
    try {
      // url exists
      if (await puppScraper.doCheckSelector(selector)) {
        // url
        const tmpValues: any = await puppScraper.doSingleEval(
          selector,
          "innerHTML"
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
        resolve("");
      }
    } catch (e: unknown) {
      // error
      logger.error(e);
      // error
      if (e instanceof Error) {
        // show error
        dialogMaker.showmessage("error", `${e.message}`);
      }
      // ignore error
      resolve("");
    }
  });
};

// number array
const makeNumberRange: any = (start: number, end: number) => [...new Array(end - start).keys()].map(n => n + start);

// empty evaluation
const checkEvaluation = (value: string): any => {
  // tag regexp
  const regex: RegExp = new RegExp("(<([^>]+)>)", "gi");
  // isEmpty
  const isEmpty: boolean = Object.keys(value).length === 0 && value.constructor === Object;
  // empty
  if (!isEmpty) {
    // tag exists
    if (regex.test(value)) {
      // tag removal
      return value.replace(/(<([^>]+)>)/gi, "");
    } else {
      // tag 
      return value;
    }
  }
}
