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
const ElScrapeCore0715_1 = require("./class/ElScrapeCore0715"); // scraper
const ElDialog0414_1 = __importDefault(require("./class/ElDialog0414")); // dilog
const ElLogger_1 = __importDefault(require("./class/ElLogger")); // logger
const ElCsv0414_1 = __importDefault(require("./class/ElCsv0414")); // csv
const ElMkdir0414_1 = __importDefault(require("./class/ElMkdir0414")); // mkdir
// loggeer instance
const logger = new ElLogger_1.default(globalvariables_1.myConst.COMPANY_NAME, globalvariables_1.myConst.APP_NAME, globalvariables_1.myConst.LOG_LEVEL);
// csv
const csvMaker = new ElCsv0414_1.default(globalvariables_1.myConst.CSV_ENCODING, logger);
// dialog
const dialogMaker = new ElDialog0414_1.default(logger);
// scraper
const puppScraper = new ElScrapeCore0715_1.Scrape(logger);
// mkdir
const mkdirManager = new ElMkdir0414_1.default(logger);
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
// pref counter
let prefUrlSuccessCounter = 0;
// area counter
let areaUrlSuccessCounter = 0;
// city counter
let cityUrlSuccessCounter = 0;
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
            if (!electron_1.app.isPackaged) {
                // dev mode
                mainWindow.webContents.openDevTools();
            }
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
    // make dir
    yield mkdirManager.mkDir('csv');
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
        // csv path
        const csvPath = yield csvMaker.showCSVDialog(mainWindow);
        // get CSV data
        const result = yield csvMaker.getCsvData(csvPath);
        // return csv data
        event.sender.send("shopinfoCsvlist", result);
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
        yield puppScraper.doClose();
    }
}));
// scrape
electron_1.ipcMain.on("scrape", (event, arg) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info("ipc: scrape mode");
        // shop success counter
        let shopSuccessCounter = 0;
        // shop fail counter
        let shopFailCounter = 0;
        // result
        let tmpResult = '';
        // total counter
        let totalCounter = arg.record.length;
        // error array
        let errorResultArray = [];
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
                yield puppScraper.doGo(url[0]);
                // wait for 2 sec
                yield puppScraper.doWaitFor(2 * globalvariables_1.myProperties.WAIT_SECOND);
                logger.debug(`app: scraping ${url[0]}`);
                // update target url
                event.sender.send("statusUpdate", url[0]);
                // result
                tmpResult = '';
                // shopname
                const shopname = yield doScrape(globalvariables_1.mySelector.tabeLogMainShopnameSelector);
                const checkedShopName = checkEvaluation(shopname);
                myShopObj['shopname'] = checkedShopName;
                // station
                const station = yield doScrape(globalvariables_1.mySelector.tabeLogStationSelector);
                const checkedStation = checkEvaluation(station);
                myShopObj['station'] = checkedStation;
                // shopname2
                const shopname2 = yield doScrape(globalvariables_1.mySelector.tabeLogMainSubshopname);
                const checkedShopName2 = checkEvaluation(shopname2);
                myShopObj['shopname2'] = checkedShopName2;
                // genre
                const genre = yield doScrape(globalvariables_1.mySelector.tabelLogGenreSelector);
                const checkedGenre = checkEvaluation(genre);
                myShopObj['genre'] = checkedGenre;
                // telephone
                const telephone = yield doScrape(globalvariables_1.mySelector.tabeLogReservephoneSelector);
                const checkedTelephone = checkEvaluation(telephone);
                myShopObj['telephone'] = checkedTelephone;
                // address1
                const address1 = yield doScrape(globalvariables_1.mySelector.tabeLogAddress1Selector);
                const checkedAddress1 = checkEvaluation(address1);
                myShopObj['address1'] = checkedAddress1;
                // address2
                const address2 = yield doScrape(globalvariables_1.mySelector.tabeLogAddress2Selector);
                const checkedAddress2 = checkEvaluation(address2);
                myShopObj['address2'] = checkedAddress2;
                // address3
                const address3 = yield doScrape(globalvariables_1.mySelector.tabeLogAddress3Selector);
                const checkedAddress3 = checkEvaluation(address3);
                myShopObj['address3'] = checkedAddress3;
                // businesstime
                const businesstime = yield doScrape(globalvariables_1.mySelector.tabeLogBusinesstimeSelector);
                const checkedBusinesstime = checkEvaluation(businesstime);
                myShopObj['businesstime'] = checkedBusinesstime;
                // seat
                const seat = yield doScrape(globalvariables_1.mySelector.tabeLogSheetSelector);
                const checkedSeat = checkEvaluation(seat);
                myShopObj['seat'] = checkedSeat;
                // homepage
                const homepage = yield doScrape(globalvariables_1.mySelector.tabeLogHomepageSelector);
                const checkedHomepage = checkEvaluation(homepage);
                myShopObj['homepage'] = checkedHomepage;
                // shopphone
                const shopphone = yield doScrape(globalvariables_1.mySelector.tabeLogTelephoneSelector);
                const checkedShopphone = checkEvaluation(shopphone);
                myShopObj['shopphone'] = checkedShopphone;
                // shopphone2
                const shopphone2 = yield doScrape(globalvariables_1.mySelector.tabeLogTelephone2Selector);
                const checkedShopphone2 = checkEvaluation(shopphone2);
                myShopObj['shopphone2'] = checkedShopphone2;
                // shop counter
                shopSuccessCounter++;
                // push into array
                finalResultArray.push(myShopObj);
            }
            catch (err) {
                // shop counter
                shopFailCounter++;
                // push into error url array
                errorResultArray.push({ url: url[0] });
                // error
                logger.error(err);
            }
            finally {
                // send success counter
                event.sender.send("success", shopSuccessCounter);
                // send fail counter
                event.sender.send("fail", shopFailCounter);
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
    }
}));
// scrape url
electron_1.ipcMain.on("scrapeurl", (event, arg) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info("ipc: scrape mode");
        // initialize counter
        areaUrlSuccessCounter = 0;
        cityUrlSuccessCounter = 0;
        // pref index
        const prefindex = Number(arg.index);
        // pref
        const pref = String(arg.pref);
        // start area index
        const startAreaindex = Number(arg.area) + 1;
        // start city index
        const startCityindex = Number(arg.city) + 1;
        logger.debug("scrapeurl: db insert finished");
        // pref padded
        const prefPadded = String(prefindex).padStart(2, '0');
        logger.debug(`scrapeurl: ${globalvariables_1.myConst.TABELOG_BASE}${pref}/`);
        // initialize scraper
        yield puppScraper.init();
        // goto top
        yield puppScraper.doGo(`${globalvariables_1.myConst.TABELOG_BASE}${pref}/`);
        logger.debug(`scrapeurl: scraping area: ${globalvariables_1.myConst.TABELOG_BASE}${pref}/`);
        // url exists
        if (!(yield puppScraper.doCheckSelector(globalvariables_1.mySelector.tabeLogTotalSelector))) {
            throw new Error('scrapeurl: scrape area: no key data');
        }
        logger.debug("scrapeurl: url exists");
        // wait for datalist
        yield puppScraper.doWaitFor(globalvariables_1.myProperties.WAIT_SECOND);
        // total tag
        const tmpPreftotal = yield puppScraper.doMultiEval(globalvariables_1.mySelector.tabeLogTotalSelector, "innerHTML");
        // tag removal
        const tmpPrefTotalNum = tmpPreftotal[0].replace(/<[^>]*>/g, '');
        // totalCounter
        const totalPrefCounter = Number(tmpPrefTotalNum);
        // pref total
        event.sender.send("preftotal", totalPrefCounter);
        // update total
        event.sender.send("scrapeurl", totalPrefCounter);
        logger.debug(`scrapeurl: prefecture total is ${totalPrefCounter} urls`);
        // over limit
        if (totalPrefCounter <= globalvariables_1.myProperties.PAGE_LIMIT) {
            throw new Error('scrapeurl: over total');
        }
        console.log(startAreaindex);
        // numbers for loop
        const areaNumberArray = makeNumberRange(startAreaindex, 31);
        // area loop
        for (let areaNum of areaNumberArray) {
            try {
                areaUrlSuccessCounter = 0;
                // zero
                const zeroPadded = String(areaNum).padStart(2, '0');
                // area url
                const areaUrl = `${globalvariables_1.myConst.TABELOG_BASE}${pref}/A${prefPadded}${zeroPadded}/`;
                // update target url
                event.sender.send("statusUpdate", areaUrl);
                // goto top
                yield puppScraper.doGo(areaUrl);
                logger.debug(`scrapeurl: ${areaUrl}`);
                // wait for datalist
                yield puppScraper.doWaitFor(globalvariables_1.myProperties.WAIT_SECOND);
                // url exists
                if (!(yield puppScraper.doCheckSelector(globalvariables_1.mySelector.tabeLogTotalSelector))) {
                    logger.debug('scrapeurl: area continue');
                    continue;
                }
                // total
                const tmpAreaTotal = yield puppScraper.doMultiEval(globalvariables_1.mySelector.tabeLogTotalSelector, "innerHTML");
                // total number
                const tmpAreaTotalNum = tmpAreaTotal[0].replace(/<[^>]*>/g, '');
                // totalCounter
                const totalAreaCounter = Number(tmpAreaTotalNum);
                // area total
                event.sender.send("areatotal", totalAreaCounter);
                logger.debug(`scrapeurl: area total is ${totalAreaCounter}`);
                // over limit
                if (totalAreaCounter <= globalvariables_1.myProperties.PAGE_LIMIT) {
                    logger.debug(`scrapeurl: total is ${totalAreaCounter}`);
                    // page counter
                    const areaPageCounter = Math.ceil(totalAreaCounter / 20);
                    // final url
                    const finalAreaUrl = yield doScrapeUrl(areaUrl + 'rstLst', globalvariables_1.mySelector.tabeLogUrlSelector, 'area', areaPageCounter, event);
                    logger.debug('scrapeurl: ');
                    // push into array
                    finalCsvArray.push(finalAreaUrl);
                    continue;
                }
                logger.debug('scrapeurl: area total exceed 1200');
                // numbers for loop
                const cityNumberArray = makeNumberRange(startCityindex, 60);
                // city loop
                for (let cityNum of cityNumberArray) {
                    try {
                        cityUrlSuccessCounter = 0;
                        // city number
                        const cityPadded = String(cityNum).padStart(2, '0');
                        // city url
                        const cityUrl = `${globalvariables_1.myConst.TABELOG_BASE}${pref}/A${prefPadded}${zeroPadded}/A${prefPadded}${zeroPadded}${cityPadded}/`;
                        // update target url
                        event.sender.send("statusUpdate", cityUrl);
                        // goto top
                        yield puppScraper.doGo(cityUrl);
                        logger.debug(`scrapeurl: ${cityUrl}`);
                        // wait for datalist
                        yield puppScraper.doWaitFor(globalvariables_1.myProperties.WAIT_SECOND);
                        // url exists
                        if (!(yield puppScraper.doCheckSelector(globalvariables_1.mySelector.tabeLogTotalSelector))) {
                            logger.debug('scrapeurl: no city selector');
                            break;
                        }
                        // total
                        const tmpCityTotal = yield puppScraper.doMultiEval(globalvariables_1.mySelector.tabeLogTotalSelector, "innerHTML");
                        // total number
                        const tmpCityTotalNum = tmpCityTotal[0].replace(/<[^>]*>/g, '');
                        // totalCounter
                        const totalCityCounter = Number(tmpCityTotalNum);
                        logger.debug(`scrapeurl: city total is ${totalCityCounter}`);
                        // city total
                        event.sender.send("citytotal", totalCityCounter);
                        // page counter
                        const cityPageCounter = Math.ceil(totalCityCounter / 20);
                        // over 1200
                        if (totalCityCounter <= globalvariables_1.myProperties.PAGE_LIMIT) {
                            logger.debug(`scrapeurl: total is ${totalCityCounter}`);
                            // final url
                            const finalCityUrl = yield doScrapeUrl(cityUrl + 'rstLst', globalvariables_1.mySelector.tabeLogUrlSelector, 'city', cityPageCounter, event);
                            logger.debug('scrapeurl result: ');
                            // push into array
                            finalCsvArray.push(finalCityUrl);
                            continue;
                        }
                        logger.debug('scrapeurl: city total exceed 1200');
                        // category loop
                        for (let i = 0; i < globalvariables_1.myArrays.categories.length; i++) {
                            try {
                                // city url
                                const categoryUrl = `${globalvariables_1.myConst.TABELOG_BASE}${pref}/A${prefPadded}${zeroPadded}/A${prefPadded}${zeroPadded}${cityPadded}/rstLst/${globalvariables_1.myArrays.categories[i]}`;
                                // update target url
                                event.sender.send("statusUpdate", categoryUrl);
                                // goto top
                                yield puppScraper.doGo(categoryUrl);
                                logger.debug(`scrapeurl: category: ${categoryUrl}`);
                                // wait for datalist
                                yield puppScraper.doWaitFor(globalvariables_1.myProperties.WAIT_SECOND);
                                // url exists
                                if (!(yield puppScraper.doCheckSelector(globalvariables_1.mySelector.tabeLogGenreTotalSelector))) {
                                    logger.debug('scrapeurl: no category selector');
                                    continue;
                                }
                                logger.debug(`scrapeurl: category get total started`);
                                // total
                                const tmpCategoryTotal = yield puppScraper.doMultiEval(globalvariables_1.mySelector.tabeLogGenreTotalSelector, "innerHTML");
                                // total number
                                const tmpCategoriesTotalNum = tmpCategoryTotal[0].replace(/<[^>]*>/g, '');
                                // totalCounter
                                const totalCategoriesCounter = Number(tmpCategoriesTotalNum);
                                // page counter
                                const categoryPageCounter = Math.ceil(totalCategoriesCounter / 20);
                                // final category url
                                const finalCategoryUrl = yield doScrapeUrl(categoryUrl, globalvariables_1.mySelector.tabeLogCategoryUrlSelector, 'category', categoryPageCounter, event);
                                // set to csv array
                                finalCsvArray.push(finalCategoryUrl);
                            }
                            catch (e) {
                                // error
                                logger.error(e);
                                continue;
                            }
                        }
                    }
                    catch (e) {
                        // error
                        logger.error(e);
                    }
                }
            }
            catch (e) {
                // error
                logger.error(e);
            }
        }
        // nowtime
        const nowtime = `${dir_desktop}\\${new Date()
            .toISOString()
            .replace(/[^\d]/g, "")
            .slice(0, 14)}`;
        // file name
        const targetpath = `${nowtime}_${pref}_url.csv`;
        logger.debug('scrapeurl: making csv...');
        // make CSV
        yield csvMaker.makeCsvData(finalCsvArray.flat().flat(), ['url'], targetpath);
        // show error
        dialogMaker.showmessage("finished", "URL取得が終わりました");
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
    return new Promise((resolve, _) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // url exists
            if (yield puppScraper.doCheckSelector(selector)) {
                // url
                const tmpValues = yield puppScraper.doSingleEval(selector, "innerHTML");
                // empty
                if (tmpValues == '') {
                    resolve('error');
                }
                else {
                    // result
                    resolve(tmpValues.trim());
                }
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
    return new Promise((resolve, _) => __awaiter(void 0, void 0, void 0, function* () {
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
                        // make url obj
                        const tmpUrlObj = tmpUrls.map((url) => {
                            return {
                                url: url
                            };
                        });
                        // result
                        finalArray.push(tmpUrlObj);
                    }
                    else {
                        logger.debug('scrapeurl: no selector');
                        // result
                        continue;
                    }
                }
                catch (e) {
                    // error
                    logger.error(e);
                    logger.debug('scrapeurl: no selector');
                    // result
                    resolve(finalArray);
                }
                finally {
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
// empty evaluation
const checkEvaluation = (value) => {
    // tag regexp
    const regex = new RegExp("(<([^>]+)>)", "gi");
    // isEmpty
    const isEmpty = Object.keys(value).length === 0 && value.constructor === Object;
    // empty
    if (!isEmpty) {
        // tag exists
        if (regex.test(value)) {
            // tag removal
            return value.replace(/(<([^>]+)>)/gi, "");
        }
        else {
            // tag 
            return value;
        }
    }
};
