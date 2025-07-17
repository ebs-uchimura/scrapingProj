/*
 * tabelog.ts
 *
 * function：scraping electron app
 **/

// namespace
import { myConst, myProperties, myWindows, mySelector, myArrays } from "./consts/globalvariables";

// import modules
import { BrowserWindow, app, ipcMain, Tray, Menu, nativeImage } from "electron"; // electron
import * as path from "node:path"; // path
import { Scrape } from "./class/ElScrapeCore0715"; // scraper
import Dialog from "./class/ElDialog0414"; // dilog
import Logger from "./class/ElLogger"; // logger
import CSV from "./class/ElCsv0414"; // csv
import MKDir from './class/ElMkdir0414'; // mkdir

// loggeer instance
const logger: Logger = new Logger(myConst.COMPANY_NAME, myConst.APP_NAME, myConst.LOG_LEVEL);
// csv
const csvMaker: CSV = new CSV(myConst.CSV_ENCODING, logger);
// dialog
const dialogMaker: Dialog = new Dialog(logger);
// scraper
const puppScraper: Scrape = new Scrape(logger);
// mkdir
const mkdirManager = new MKDir(logger);

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
// final Csv Array
let finalCsvArray: any = [];
// final Result Array
let finalResultArray: any = [];
// pref counter
let prefUrlSuccessCounter: number = 0;
// area counter
let areaUrlSuccessCounter: number = 0;
// city counter
let cityUrlSuccessCounter: number = 0;

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
    mainWindow.loadFile(path.join(__dirname, "../index.html"));
    // ready
    mainWindow.once("ready-to-show", () => {
      if (!app.isPackaged) {
        // dev mode
        mainWindow.webContents.openDevTools();
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
  // make dir
  await mkdirManager.mkDir('csv');
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
ipcMain.on("csv", async (event, _) => {
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
ipcMain.on("error", async (_, arg) => {
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
    // result
    let tmpResult: string = '';
    // total counter
    let totalCounter: number = arg.record.length;
    // error array
    let errorResultArray: any[] = [];
    // initialize CSV array
    finalResultArray = [];
    // initialize scraper
    await puppScraper.init();
    // update total
    event.sender.send("total", totalCounter);

    // scrape pages
    for (let url of arg.record) {
      try {
        // shop data
        let myShopObj: any = {
          shopname: "", // shopname
          station: "", // status
          shopname2: "", // shopname2
          genre: "", // genre
          telephone: "", // telephone
          reservable: "", // reservable
          address1: "", // address1
          address2: "", // address2
          address3: "", // address3
          businesstime: "", // businesstime
          seat: "", // seat
          homepage: "", // homepage
          shopphone: "", // shopphone
          shopphone2: "", // shopphone2
        };
        // goto top
        await puppScraper.doGo(url[0]);
        // wait for 2 sec
        await puppScraper.doWaitFor(2 * myProperties.WAIT_SECOND);
        logger.debug(`app: scraping ${url[0]}`);
        // update target url
        event.sender.send("statusUpdate", url[0]);
        // result
        tmpResult = '';
        // shopname
        const shopname: string = await doScrape(mySelector.tabeLogMainShopnameSelector);
        const checkedShopName: string = checkEvaluation(shopname);
        myShopObj['shopname'] = checkedShopName;
        // station
        const station: string = await doScrape(mySelector.tabeLogStationSelector);
        const checkedStation: string = checkEvaluation(station);
        myShopObj['station'] = checkedStation;
        // shopname2
        const shopname2: string = await doScrape(mySelector.tabeLogMainSubshopname);
        const checkedShopName2: string = checkEvaluation(shopname2);
        myShopObj['shopname2'] = checkedShopName2;
        // genre
        const genre: string = await doScrape(mySelector.tabelLogGenreSelector);
        const checkedGenre: string = checkEvaluation(genre);
        myShopObj['genre'] = checkedGenre;
        // telephone
        const telephone: string = await doScrape(mySelector.tabeLogReservephoneSelector);
        const checkedTelephone: string = checkEvaluation(telephone);
        myShopObj['telephone'] = checkedTelephone;
        // address1
        const address1: string = await doScrape(mySelector.tabeLogAddress1Selector);
        const checkedAddress1: string = checkEvaluation(address1);
        myShopObj['address1'] = checkedAddress1;
        // address2
        const address2: string = await doScrape(mySelector.tabeLogAddress2Selector);
        const checkedAddress2: string = checkEvaluation(address2);
        myShopObj['address2'] = checkedAddress2;
        // address3
        const address3: string = await doScrape(mySelector.tabeLogAddress3Selector);
        const checkedAddress3: string = checkEvaluation(address3);
        myShopObj['address3'] = checkedAddress3;
        // businesstime
        const businesstime: string = await doScrape(mySelector.tabeLogBusinesstimeSelector);
        const checkedBusinesstime: string = checkEvaluation(businesstime);
        myShopObj['businesstime'] = checkedBusinesstime;
        // seat
        const seat: string = await doScrape(mySelector.tabeLogSheetSelector);
        const checkedSeat: string = checkEvaluation(seat);
        myShopObj['seat'] = checkedSeat;
        // homepage
        const homepage: string = await doScrape(mySelector.tabeLogHomepageSelector);
        const checkedHomepage: string = checkEvaluation(homepage);
        myShopObj['homepage'] = checkedHomepage;
        // shopphone
        const shopphone: string = await doScrape(mySelector.tabeLogTelephoneSelector);
        const checkedShopphone: string = checkEvaluation(shopphone);
        myShopObj['shopphone'] = checkedShopphone;
        // shopphone2
        const shopphone2: string = await doScrape(mySelector.tabeLogTelephone2Selector);
        const checkedShopphone2: string = checkEvaluation(shopphone2);
        myShopObj['shopphone2'] = checkedShopphone2;
        // shop counter
        shopSuccessCounter++;

        // push into array
        finalResultArray.push(myShopObj);

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
    const nowtime: string = `${dir_desktop}\\${new Date()
      .toISOString()
      .replace(/[^\d]/g, "")
      .slice(0, 14)}.csv`;
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
    // initialize counter
    areaUrlSuccessCounter = 0;
    cityUrlSuccessCounter = 0;
    // pref index
    const prefindex: number = Number(arg.index);
    // pref
    const pref: string = String(arg.pref);
    // start area index
    const startAreaindex: number = Number(arg.area) + 1;
    // start city index
    const startCityindex: number = Number(arg.city) + 1;
    logger.debug("scrapeurl: db insert finished");
    // pref padded
    const prefPadded: string = String(prefindex).padStart(2, '0');
    logger.debug(`scrapeurl: ${myConst.TABELOG_BASE}${pref}/`);
    // initialize scraper
    await puppScraper.init();
    // goto top
    await puppScraper.doGo(`${myConst.TABELOG_BASE}${pref}/`);
    logger.debug(`scrapeurl: scraping area: ${myConst.TABELOG_BASE}${pref}/`);
    // url exists
    if (!await puppScraper.doCheckSelector(mySelector.tabeLogTotalSelector)) {
      throw new Error('scrapeurl: scrape area: no key data');
    }
    logger.debug("scrapeurl: url exists");
    // wait for datalist
    await puppScraper.doWaitFor(myProperties.WAIT_SECOND);
    // total tag
    const tmpPreftotal: any = await puppScraper.doMultiEval(
      mySelector.tabeLogTotalSelector,
      "innerHTML"
    );
    // tag removal
    const tmpPrefTotalNum: string = tmpPreftotal[0].replace(/<[^>]*>/g, '');
    // totalCounter
    const totalPrefCounter: number = Number(tmpPrefTotalNum);
    // pref total
    event.sender.send("preftotal", totalPrefCounter);
    // update total
    event.sender.send("scrapeurl", totalPrefCounter);
    logger.debug(`scrapeurl: prefecture total is ${totalPrefCounter} urls`);

    // over limit
    if (totalPrefCounter <= myProperties.PAGE_LIMIT) {
      throw new Error('scrapeurl: over total');
    }
    console.log(startAreaindex);
    // numbers for loop
    const areaNumberArray: number[] = makeNumberRange(startAreaindex, 31);

    // area loop
    for (let areaNum of areaNumberArray) {
      try {
        areaUrlSuccessCounter = 0;
        // zero
        const zeroPadded: string = String(areaNum).padStart(2, '0');
        // area url
        const areaUrl: string = `${myConst.TABELOG_BASE}${pref}/A${prefPadded}${zeroPadded}/`;
        // update target url
        event.sender.send("statusUpdate", areaUrl);
        // goto top
        await puppScraper.doGo(areaUrl);
        logger.debug(`scrapeurl: ${areaUrl}`);
        // wait for datalist
        await puppScraper.doWaitFor(myProperties.WAIT_SECOND);
        // url exists
        if (!await puppScraper.doCheckSelector(mySelector.tabeLogTotalSelector)) {
          logger.debug('scrapeurl: area continue');
          continue;
        }
        // total
        const tmpAreaTotal: any = await puppScraper.doMultiEval(
          mySelector.tabeLogTotalSelector,
          "innerHTML"
        );
        // total number
        const tmpAreaTotalNum: string = tmpAreaTotal[0].replace(/<[^>]*>/g, '');
        // totalCounter
        const totalAreaCounter: number = Number(tmpAreaTotalNum);
        // area total
        event.sender.send("areatotal", totalAreaCounter);
        logger.debug(`scrapeurl: area total is ${totalAreaCounter}`);

        // over limit
        if (totalAreaCounter <= myProperties.PAGE_LIMIT) {
          logger.debug(`scrapeurl: total is ${totalAreaCounter}`);
          // page counter
          const areaPageCounter: number = Math.ceil(totalAreaCounter / 20);
          // final url
          const finalAreaUrl: any = await doScrapeUrl(areaUrl + 'rstLst', mySelector.tabeLogUrlSelector, 'area', areaPageCounter, event);
          logger.debug('scrapeurl: ');
          // push into array
          finalCsvArray.push(finalAreaUrl);
          continue;
        }
        logger.debug('scrapeurl: area total exceed 1200');
        // numbers for loop
        const cityNumberArray: number[] = makeNumberRange(startCityindex, 60);

        // city loop
        for (let cityNum of cityNumberArray) {
          try {
            cityUrlSuccessCounter = 0;
            // city number
            const cityPadded: string = String(cityNum).padStart(2, '0');
            // city url
            const cityUrl: string = `${myConst.TABELOG_BASE}${pref}/A${prefPadded}${zeroPadded}/A${prefPadded}${zeroPadded}${cityPadded}/`;
            // update target url
            event.sender.send("statusUpdate", cityUrl);
            // goto top
            await puppScraper.doGo(cityUrl);
            logger.debug(`scrapeurl: ${cityUrl}`);
            // wait for datalist
            await puppScraper.doWaitFor(myProperties.WAIT_SECOND);
            // url exists
            if (!await puppScraper.doCheckSelector(mySelector.tabeLogTotalSelector)) {
              logger.debug('scrapeurl: no city selector');
              break;
            }
            // total
            const tmpCityTotal: any = await puppScraper.doMultiEval(
              mySelector.tabeLogTotalSelector,
              "innerHTML"
            );
            // total number
            const tmpCityTotalNum: string = tmpCityTotal[0].replace(/<[^>]*>/g, '');
            // totalCounter
            const totalCityCounter: number = Number(tmpCityTotalNum);
            logger.debug(`scrapeurl: city total is ${totalCityCounter}`);
            // city total
            event.sender.send("citytotal", totalCityCounter);
            // page counter
            const cityPageCounter: number = Math.ceil(totalCityCounter / 20);

            // over 1200
            if (totalCityCounter <= myProperties.PAGE_LIMIT) {
              logger.debug(`scrapeurl: total is ${totalCityCounter}`);
              // final url
              const finalCityUrl: any = await doScrapeUrl(cityUrl + 'rstLst', mySelector.tabeLogUrlSelector, 'city', cityPageCounter, event);
              logger.debug('scrapeurl result: ');
              // push into array
              finalCsvArray.push(finalCityUrl);
              continue;
            }
            logger.debug('scrapeurl: city total exceed 1200');

            // category loop
            for (let i = 0; i < myArrays.categories.length; i++) {
              try {
                // city url
                const categoryUrl: string = `${myConst.TABELOG_BASE}${pref}/A${prefPadded}${zeroPadded}/A${prefPadded}${zeroPadded}${cityPadded}/rstLst/${myArrays.categories[i]}`;
                // update target url
                event.sender.send("statusUpdate", categoryUrl);
                // goto top
                await puppScraper.doGo(categoryUrl);
                logger.debug(`scrapeurl: category: ${categoryUrl}`);
                // wait for datalist
                await puppScraper.doWaitFor(myProperties.WAIT_SECOND);
                // url exists
                if (!await puppScraper.doCheckSelector(mySelector.tabeLogGenreTotalSelector)) {
                  logger.debug('scrapeurl: no category selector');
                  continue;
                }
                logger.debug(`scrapeurl: category get total started`);
                // total
                const tmpCategoryTotal: any = await puppScraper.doMultiEval(
                  mySelector.tabeLogGenreTotalSelector,
                  "innerHTML",
                );
                // total number
                const tmpCategoriesTotalNum: string = tmpCategoryTotal[0].replace(/<[^>]*>/g, '');
                // totalCounter
                const totalCategoriesCounter: number = Number(tmpCategoriesTotalNum);
                // page counter
                const categoryPageCounter: number = Math.ceil(totalCategoriesCounter / 20);
                // final category url
                const finalCategoryUrl: any = await doScrapeUrl(categoryUrl, mySelector.tabeLogCategoryUrlSelector, 'category', categoryPageCounter, event);
                // set to csv array
                finalCsvArray.push(finalCategoryUrl);

              } catch (e: unknown) {
                // error
                logger.error(e);
                continue;
              }
            }
          } catch (e: unknown) {
            // error
            logger.error(e);
          }
        }
      } catch (e: unknown) {
        // error
        logger.error(e);
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

// do scraping
const doScrapeUrl = async (url: string, selector: string, mode: string, limit: number, event: any): Promise<any> => {
  return new Promise(async (resolve, _) => {
    try {
      // result
      let finalArray: any[] = [];
      // get url list
      const urls: string[] = [...Array(Math.ceil(limit)).keys()].map(i => `${url}/${++i}`);
      // 収集ループ
      for (const [index, url] of Object.entries(urls)) {
        try {
          logger.debug(`${mode}: ${index}`);
          // goto page
          await puppScraper.doGo(url);
          // wait for 2 sec
          await puppScraper.doWaitFor(2 * myProperties.WAIT_SECOND);
          // url exists
          if (await puppScraper.doCheckSelector(selector)) {
            // wait for datalist
            await puppScraper.doWaitFor(2 * myProperties.WAIT_SECOND);
            // url
            const tmpUrls: any = await puppScraper.doMultiEval(selector, "href");
            // make url obj
            const tmpUrlObj: any = tmpUrls.map((url: any) => {
              return {
                url: url
              }
            });
            // result
            finalArray.push(tmpUrlObj);

          } else {
            logger.debug('scrapeurl: no selector');
            // result
            continue;
          }

        } catch (e: unknown) {
          // error
          logger.error(e);
          logger.debug('scrapeurl: no selector');
          // result
          resolve(finalArray);

        } finally {
          // count up
          prefUrlSuccessCounter++;
          // switch on mode
          switch (mode) {
            case "area":
              // countup
              areaUrlSuccessCounter++;
              // update success
              event.sender.send('areasuccess', areaUrlSuccessCounter);
              break;
            case "city":
              // countup
              cityUrlSuccessCounter++;
              // update success
              event.sender.send('citysuccess', cityUrlSuccessCounter);
              break;
            default:
              logger.debug('out of range');
          }
        }
      }
      logger.debug('scrapeurl: scrape url end');
      // result
      resolve(finalArray);

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
