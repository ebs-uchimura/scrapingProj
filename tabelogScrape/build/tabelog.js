"use strict";
/*
 * tabelog.ts
 *
 * function：scraping electron app
 **/
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
// namespace
const globalvariables_1 = require("./consts/globalvariables");
// import modules
const electron_1 = require("electron"); // electron
const path = __importStar(require("node:path")); // path
const node_sqlite_1 = require("node:sqlite");
const ElScrape0616_1 = require("./class/ElScrape0616"); // scraper
const ElDialog0414_1 = __importDefault(require("./class/ElDialog0414")); // dilog
const ElLogger_1 = __importDefault(require("./class/ElLogger")); // logger
const ElCsv0414_1 = __importDefault(require("./class/ElCsv0414")); // csv
const node_cache_1 = __importDefault(require("node-cache")); // node-cache
// loggeer instance
const logger = new ElLogger_1.default(globalvariables_1.myConst.APP_NAME, globalvariables_1.myConst.LOG_LEVEL);
// csv
const csvMaker = new ElCsv0414_1.default(globalvariables_1.myConst.CSV_ENCODING, logger);
// dialog
const dialogMaker = new ElDialog0414_1.default(logger);
// scraper
const puppScraper = new ElScrape0616_1.Scrape(logger);
// cache
const cacheMaker = new node_cache_1.default();
// db path
const dbPath = path.join(__dirname, '..', 'database.db');
// sqlite
const database = new node_sqlite_1.DatabaseSync(dbPath);
// all selectors
const tabeLogSelectors = {
    shopname: globalvariables_1.mySelector.tabeLogMainShopnameSelector,
    shopnameruby: globalvariables_1.mySelector.tabeLogMainShopnameRubySelector,
    station: globalvariables_1.mySelector.tabeLogStationSelector,
    shopname2: globalvariables_1.mySelector.tabeLogMainSubshopname,
    genre: globalvariables_1.mySelector.tabelLogGenreSelector,
    telephone: globalvariables_1.mySelector.tabeLogReservephoneSelector,
    reservable: globalvariables_1.mySelector.tabeLogReservableSelector,
    address1: globalvariables_1.mySelector.tabeLogAddress1Selector,
    address2: globalvariables_1.mySelector.tabeLogAddress2Selector,
    monday: globalvariables_1.mySelector.tabeLogBusinesstimeMonSelector,
    tuesday: globalvariables_1.mySelector.tabeLogBusinesstimeTueSelector,
    wednesday: globalvariables_1.mySelector.tabeLogBusinesstimeWedSelector,
    thursday: globalvariables_1.mySelector.tabeLogBusinesstimeThuSelector,
    friday: globalvariables_1.mySelector.tabeLogBusinesstimeFriSelector,
    saturday: globalvariables_1.mySelector.tabeLogBusinesstimeSatSelector,
    sunday: globalvariables_1.mySelector.tabeLogBusinesstimeSunSelector,
    holiday: globalvariables_1.mySelector.tabeLogBusinesstimeHolSelector,
    creditcard: globalvariables_1.mySelector.tabeLogPaymentCardSelector,
    electronicmoney: globalvariables_1.mySelector.tabeLogPaymentElSelector,
    codepayment: globalvariables_1.mySelector.tabeLogPaymentCodeSelector,
    seat: globalvariables_1.mySelector.tabeLogSheetSelector,
    capacity: globalvariables_1.mySelector.tabeLogReserveLimitSelector,
    privateroom: globalvariables_1.mySelector.tabeLogPrivateRoomSelector,
    vip: globalvariables_1.mySelector.tabeLogRentalSelector,
    smoking: globalvariables_1.mySelector.tabeLogSmokingSelector,
    parking: globalvariables_1.mySelector.tabeLogParkingSelector,
    alldrink: globalvariables_1.mySelector.tabeLogAlldrinkSelector,
    homepage: globalvariables_1.mySelector.tabeLogHomepageSelector,
    shopphone: globalvariables_1.mySelector.tabeLogTelephoneSelector,
    shopphone2: globalvariables_1.mySelector.tabeLogTelephone2Selector,
};
// desktop path
const dir_home = (_a = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"]) !== null && _a !== void 0 ? _a : "";
const dir_desktop = path.join(dir_home, "Desktop");
/*
 main
*/
// mainWindow
let mainWindow;
// isQuiting flg
let isQuiting;
// final Csv Array
let finalCsvArray = [];
// final Result Array
let finalResultArray = [];
// area counter
let areaSuccessCounter = 0;
// city counter
let citySuccessCounter = 0;
// create window
const createWindow = () => {
    try {
        // window
        mainWindow = new electron_1.BrowserWindow({
            width: globalvariables_1.myWindows.WINDOW_WIDTH, // width
            height: globalvariables_1.myWindows.WINDOW_HEIGHT, // height
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
        mainWindow.on("will-resize", (event) => {
            // cancel
            event.preventDefault();
            // hide window
            mainWindow.hide();
            // return false
            event.returnValue = false;
        });
        // close
        mainWindow.on("close", (event) => {
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
        mainWindow.on("closed", () => {
            // destroy window
            mainWindow.destroy();
        });
    }
    catch (e) {
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
electron_1.app.enableSandbox();
// ready
electron_1.app.on("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("app: electron is ready");
    // create window
    createWindow();
    // icon
    const icon = electron_1.nativeImage.createFromPath(path.join(__dirname, "../assets/gourmet.ico"));
    // tray
    const mainTray = new electron_1.Tray(icon);
    // context menu
    const contextMenu = electron_1.Menu.buildFromTemplate([
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
                electron_1.app.quit();
            },
        },
    ]);
    // set context menu
    mainTray.setContextMenu(contextMenu);
    // doubleclick
    mainTray.on("double-click", () => mainWindow.show());
}));
// activate
electron_1.app.on("activate", () => {
    // no window
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        // reboot
        createWindow();
    }
});
// close
electron_1.app.on("before-quit", () => {
    logger.info("ipc: quit mode");
    // close flg
    isQuiting = true;
});
// exit
electron_1.app.on("window-all-closed", () => {
    logger.info("app: close app");
    // exit app
    electron_1.app.quit();
});
/*
 IPC
*/
/* page */
electron_1.ipcMain.on("page", (_, arg) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info("ipc: page mode");
        // target url
        let url = '';
        // switch on mode
        switch (arg) {
            // exit_page
            case "exit_page":
                // except for apple
                if (process.platform !== "darwin") {
                    // quit app
                    electron_1.app.quit();
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
        yield mainWindow.loadFile(path.join(__dirname, url));
    }
    catch (e) {
        // show error message
        logger.error(e);
        // error
        if (e instanceof Error) {
            // show error
            dialogMaker.showmessage("error", `${e.message}`);
        }
    }
}));
// CSV
electron_1.ipcMain.on("csv", (event, _) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info("ipc: csv mode");
        // get CSV data
        const result = yield csvMaker.showCSVDialog(mainWindow);
        // return csv data
        event.sender.send("shopinfoCsvlist", result.flat());
    }
    catch (e) {
        // show error message
        logger.error(e);
        // error
        if (e instanceof Error) {
            // show error
            dialogMaker.showmessage("error", `${e.message}`);
        }
    }
}));
// error
electron_1.ipcMain.on("error", (_, arg) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info("ipc: error mode");
        // show error
        dialogMaker.showmessage("error", arg);
    }
    catch (e) {
        // show error message
        logger.error(e);
        // error
        if (e instanceof Error) {
            // show error
            dialogMaker.showmessage("error", `${e.message}`);
        }
    }
    finally {
        // close window
        puppScraper.doClose();
    }
}));
// scrape
electron_1.ipcMain.on("scrape", (event, arg) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info("ipc: scrape mode");
        // result
        let tmpResult = '';
        // total counter
        let totalCounter = arg.record.length;
        // error array
        let errorResultArray = [];
        // initialize counter
        areaSuccessCounter = 0;
        citySuccessCounter = 0;
        // db 
        const initDatabase = `
    CREATE TABLE IF NOT EXISTS status (
      id INTEGER PRIMARY KEY,
      area INTEGER,
      city INTEGER,
      cateogry INTEGER
    );`;
        // create db 
        database.exec(initDatabase);
        // insert into status
        const insertStatus = database.prepare(`
      INSERT INTO status (id, area, city, category)
      VALUES (?, ?, ?, ?)
    `);
        insertStatus.run(1, 0, 0, 0);
        // tag regexp
        const regex = new RegExp("(<([^>]+)>)", "gi");
        // initialize CSV array
        finalResultArray = [];
        // initialize scraper
        yield puppScraper.init();
        // update total
        event.sender.send("total", totalCounter);
        // scrape pages
        for (let url of arg.record) {
            try {
                // shop data
                let myShopObj = {
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
                yield puppScraper.doGo(url);
                // wait for 2 sec
                yield puppScraper.doWaitFor(2 * globalvariables_1.myProperties.WAIT_SECOND);
                logger.debug(`app: scraping ${url}`);
                // update target url
                event.sender.send("statusUpdate", url);
                // URLloop
                Object.keys(tabeLogSelectors).forEach((key) => __awaiter(void 0, void 0, void 0, function* () {
                    // result
                    tmpResult = '';
                    // scrape
                    const result = yield doScrape(tabeLogSelectors[key]);
                    // empty evaluation
                    const isEmpty = Object.keys(result).length === 0 && result.constructor === Object;
                    // empty
                    if (!isEmpty) {
                        // tag exists
                        if (regex.test(result)) {
                            // tag removal
                            tmpResult = result.replace(/(<([^>]+)>)/gi, "");
                        }
                        else {
                            // tag 
                            tmpResult = result;
                        }
                        // set result
                        myShopObj[`${key}`] = tmpResult;
                    }
                }));
                // push into array
                finalResultArray.push(myShopObj);
            }
            catch (err) {
                // push into error url array
                errorResultArray.push({ url: url });
                // error
                logger.error(err);
            }
        }
        // CSV file name
        const nowtime = `${dir_desktop}\\${new Date()
            .toISOString()
            .replace(/[^\d]/g, "")
            .slice(0, 14)}.csv`;
        // make csv
        csvMaker.makeCsvData(finalResultArray, globalvariables_1.myArrays.columns, nowtime);
        logger.debug("CSV writing finished");
        // error exists
        if (errorResultArray.length > 0) {
            // error csv file name
            const errornowtime = `${dir_desktop}\\error_${new Date()
                .toISOString()
                .replace(/[^\d]/g, "")
                .slice(0, 14)}.csv`;
            // make csv
            csvMaker.makeCsvData(errorResultArray, globalvariables_1.myArrays.columns, errornowtime);
            logger.debug("error CSV writing finished");
        }
        // show finished message
        dialogMaker.showmessage("info", "scraping finished");
    }
    catch (e) {
        // error
        logger.error(e);
        // error
        if (e instanceof Error) {
            // show error
            dialogMaker.showmessage("error", `${e.message}`);
        }
    }
    finally {
        // close puppeteer
        yield puppScraper.doClose();
    }
}));
// scrape url
electron_1.ipcMain.on("scrapeurl", (event, arg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        logger.info("ipc: scrape mode");
        // initialize counter
        areaSuccessCounter = 0;
        citySuccessCounter = 0;
        // pref index
        const prefindex = Number(arg.index);
        // pref
        const pref = String(arg.pref);
        // init db
        const initDatabase = `
    CREATE TABLE IF NOT EXISTS urlstatus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prefecture INTEGER,
      area INTEGER,
      city INTEGER,
      category INTEGER
    );`;
        // create db 
        database.exec(initDatabase);
        // select status
        const selectUrlStatus = database.prepare('SELECT * FROM urlstatus WHERE prefecture = ?');
        // get all
        const selectUrlResult = selectUrlStatus.get(prefindex);
        console.log(selectUrlResult);
        // not undefined
        if (selectUrlResult) {
            // area
            cacheMaker.set('area', selectUrlResult.area);
            // city
            cacheMaker.set('city', selectUrlResult.city);
            // category
            cacheMaker.set('category', selectUrlResult.category);
            logger.debug("scrapeurl: cache updated");
        }
        else {
            // insert to urlstatus
            const insertUrlStatus = database.prepare(`INSERT INTO urlstatus (prefecture, area, city, category) VALUES (?, ?, ?, ?)`);
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
        const prefPadded = String(prefindex).padStart(2, '0');
        logger.debug(`scrapeurl: ${globalvariables_1.myConst.TABELOG_BASE}${pref}/`);
        // initialize scraper
        yield puppScraper.init();
        // goto top
        yield puppScraper.doGo(`${globalvariables_1.myConst.TABELOG_BASE}${pref}/`);
        logger.debug(`scraping area: ${globalvariables_1.myConst.TABELOG_BASE}${pref}/`);
        // url exists
        if (yield puppScraper.doCheckSelector(globalvariables_1.mySelector.tabeLogTotalSelector)) {
            logger.debug("scrape area: url exists");
            // wait for datalist
            yield puppScraper.doWaitFor(globalvariables_1.myProperties.WAIT_SECOND);
            // total tag
            const tmpPreftotal = yield puppScraper.doMultiEval(globalvariables_1.mySelector.tabeLogTotalSelector, "innerHTML");
            // tag removal
            const tmpPrefTotalNum = tmpPreftotal[0].replace(/<[^>]*>/g, '');
            // totalCounter
            const totalPrefCounter = Number(tmpPrefTotalNum);
            // update total
            event.sender.send("preftotal", totalPrefCounter);
            logger.debug(`prefecture total is ${totalPrefCounter} urls`);
            // over limit
            if (totalPrefCounter > globalvariables_1.myProperties.PAGE_LIMIT) {
                // areano
                const areano = Number((_a = cacheMaker.get('area')) !== null && _a !== void 0 ? _a : 0) + 1;
                console.log('areano: ' + areano);
                // numbers for loop
                const areaNumberArray = makeNumberRange(areano, 31);
                // area loop
                for (let areaNum of areaNumberArray) {
                    try {
                        // zero
                        const zeroPadded = String(areaNum).padStart(2, '0');
                        // area url
                        const areaUrl = `${globalvariables_1.myConst.TABELOG_BASE}${pref}/A${prefPadded}${zeroPadded}/`;
                        // update target url
                        event.sender.send("statusUpdate", areaUrl);
                        // goto top
                        yield puppScraper.doGo(areaUrl);
                        logger.debug(`scraping area: ${areaUrl}`);
                        // wait for datalist
                        yield puppScraper.doWaitFor(globalvariables_1.myProperties.WAIT_SECOND);
                        // url exists
                        if (yield puppScraper.doCheckSelector(globalvariables_1.mySelector.tabeLogTotalSelector)) {
                            // total
                            const tmpAreaTotal = yield puppScraper.doMultiEval(globalvariables_1.mySelector.tabeLogTotalSelector, "innerHTML");
                            // total number
                            const tmpAreaTotalNum = tmpAreaTotal[0].replace(/<[^>]*>/g, '');
                            // totalCounter
                            const totalAreaCounter = Number(tmpAreaTotalNum);
                            // update total
                            event.sender.send("areatotal", totalAreaCounter);
                            logger.debug(`area total is ${totalAreaCounter}`);
                            // over limit
                            if (totalAreaCounter > globalvariables_1.myProperties.PAGE_LIMIT) {
                                logger.debug('area total exceed 1200');
                                // cityno
                                const cityno = Number((_b = cacheMaker.get('city')) !== null && _b !== void 0 ? _b : 0) + 1;
                                console.log('cityno: ' + cityno);
                                // numbers for loop
                                const cityNumberArray = makeNumberRange(cityno, 60);
                                // city loop
                                for (let cityNum of cityNumberArray) {
                                    try {
                                        // area
                                        cacheMaker.set('city', cityNum);
                                        // city number
                                        const cityPadded = String(cityNum).padStart(2, '0');
                                        // city url
                                        const cityUrl = `${globalvariables_1.myConst.TABELOG_BASE}${pref}/A${prefPadded}${zeroPadded}/A${prefPadded}${zeroPadded}${cityPadded}/`;
                                        // update target url
                                        event.sender.send("statusUpdate", cityUrl);
                                        // goto top
                                        yield puppScraper.doGo(cityUrl);
                                        logger.debug(`scraping city: ${cityUrl}`);
                                        // wait for datalist
                                        yield puppScraper.doWaitFor(globalvariables_1.myProperties.WAIT_SECOND);
                                        // url exists
                                        if (yield puppScraper.doCheckSelector(globalvariables_1.mySelector.tabeLogTotalSelector)) {
                                            // total
                                            const tmpCityTotal = yield puppScraper.doMultiEval(globalvariables_1.mySelector.tabeLogTotalSelector, "innerHTML");
                                            // total number
                                            const tmpCityTotalNum = tmpCityTotal[0].replace(/<[^>]*>/g, '');
                                            // totalCounter
                                            const totalCityCounter = Number(tmpCityTotalNum);
                                            logger.debug(`city total is ${totalCityCounter}`);
                                            // update total
                                            event.sender.send("citytotal", totalCityCounter);
                                            // page counter
                                            const cityPageCounter = Math.ceil(totalCityCounter / 20);
                                            // over 1200
                                            if (totalCityCounter > globalvariables_1.myProperties.PAGE_LIMIT) {
                                                logger.debug('city total exceed 1200');
                                                // cityno
                                                const categoryno = Number((_c = cacheMaker.get('category')) !== null && _c !== void 0 ? _c : 0) + 1;
                                                console.log('categoryno: ' + categoryno);
                                                // category loop
                                                for (let i = categoryno; i < globalvariables_1.myArrays.categories.length; i++) {
                                                    try {
                                                        // area
                                                        cacheMaker.set('category', i);
                                                        // city url
                                                        const categoryUrl = `${globalvariables_1.myConst.TABELOG_BASE}${pref}/A${prefPadded}${zeroPadded}/A${prefPadded}${zeroPadded}${cityPadded}/rstLst/${globalvariables_1.myArrays.categories[i]}`;
                                                        // update target url
                                                        event.sender.send("statusUpdate", categoryUrl);
                                                        // goto top
                                                        yield puppScraper.doGo(categoryUrl);
                                                        logger.debug(`scraping category: ${categoryUrl}`);
                                                        // wait for datalist
                                                        yield puppScraper.doWaitFor(globalvariables_1.myProperties.WAIT_SECOND);
                                                        // url exists
                                                        if (yield puppScraper.doCheckSelector(globalvariables_1.mySelector.tabeLogGenreTotalSelector)) {
                                                            logger.debug(`scraping category: get total started`);
                                                            // total
                                                            const tmpCategoryTotal = yield puppScraper.doMultiEval(globalvariables_1.mySelector.tabeLogGenreTotalSelector, "innerHTML");
                                                            // total number
                                                            const tmpCategoriesTotalNum = tmpCategoryTotal[0].replace(/<[^>]*>/g, '');
                                                            // update total
                                                            event.sender.send("categorytotal", tmpCategoriesTotalNum);
                                                            // totalCounter
                                                            const totalCategoriesCounter = Number(tmpCategoriesTotalNum);
                                                            // page counter
                                                            const categoryPageCounter = Math.ceil(totalCategoriesCounter / 20);
                                                            // final category url
                                                            const finalCategoryUrl = yield doScrapeUrl(categoryUrl, globalvariables_1.mySelector.tabeLogCategoryUrlSelector, 'category', categoryPageCounter, event);
                                                            logger.debug('category result: ');
                                                            finalCsvArray.push(finalCategoryUrl);
                                                        }
                                                        else {
                                                            logger.debug('no category selector');
                                                            continue;
                                                        }
                                                    }
                                                    catch (e) {
                                                        // error
                                                        logger.error(e);
                                                        continue;
                                                    }
                                                }
                                            }
                                            else {
                                                logger.debug('city: not exceed 1200');
                                                logger.debug(`city: total is ${totalCityCounter}`);
                                                // final url
                                                const finalCityUrl = yield doScrapeUrl(cityUrl + 'rstLst', globalvariables_1.mySelector.tabeLogUrlSelector, 'city', cityPageCounter, event);
                                                logger.debug('city result: ');
                                                finalCsvArray.push(finalCityUrl);
                                                break;
                                            }
                                        }
                                        else {
                                            logger.debug('no city selector');
                                            break;
                                        }
                                    }
                                    catch (e) {
                                        // error
                                        logger.error(e);
                                        break;
                                    }
                                }
                            }
                            else {
                                logger.debug('area: not exceed 1200');
                                logger.debug(`area: total is ${totalAreaCounter}`);
                                // page counter
                                const areaPageCounter = Math.ceil(totalAreaCounter / 20);
                                // final url
                                const finalAreaUrl = yield doScrapeUrl(areaUrl + 'rstLst', globalvariables_1.mySelector.tabeLogUrlSelector, 'area', areaPageCounter, event);
                                logger.debug('area result: ');
                                // push into array
                                finalCsvArray.push(finalAreaUrl);
                            }
                        }
                        else {
                            logger.debug('area continue');
                            continue;
                        }
                    }
                    catch (e) {
                        // error
                        logger.error(e);
                    }
                }
            }
            else {
                logger.debug('pref: exceed 1200');
                logger.debug(`total is ${totalPrefCounter}`);
            }
            // nowtime
            const nowtime = `${dir_desktop}\\${new Date()
                .toISOString()
                .replace(/[^\d]/g, "")
                .slice(0, 14)}`;
            // file name
            const targetpath = `${nowtime}_${pref}_url.csv`;
            // make CSV
            yield csvMaker.makeCsvData(finalCsvArray.flat(), globalvariables_1.myArrays.urls, targetpath);
        }
    }
    catch (e) {
        // error
        logger.error(e);
        // error
        if (e instanceof Error) {
            // show error
            dialogMaker.showmessage("error", `${e.message}`);
        }
    }
}));
// pause
electron_1.ipcMain.on("pause", (_, arg) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, _) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        try {
            logger.info("ipc: pause mode");
            // db path
            let targetpath = '';
            // column array
            let targetColumnsArray = [];
            // pref no 
            const prefno = (_a = arg.index) !== null && _a !== void 0 ? _a : 0;
            // url mode
            if (arg.type == "url") {
                // area
                const areaCache = Number((_b = cacheMaker.get('area')) !== null && _b !== void 0 ? _b : 0);
                // city
                const cityCache = Number((_c = cacheMaker.get('city')) !== null && _c !== void 0 ? _c : 0);
                // category
                const categoryCache = Number((_d = cacheMaker.get('category')) !== null && _d !== void 0 ? _d : 0);
                // update db
                const updateStatus1 = database.prepare(`UPDATE urlstatus SET area = ? WHERE prefecture = ?`);
                const updateStatus2 = database.prepare(`UPDATE urlstatus SET city = ? WHERE prefecture = ?`);
                const updateStatus3 = database.prepare(`UPDATE urlstatus SET category = ? WHERE prefecture = ?`);
                // update all
                updateStatus1.run(areaCache, prefno);
                updateStatus2.run(cityCache, prefno);
                updateStatus3.run(categoryCache, prefno);
            }
            // show question dialog
            const selected = dialogMaker.showQuetion("Q", "stop", "app will stop ok？scraped data is written to csv file.");
            // yes
            if (selected == 0) {
                // csv array
                let targetCsvArray;
                // show pause message
                dialogMaker.showmessage("info", "stopped.");
                // nowtime
                const nowtime = `${dir_desktop}\\${new Date()
                    .toISOString()
                    .replace(/[^\d]/g, "")
                    .slice(0, 14)}`;
                // url mode
                if (arg.type == "url") {
                    // file name
                    targetpath = `${nowtime}_url.csv`;
                    // CSV data
                    targetCsvArray = finalCsvArray.flat();
                    // columns
                    targetColumnsArray = globalvariables_1.myArrays.urls;
                    // make CSV
                    yield csvMaker.makeCsvData(finalCsvArray, targetColumnsArray, targetpath);
                    // shop mode
                }
                else if (arg.type == "shop") {
                    // file name
                    targetpath = `${nowtime}.csv`;
                    // columns
                    targetColumnsArray = globalvariables_1.myArrays.columns;
                    // CSV data
                    targetCsvArray = finalResultArray.flat();
                    // make CSV
                    yield csvMaker.makeCsvData(finalCsvArray, targetColumnsArray, targetpath);
                }
                // resolve
                resolve();
            }
            else {
                // return false
                return false;
            }
        }
        catch (e) {
            // error
            logger.error(e);
            // error
            if (e instanceof Error) {
                // show error
                dialogMaker.showmessage("error", `${e.message}`);
            }
            return false;
        }
        finally {
            // goto top
            yield puppScraper.doClose();
        }
    }));
}));
// clear
electron_1.ipcMain.on("clear", (_, __) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info("ipc: clear mode");
        // insert to urlstatus
        const insertUrlStatus = database.prepare('DELETE FROM urlstatus');
        // initialize urlstatus
        insertUrlStatus.run();
        logger.info("ipc: deleted");
    }
    catch (e) {
        // error
        logger.error(e);
        // error
        if (e instanceof Error) {
            // show error
            dialogMaker.showmessage("error", `${e.message}`);
        }
    }
}));
// exit
electron_1.ipcMain.on("exit", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info("ipc: exit mode");
        // quit app
        electron_1.app.quit();
    }
    catch (e) {
        // error
        logger.error(e);
        // error
        if (e instanceof Error) {
            // show error
            dialogMaker.showmessage("error", `${e.message}`);
        }
    }
    finally {
        // goto top
        yield puppScraper.doClose();
    }
}));
// do scraping
const doScrape = (selector) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // wait for 5 sec
            yield puppScraper.doWaitFor(5 * globalvariables_1.myProperties.WAIT_SECOND);
            // url exists
            if (yield puppScraper.doCheckSelector(selector)) {
                // wait for datalist
                yield puppScraper.doWaitFor(2 * globalvariables_1.myProperties.WAIT_SECOND);
                // url
                const tmpValues = yield puppScraper.doSingleEval(selector, "innerHTML");
                logger.debug(tmpValues.trim());
                // result
                resolve(tmpValues.trim());
            }
            else {
                // ignore error
                resolve("");
            }
        }
        catch (e) {
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
    }));
});
// do scraping
const doScrapeUrl = (url, selector, mode, limit, event) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // result
            let finalArray = [];
            // get url list
            const urls = [...Array(Math.ceil(limit)).keys()].map(i => `${url}/${++i}`);
            // 収集ループ
            for (const [index, url] of Object.entries(urls)) {
                try {
                    logger.debug(`${mode}: ${index}`);
                    // goto page
                    yield puppScraper.doGo(url);
                    // wait for 2 sec
                    yield puppScraper.doWaitFor(2 * globalvariables_1.myProperties.WAIT_SECOND);
                    // url exists
                    if (yield puppScraper.doCheckSelector(selector)) {
                        // wait for datalist
                        yield puppScraper.doWaitFor(2 * globalvariables_1.myProperties.WAIT_SECOND);
                        // url
                        const tmpUrls = yield puppScraper.doMultiEval(selector, "href");
                        // result
                        finalArray.push(tmpUrls);
                    }
                    else {
                        logger.debug('selector: no selector');
                        // result
                        resolve(finalArray);
                    }
                }
                catch (e) {
                    // error
                    logger.error(e);
                    // result
                    resolve(finalArray);
                }
                finally {
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
        }
        catch (e) {
            // error
            logger.error(e);
            // error
            if (e instanceof Error) {
                // show error
                dialogMaker.showmessage("error", `${e.message}`);
            }
        }
    }));
});
// number array
const makeNumberRange = (start, end) => [...new Array(end - start).keys()].map(n => n + start);
