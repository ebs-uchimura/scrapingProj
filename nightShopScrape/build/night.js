"use strict";
/*
 * night.ts
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
/// import modules
const electron_1 = require("electron"); // electron
const path = __importStar(require("path")); // path
const promises_1 = require("node:timers/promises"); // sleep
const Scrape0119_1 = require("./class/Scrape0119"); // scraper
const Logger0928_1 = __importDefault(require("./class/Logger0928")); // logger
const ElectronDialog0118_1 = __importDefault(require("./class/ElectronDialog0118")); // dialog
const ElectronCsv0119_1 = __importDefault(require("./class/ElectronCsv0119")); // csv
/// const
const PAGE_COUNT = 30; // shop pages
const TOTAL_COUNT = 2850; // total shops
const CSV_ENCODING = 'SJIS'; // CSV charcode
const LULINE_FIXED_URL = 'https://luline.jp/shop_list/all/search/'; // root url
/// config
// logger
const logger = new Logger0928_1.default("../../logs");
// scraper
const puppScraper = new Scrape0119_1.Scrape();
// dialog
const dialogMaker = new ElectronDialog0118_1.default();
// csv
const csvMaker = new ElectronCsv0119_1.default(CSV_ENCODING);
// desktop path
const dir_home = (_a = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']) !== null && _a !== void 0 ? _a : '';
const dir_desktop = path.join(dir_home, 'Desktop');
/// selector
// mainshopname selector
const LulineShopnameSelector = '#ankerMap > div > div > div > div > h5';
// mainshopname ruby selector
const LulineShopnameRubySelector = '#ankerMap > div > div > div > div > h6';
// genre selectors
const LulineGenreSelector = '#ankerMap > div > div > div > table > tbody > tr:nth-child(1) > td > a';
// area selector
const LulineAreaSelector = '#ankerMap > div > div > div > table > tbody > tr:nth-child(2) > td > a';
// businesstime selector
const LulineBusinesstimeSelector = '#ankerMap > div > div > div > table > tbody > tr:nth-child(3) > td';
// address selector
const LulineAddress1Selector = '#ankerMap > div > div > div > table > tbody > tr:nth-child(4) > td > a';
// address selector
const LulineAddress2Selector = '#ankerMap > div > div > div > table > tbody > tr:nth-child(5) > td > a';
// adjacent station selector
const LilineAdjacentStationSelector = '#ankerMap > div > div > div > table > tbody > tr:nth-child(6) > td';
// telephone selector
const LilineTelephoneSelector = '#ankerMap > div > div > div > table > tbody > tr:nth-child(7) > td';
// email selector
const LilineEmailSelector = '#ankerMap > div > div > div > table > tbody > tr:nth-child(8) > td';
// see more
const LilineSeemoreSelector = '#shopList > section > div.listViewWrap > div.moreViewBtn';
// all selectors
const LulineSelectors = {
    店舗名: LulineShopnameSelector,
    店舗名読み: LulineShopnameRubySelector,
    ジャンル: LulineGenreSelector,
    エリア: LulineAreaSelector,
    営業時間: LulineBusinesstimeSelector,
    住所1: LulineAddress1Selector,
    住所2: LulineAddress2Selector,
    最寄り駅: LilineAdjacentStationSelector,
    電話番号: LilineTelephoneSelector,
    メール: LilineEmailSelector,
};
// columns
const globalColumns = {
    shopname: '店舗名', // word
    shopnameruby: '店舗名読み', // shopnameruby
    genre: 'ジャンル', // genre
    area: 'エリア', // area
    businesstime: '営業時間', // businesstime
    address1: '住所1', // address1
    address2: '住所2', // address2
    station: '最寄り駅', // station
    telephone: '電話番号', // telephone
    mail: 'メール', // mail
};
/*
 main
*/
// main window
let mainWindow;
// quit
let isQuiting;
// final csv array
let finalCsvArray = [];
// finalshop result
let finalResultArray = [];
// create window
const createWindow = () => {
    try {
        // window
        mainWindow = new electron_1.BrowserWindow({
            width: 1200, // width
            height: 1000, // height
            webPreferences: {
                nodeIntegration: false, // Node.js usable
                contextIsolation: true, // isolate context
                preload: path.join(__dirname, 'preload/preload.js'), // preload
            },
        });
        // load index.html
        mainWindow.loadFile(path.join(__dirname, '../index.html'));
        // ready
        mainWindow.once('ready-to-show', () => {
            // dev mode
            // mainWindow.webContents.openDevTools();
        });
        // minimize
        mainWindow.on('minimize', (event) => {
            // cancel
            event.preventDefault();
            // hide window
            mainWindow.hide();
            // return false
            event.returnValue = false;
        });
        // close
        mainWindow.on('close', (event) => {
            // quiting
            if (!isQuiting) {
                // except for apple
                if (process.platform !== 'darwin') {
                    // false
                    event.returnValue = false;
                }
            }
        });
        // closed
        mainWindow.on('closed', () => {
            // destroy window
            mainWindow.destroy();
        });
    }
    catch (e) {
        // error
        if (e instanceof Error) {
            // show error message
            logger.error(`${e.message})`);
        }
    }
};
// enable sandbox
electron_1.app.enableSandbox();
// ready
electron_1.app.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    logger.info('app: electron is ready');
    // create window
    createWindow();
    // icon
    const icon = electron_1.nativeImage.createFromPath(path.join(__dirname, '../assets/nightshop.ico'));
    // tray
    const mainTray = new electron_1.Tray(icon);
    // context menu
    const contextMenu = electron_1.Menu.buildFromTemplate([
        // show
        {
            label: '表示', click: () => {
                mainWindow.show();
            }
        },
        // close
        {
            label: '閉じる', click: () => {
                electron_1.app.quit();
            }
        }
    ]);
    // set context menu
    mainTray.setContextMenu(contextMenu);
    // doubleclick
    mainTray.on('double-click', () => mainWindow.show());
}));
// activate
electron_1.app.on('activate', () => {
    // no window
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        // reboot
        createWindow();
    }
});
// close
electron_1.app.on('before-quit', () => {
    logger.info('ipc: quit mode');
    // close flg
    isQuiting = true;
});
// exit
electron_1.app.on('window-all-closed', () => {
    logger.info('app: close app');
    // exit app
    electron_1.app.quit();
});
/*
 IPC
*/
/* page */
electron_1.ipcMain.on('page', (_, arg) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info('ipc: page mode');
        // url
        let url = '';
        // switch on page
        switch (arg) {
            // exit
            case 'exit_page':
                // except for apple
                if (process.platform !== 'darwin') {
                    // quit app
                    electron_1.app.quit();
                    return false;
                }
                // no transfer
                url = '';
                break;
            // top page
            case 'top_page':
                // top page
                url = '../index.html';
                break;
            // url page
            case 'url_page':
                // url page
                url = '../url.html';
                break;
            // shop page
            case 'shop_page':
                // shop page
                url = '../shop.html';
                break;
            default:
                // empty
                url = '';
        }
        // load html file
        yield mainWindow.loadFile(path.join(__dirname, url));
    }
    catch (e) {
        // error
        if (e instanceof Error) {
            // error
            logger.error(e.message);
        }
    }
}));
// csv
electron_1.ipcMain.on('csv', (event, _) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info('ipc: csv mode');
        // get csv data
        const result = yield csvMaker.getCsvDataDialog();
        // send shop information
        event.sender.send('shopinfoCsvlist', result);
    }
    catch (e) {
        // error
        if (e instanceof Error) {
            // error
            logger.error(e.message);
        }
    }
}));
// scrape
electron_1.ipcMain.on('scrape', (event, arg) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info('ipc: scrape mode');
        // success
        let successCounter = 0;
        // fail
        let failCounter = 0;
        // total
        let totalCounter = arg.length;
        // regex
        const regex = new RegExp('(<([^>]+)>)', 'gi');
        // initialize scraper
        yield puppScraper.init();
        // send total
        event.sender.send('total', totalCounter);
        // loop for urls
        for (let url of arg) {
            try {
                // shop data
                const myShopObj = {
                    店舗名: '',
                    店舗名読み: '',
                    ジャンル: '',
                    エリア: '',
                    営業時間: '',
                    住所1: '',
                    住所2: '',
                    最寄り駅: '',
                    電話番号: '',
                    メール: '',
                };
                // goto page
                yield puppScraper.doGo(url);
                // wait for 5 sec
                yield (0, promises_1.setTimeout)(5 * 1000);
                logger.debug(`app: scraping ${url}`);
                // URL loop
                Object.keys(LulineSelectors).forEach((key) => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        // result
                        let tmpResult = '';
                        // wait for 1 sec
                        yield (0, promises_1.setTimeout)(1 * 1000);
                        // result
                        const result = yield doScrape(LulineSelectors[key]);
                        // if not empty
                        if (result != '') {
                            // tag exists
                            if (regex.test(result)) {
                                // set replaced result
                                tmpResult = result.replace(/(<([^>]+)>)/gi, '');
                            }
                            else {
                                // set result
                                tmpResult = result;
                            }
                            // set to shopdata
                            myShopObj[`${key}`] = tmpResult;
                        }
                    }
                    catch (error) {
                        // error
                        if (error instanceof Error) {
                            // error
                            logger.error(error.message);
                        }
                    }
                }));
                // success counter
                successCounter++;
                // empty
                const isEmpty = Object.keys(myShopObj).length === 0 && myShopObj.constructor === Object;
                // empty
                if (!isEmpty) {
                    // push into shopdata
                    finalResultArray.push(myShopObj);
                }
            }
            catch (err) {
                // error
                if (err instanceof Error) {
                    // error
                    logger.error(err.message);
                    // fail counter
                    failCounter++;
                }
            }
            finally {
                // statusUpdate
                event.sender.send('statusUpdate', url);
                // success
                event.sender.send('success', successCounter);
                // fail
                event.sender.send('fail', failCounter);
            }
        }
        // now time
        const csvpath = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, '').slice(0, 14)}.csv`;
        // write CSV
        yield csvMaker.makeCsvData(finalResultArray, globalColumns, csvpath);
        logger.info('CSV writing finished');
        // close window
        yield puppScraper.doClose();
        // show message
        dialogMaker.showmessage('info', '取得が終わりました');
    }
    catch (e) {
        // error
        if (e instanceof Error) {
            // error
            logger.error(e.message);
        }
    }
}));
// scrape url
electron_1.ipcMain.on('scrapeurl', (event, _) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info('ipc: scrape mode');
        // success Counter
        let successCounter = 0;
        // fail Counter
        let failCounter = 0;
        // page Counter
        let pageCounter = 1;
        // send total
        event.sender.send('total', TOTAL_COUNT);
        // initialize scraper
        yield puppScraper.init();
        // goto page
        yield puppScraper.doGo(LULINE_FIXED_URL);
        logger.debug(`app: scraping ${LULINE_FIXED_URL}`);
        // loop number
        const numbers = [...Array(TOTAL_COUNT)].map((_, i) => i + 1);
        // wait for 3 sec
        yield (0, promises_1.setTimeout)(3 * 1000);
        // scroll to bottom
        yield puppScraper.mouseWheel();
        logger.debug(`app: scrolling...`);
        // loop
        for (let number of numbers) {
            try {
                // page MAX
                if (number % PAGE_COUNT == 0) {
                    // click seemore
                    yield puppScraper.doClick(LilineSeemoreSelector);
                    logger.debug('app: seamore clicked');
                    // wait for 3 sec
                    yield (0, promises_1.setTimeout)(3 * 1000);
                    // pages 
                    pageCounter++;
                }
                // tmp url
                const tmpUrl = yield doScrapeUrl(pageCounter, number % PAGE_COUNT + 1);
                // url empty
                if (tmpUrl == '') {
                    // increment fail
                    failCounter++;
                }
                else {
                    // push url
                    finalCsvArray.push({
                        url: tmpUrl,
                    });
                    // increment success
                    successCounter++;
                }
            }
            catch (err) {
                // error
                if (err instanceof Error) {
                    // error
                    logger.error(err.message);
                    // increment fail
                    failCounter++;
                }
            }
            finally {
                // send success
                event.sender.send('success', successCounter);
                // send fail
                event.sender.send('fail', failCounter);
            }
        }
        // now time
        const nowtime = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, '').slice(0, 14)}`;
        // CSV file name
        const targetpath = `${nowtime}_url.csv`;
        // make CSV
        yield csvMaker.makeCsvData(finalCsvArray, globalColumns, targetpath);
        // show message
        dialogMaker.showmessage('info', '取得が終わりました');
    }
    catch (e) {
        // error
        if (e instanceof Error) {
            // error
            logger.error(e.message);
        }
    }
}));
// pause
electron_1.ipcMain.on('pause', (_, arg) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info('ipc: pause mode');
        // CSV path
        let targetpath = '';
        // CSV data array
        let targetCsvArray = [];
        // show question dialog
        const selected = dialogMaker.showQuetion('質問', '停止', '停止してよろしいですか？これまでのデータはCSVに書き出されます。');
        // yes
        if (selected == 0) {
            // nowtime
            const nowtime = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, '').slice(0, 14)}`;
            // URL
            if (arg == 'url') {
                // target CSV
                targetCsvArray = finalCsvArray;
                // CSV file name
                targetpath = `${nowtime}_url.csv`;
            }
            else if (arg == 'shop') {
                // target CSV
                targetCsvArray = finalResultArray;
                // CSV file name
                targetpath = `${nowtime}.csv`;
            }
            // make CSV
            yield csvMaker.makeCsvData(targetCsvArray, globalColumns, targetpath);
            // pause message
            dialogMaker.showmessage('info', '処理を中断しました');
        }
        else {
            return false;
        }
    }
    catch (e) {
        // error
        if (e instanceof Error) {
            // error
            logger.error(e.message);
        }
    }
}));
// exit
electron_1.ipcMain.on('exit', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info('ipc: exit mode');
        // exit App
        exitApp();
    }
    catch (e) {
        // error
        if (e instanceof Error) {
            // error
            logger.error(e.message);
        }
    }
}));
// do scraping
const doScrape = (selector) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // wait for 2 sec
            yield (0, promises_1.setTimeout)(2 * 100);
            // url exists
            if (yield puppScraper.doCheckSelector(selector)) {
                // wait for datalist
                yield puppScraper.doWaitSelector(selector, 10000);
                // url
                const tmpValues = yield puppScraper.doSingleEval(selector, 'innerHTML');
                // result 
                resolve(tmpValues.trim());
            }
            else {
                // error
                throw new Error("no selector");
            }
        }
        catch (e) {
            // error
            if (e instanceof Error) {
                logger.error(e.message);
            }
            // reject
            reject('');
        }
    }));
});
// do scraping url
const doScrapeUrl = (page, num) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // get url list
            const LulineDetailSelector = `#ListTable > div:nth-child(${page}) > div:nth-child(${num}) > div.shopDetailBtn > a`;
            // wait for 1 sec
            yield (0, promises_1.setTimeout)(1 * 1000);
            // selector exists
            if (yield puppScraper.doCheckSelector(LulineDetailSelector)) {
                // url
                const tmpUrl = yield puppScraper.doSingleEval(LulineDetailSelector, 'href');
                logger.info(`scraping: ${tmpUrl}`);
                // resolve url
                resolve(tmpUrl);
            }
            else {
                // error
                throw new Error("no selector");
            }
        }
        catch (e) {
            // error
            if (e instanceof Error) {
                logger.error(e.message);
            }
            // reject
            reject('');
        }
    }));
});
// exit App
const exitApp = () => {
    try {
        logger.info('ipc: exit mode');
        // show question dialog
        const selected = dialogMaker.showQuetion('質問', '終了', '終了してよろしいですか？これまでのデータは破棄されます。');
        // yes
        if (selected == 0) {
            // quit app
            electron_1.app.quit();
        }
    }
    catch (e) {
        // error
        if (e instanceof Error) {
            // error
            logger.error(e.message);
        }
    }
};
