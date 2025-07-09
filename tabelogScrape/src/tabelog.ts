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
import { DatabaseSync } from 'node:sqlite'; // sqlite
import { Scrape } from "./class/ElScrape0616"; // scraper
import Dialog from "./class/ElDialog0414"; // dilog
import Logger from "./class/ElLogger"; // logger
import CSV from "./class/ElCsv0414"; // csv
import MKDir from './class/ElMkdir0414'; // mkdir
import NodeCache from "node-cache"; // node-cache

// loggeer instance
const logger: Logger = new Logger(myConst.APP_NAME, myConst.LOG_LEVEL);
// csv
const csvMaker: CSV = new CSV(myConst.CSV_ENCODING, logger);
// dialog
const dialogMaker: Dialog = new Dialog(logger);
// scraper
const puppScraper: Scrape = new Scrape(logger);
// mkdir
const mkdirManager = new MKDir(logger);
// cache
const cacheMaker: NodeCache = new NodeCache();
// db path
const dbPath: string = path.join(__dirname, '..', 'database.db');
// sqlite
const database: any = new DatabaseSync(dbPath);

// all selectors
const tabeLogSelectors: any = {
  shopname: mySelector.tabeLogMainShopnameSelector,
  shopnameruby: mySelector.tabeLogMainShopnameRubySelector,
  station: mySelector.tabeLogStationSelector,
  shopname2: mySelector.tabeLogMainSubshopname,
  genre: mySelector.tabelLogGenreSelector,
  telephone: mySelector.tabeLogReservephoneSelector,
  reservable: mySelector.tabeLogReservableSelector,
  address1: mySelector.tabeLogAddress1Selector,
  address2: mySelector.tabeLogAddress2Selector,
  monday: mySelector.tabeLogBusinesstimeMonSelector,
  tuesday: mySelector.tabeLogBusinesstimeTueSelector,
  wednesday: mySelector.tabeLogBusinesstimeWedSelector,
  thursday: mySelector.tabeLogBusinesstimeThuSelector,
  friday: mySelector.tabeLogBusinesstimeFriSelector,
  saturday: mySelector.tabeLogBusinesstimeSatSelector,
  sunday: mySelector.tabeLogBusinesstimeSunSelector,
  holiday: mySelector.tabeLogBusinesstimeHolSelector,
  creditcard: mySelector.tabeLogPaymentCardSelector,
  electronicmoney: mySelector.tabeLogPaymentElSelector,
  codepayment: mySelector.tabeLogPaymentCodeSelector,
  seat: mySelector.tabeLogSheetSelector,
  capacity: mySelector.tabeLogReserveLimitSelector,
  privateroom: mySelector.tabeLogPrivateRoomSelector,
  vip: mySelector.tabeLogRentalSelector,
  smoking: mySelector.tabeLogSmokingSelector,
  parking: mySelector.tabeLogParkingSelector,
  alldrink: mySelector.tabeLogAlldrinkSelector,
  homepage: mySelector.tabeLogHomepageSelector,
  shopphone: mySelector.tabeLogTelephoneSelector,
  shopphone2: mySelector.tabeLogTelephone2Selector,
};

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
// area counter
let areaSuccessCounter: number = 0;
// city counter
let citySuccessCounter: number = 0;

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
      // dev mode
      mainWindow.webContents.openDevTools();
    });

    // minimize
    mainWindow.on("will-resize", (event: any): void => {
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
    // get CSV data
    const result: any = await csvMaker.showCSVDialog(mainWindow);
    // return csv data
    event.sender.send("shopinfoCsvlist", result.flat());

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
    puppScraper.doClose();
  }
});

// scrape
ipcMain.on("scrape", async (event: any, arg: any) => {
  try {
    logger.info("ipc: scrape mode");
    // result
    let tmpResult: string = '';
    // total counter
    let totalCounter: number = arg.record.length;
    // error array
    let errorResultArray: any[] = [];
    // initialize counter
    areaSuccessCounter = 0;
    citySuccessCounter = 0;
    // db 
    const initDatabase: string = `
    CREATE TABLE IF NOT EXISTS status (
      id INTEGER PRIMARY KEY,
      area INTEGER,
      city INTEGER,
      cateogry INTEGER
    );`
    // create db 
    database.exec(initDatabase);
    // insert into status
    const insertStatus: any = database.prepare(`
      INSERT INTO status (id, area, city, category)
      VALUES (?, ?, ?, ?)
    `);
    // insert run
    insertStatus.run(1, 0, 0, 0);
    // tag regexp
    const regex: RegExp = new RegExp("(<([^>]+)>)", "gi");
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
        await puppScraper.doWaitFor(2 * myProperties.WAIT_SECOND);
        logger.debug(`app: scraping ${url}`);
        // update target url
        event.sender.send("statusUpdate", url);

        // URLloop
        Object.keys(tabeLogSelectors).forEach(async (key: any) => {
          // result
          tmpResult = '';
          // scrape
          const result: string = await doScrape(tabeLogSelectors[key]);
          // empty evaluation
          const isEmpty: boolean = Object.keys(result).length === 0 && result.constructor === Object;

          // empty
          if (!isEmpty) {
            // tag exists
            if (regex.test(result)) {
              // tag removal
              tmpResult = result.replace(/(<([^>]+)>)/gi, "");
            } else {
              // tag 
              tmpResult = result;
            }
            // set result
            myShopObj[`${key}`] = tmpResult;
          }
        });
        // push into array
        finalResultArray.push(myShopObj);

      } catch (err: unknown) {
        // push into error url array
        errorResultArray.push({ url: url });
        // error
        logger.error(err);
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

    // error exists
    if (errorResultArray.length > 0) {
      // error csv file name
      const errornowtime: string = `${dir_desktop}\\error_${new Date()
        .toISOString()
        .replace(/[^\d]/g, "")
        .slice(0, 14)}.csv`;
      // make csv
      csvMaker.makeCsvData(errorResultArray, myArrays.columns, errornowtime);
      logger.debug("error CSV writing finished");
    }

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
    // close puppeteer
    await puppScraper.doClose();
  }
});

// scrape url
ipcMain.on("scrapeurl", async (event: any, arg: any) => {
  try {
    logger.info("ipc: scrape mode");
    // initialize counter
    areaSuccessCounter = 0;
    citySuccessCounter = 0;
    // pref index
    const prefindex: number = Number(arg.index);
    // pref
    const pref: string = String(arg.pref);
    // init db
    const initDatabase: string = `
    CREATE TABLE IF NOT EXISTS urlstatus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prefecture INTEGER,
      area INTEGER,
      city INTEGER,
      category INTEGER
    );`
    // create db 
    database.exec(initDatabase);
    // select status
    const selectUrlStatus: any = database.prepare('SELECT * FROM urlstatus WHERE prefecture = ?');
    // get all
    const selectUrlResult: any = selectUrlStatus.get(prefindex);
    logger.debug(selectUrlResult);

    // not undefined
    if (selectUrlResult) {
      // area
      cacheMaker.set('area', selectUrlResult.area);
      // city
      cacheMaker.set('city', selectUrlResult.city);
      // category
      cacheMaker.set('category', selectUrlResult.category);
      logger.debug("scrapeurl: cache updated");
    } else {
      // insert to urlstatus
      const insertUrlStatus: any = database.prepare(`INSERT INTO urlstatus (prefecture, area, city, category) VALUES (?, ?, ?, ?)`);
      // run insert
      insertUrlStatus.run(prefindex, 0, 0, 0);
      // area
      cacheMaker.set('area', 0);
      // city
      cacheMaker.set('city', 0);
      // category
      cacheMaker.set('category', 0);
      logger.debug("scrapeurl: db insert finished");
    }
    // pref padded
    const prefPadded: string = String(prefindex).padStart(2, '0');
    logger.debug(`scrapeurl: ${myConst.TABELOG_BASE}${pref}/`);
    // initialize scraper
    await puppScraper.init();
    // goto top
    await puppScraper.doGo(`${myConst.TABELOG_BASE}${pref}/`);
    logger.debug(`scraping area: ${myConst.TABELOG_BASE}${pref}/`);

    // url exists
    if (await puppScraper.doCheckSelector(mySelector.tabeLogTotalSelector)) {
      logger.debug("scrape area: url exists");
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
      // update total
      event.sender.send("preftotal", totalPrefCounter);
      logger.debug(`prefecture total is ${totalPrefCounter} urls`);

      // over limit
      if (totalPrefCounter > myProperties.PAGE_LIMIT) {
        // areano
        const areano: number = Number(cacheMaker.get('area') ?? 0) + 1;
        logger.debug('areano: ' + areano);
        // numbers for loop
        const areaNumberArray: number[] = makeNumberRange(areano, 31);
        // area loop
        for (let areaNum of areaNumberArray) {
          try {
            // zero
            const zeroPadded: string = String(areaNum).padStart(2, '0');
            // area url
            const areaUrl: string = `${myConst.TABELOG_BASE}${pref}/A${prefPadded}${zeroPadded}/`;
            // update target url
            event.sender.send("statusUpdate", areaUrl);
            // goto top
            await puppScraper.doGo(areaUrl);
            logger.debug(`scraping area: ${areaUrl}`);
            // wait for datalist
            await puppScraper.doWaitFor(myProperties.WAIT_SECOND);

            // url exists
            if (await puppScraper.doCheckSelector(mySelector.tabeLogTotalSelector)) {
              // total
              const tmpAreaTotal: any = await puppScraper.doMultiEval(
                mySelector.tabeLogTotalSelector,
                "innerHTML"
              );
              // total number
              const tmpAreaTotalNum: string = tmpAreaTotal[0].replace(/<[^>]*>/g, '');
              // totalCounter
              const totalAreaCounter: number = Number(tmpAreaTotalNum);
              // update total
              event.sender.send("areatotal", totalAreaCounter);
              logger.debug(`area total is ${totalAreaCounter}`);

              // over limit
              if (totalAreaCounter > myProperties.PAGE_LIMIT) {
                logger.debug('area total exceed 1200');
                // cityno
                const cityno: number = Number(cacheMaker.get('city') ?? 0) + 1;
                logger.debug('cityno: ' + cityno);
                // numbers for loop
                const cityNumberArray: number[] = makeNumberRange(cityno, 60);
                // city loop
                for (let cityNum of cityNumberArray) {
                  try {
                    // area
                    cacheMaker.set('city', cityNum);
                    // city number
                    const cityPadded: string = String(cityNum).padStart(2, '0');
                    // city url
                    const cityUrl: string = `${myConst.TABELOG_BASE}${pref}/A${prefPadded}${zeroPadded}/A${prefPadded}${zeroPadded}${cityPadded}/`;
                    // update target url
                    event.sender.send("statusUpdate", cityUrl);
                    // goto top
                    await puppScraper.doGo(cityUrl);
                    logger.debug(`scraping city: ${cityUrl}`);
                    // wait for datalist
                    await puppScraper.doWaitFor(myProperties.WAIT_SECOND);
                    // url exists
                    if (await puppScraper.doCheckSelector(mySelector.tabeLogTotalSelector)) {
                      // total
                      const tmpCityTotal: any = await puppScraper.doMultiEval(
                        mySelector.tabeLogTotalSelector,
                        "innerHTML"
                      );
                      // total number
                      const tmpCityTotalNum: string = tmpCityTotal[0].replace(/<[^>]*>/g, '');
                      // totalCounter
                      const totalCityCounter: number = Number(tmpCityTotalNum);
                      logger.debug(`city total is ${totalCityCounter}`);
                      // update total
                      event.sender.send("citytotal", totalCityCounter);
                      // page counter
                      const cityPageCounter: number = Math.ceil(totalCityCounter / 20);

                      // over 1200
                      if (totalCityCounter > myProperties.PAGE_LIMIT) {
                        logger.debug('city total exceed 1200');
                        // cityno
                        const categoryno: number = Number(cacheMaker.get('category') ?? 0) + 1;
                        logger.debug('categoryno: ' + categoryno);
                        // category loop
                        for (let i = categoryno; i < myArrays.categories.length; i++) {
                          try {
                            // area
                            cacheMaker.set('category', i);
                            // city url
                            const categoryUrl: string = `${myConst.TABELOG_BASE}${pref}/A${prefPadded}${zeroPadded}/A${prefPadded}${zeroPadded}${cityPadded}/rstLst/${myArrays.categories[i]}`;
                            // update target url
                            event.sender.send("statusUpdate", categoryUrl);
                            // goto top
                            await puppScraper.doGo(categoryUrl);
                            logger.debug(`scraping category: ${categoryUrl}`);
                            // wait for datalist
                            await puppScraper.doWaitFor(myProperties.WAIT_SECOND);
                            // url exists
                            if (await puppScraper.doCheckSelector(mySelector.tabeLogGenreTotalSelector)) {
                              logger.debug(`scraping category: get total started`);
                              // total
                              const tmpCategoryTotal: any = await puppScraper.doMultiEval(
                                mySelector.tabeLogGenreTotalSelector,
                                "innerHTML",
                              );
                              // total number
                              const tmpCategoriesTotalNum: string = tmpCategoryTotal[0].replace(/<[^>]*>/g, '');
                              // update total
                              event.sender.send("categorytotal", tmpCategoriesTotalNum);
                              // totalCounter
                              const totalCategoriesCounter: number = Number(tmpCategoriesTotalNum);
                              // page counter
                              const categoryPageCounter: number = Math.ceil(totalCategoriesCounter / 20);
                              // final category url
                              const finalCategoryUrl: any = await doScrapeUrl(categoryUrl, mySelector.tabeLogCategoryUrlSelector, 'category', categoryPageCounter, event);
                              logger.debug('category result: ');
                              finalCsvArray.push(finalCategoryUrl);

                            } else {
                              logger.debug('no category selector');
                              continue;
                            }

                          } catch (e: unknown) {
                            // error
                            logger.error(e);
                            continue;
                          }
                        }

                      } else {
                        logger.debug('city: not exceed 1200');
                        logger.debug(`city: total is ${totalCityCounter}`);
                        // final url
                        const finalCityUrl: any = await doScrapeUrl(cityUrl + 'rstLst', mySelector.tabeLogUrlSelector, 'city', cityPageCounter, event);
                        logger.debug('city result: ');
                        finalCsvArray.push(finalCityUrl);
                        break;
                      }

                    } else {
                      logger.debug('no city selector');
                      break;
                    }

                  } catch (e: unknown) {
                    // error
                    logger.error(e);
                    break;
                  }
                }

              } else {
                logger.debug('area: not exceed 1200');
                logger.debug(`area: total is ${totalAreaCounter}`);
                // page counter
                const areaPageCounter: number = Math.ceil(totalAreaCounter / 20);
                // final url
                const finalAreaUrl: any = await doScrapeUrl(areaUrl + 'rstLst', mySelector.tabeLogUrlSelector, 'area', areaPageCounter, event);
                logger.debug('area result: ');
                // push into array
                finalCsvArray.push(finalAreaUrl);
              }
            } else {
              logger.debug('area continue');
              continue;
            }
          } catch (e: unknown) {
            // error
            logger.error(e);
          }
        }

      } else {
        logger.debug('pref: exceed 1200');
        logger.debug(`total is ${totalPrefCounter}`);
      }
      // nowtime
      const nowtime: string = path.join(path.resolve(), 'csv', `${new Date().toISOString().replace(/[^\d]/g, "").slice(0, 14)}`);
      // file name
      const targetpath: string = `${nowtime}_${pref}_url.csv`;
      // make CSV
      await csvMaker.makeCsvData(finalCsvArray.flat(), myArrays.urls, targetpath);
    }

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
ipcMain.on("pause", async (_: any, arg: any) => {
  return new Promise(async (resolve, _) => {
    try {
      logger.info("ipc: pause mode");
      // db path
      let targetpath: string = '';
      // column array
      let targetColumnsArray: any[] = [];
      // pref no 
      const prefno: any = arg.index ?? 0;

      // url mode
      if (arg.type == "url") {
        // area
        const areaCache: number = Number(cacheMaker.get('area') ?? 0);
        // city
        const cityCache: number = Number(cacheMaker.get('city') ?? 0);
        // category
        const categoryCache: number = Number(cacheMaker.get('category') ?? 0);
        // update db
        const updateStatus1: any = database.prepare(`UPDATE urlstatus SET area = ? WHERE prefecture = ?`);
        const updateStatus2: any = database.prepare(`UPDATE urlstatus SET city = ? WHERE prefecture = ?`);
        const updateStatus3: any = database.prepare(`UPDATE urlstatus SET category = ? WHERE prefecture = ?`);
        // update all
        updateStatus1.run(areaCache, prefno);
        updateStatus2.run(cityCache, prefno);
        updateStatus3.run(categoryCache, prefno);
      }
      // show question dialog
      const selected: number = dialogMaker.showQuetion(
        "Q",
        "stop",
        "app will stop ok？scraped data is written to csv file."
      );

      // yes
      if (selected == 0) {
        // csv array
        let targetCsvArray: any[];
        // show pause message
        dialogMaker.showmessage("info", "stopped.");
        // nowtime
        const nowtime: string = path.join(path.resolve(), 'csv', `${new Date().toISOString().replace(/[^\d]/g, "").slice(0, 14)}`);
        // url mode
        if (arg.type == "url") {
          // file name
          targetpath = `${nowtime}_url.csv`;
          // CSV data
          targetCsvArray = finalCsvArray.flat();
          // columns
          targetColumnsArray = myArrays.urls;
          // make CSV
          await csvMaker.makeCsvData(finalCsvArray, targetColumnsArray, targetpath);

          // shop mode
        } else if (arg.type == "shop") {
          // file name
          targetpath = `${nowtime}.csv`;
          // columns
          targetColumnsArray = myArrays.columns;
          // CSV data
          targetCsvArray = finalResultArray.flat();
          // make CSV
          await csvMaker.makeCsvData(finalCsvArray, targetColumnsArray, targetpath);
        }
        // resolve
        resolve();

      } else {
        // return false
        return false;
      }

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

// clear
ipcMain.on("clear", async (_: any, __: any) => {
  try {
    logger.info("ipc: clear mode");
    // insert to urlstatus
    const insertUrlStatus: any = database.prepare('DELETE FROM urlstatus');
    // initialize urlstatus
    insertUrlStatus.run();
    logger.info("ipc: deleted");

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
  return new Promise(async (resolve, reject) => {
    try {
      // wait for 5 sec
      await puppScraper.doWaitFor(5 * myProperties.WAIT_SECOND);

      // url exists
      if (await puppScraper.doCheckSelector(selector)) {
        // wait for datalist
        await puppScraper.doWaitFor(2 * myProperties.WAIT_SECOND);
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
  return new Promise(async (resolve, reject) => {
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
            // result
            finalArray.push(tmpUrls);

          } else {
            logger.debug('selector: no selector');
            // result
            resolve(finalArray);
          }

        } catch (e: unknown) {
          // error
          logger.error(e);
          // result
          resolve(finalArray);

        } finally {
          // switch on mode
          switch (mode) {
            case "area":
              areaSuccessCounter++;
              // update success
              event.sender.send('areasuccess', areaSuccessCounter);
              break;
            case "city":
              citySuccessCounter++;
              // update success
              event.sender.send('citysuccess', citySuccessCounter);
              break;
            default:
              logger.debug('out of range');
          }
        }
      }
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