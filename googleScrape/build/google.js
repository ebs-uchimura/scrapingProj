"use strict";
/*
 * google.ts
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
// import modules
const dotenv_1 = require("dotenv"); // dotenv
const electron_1 = require("electron"); // electron
const path = __importStar(require("path")); // path
const Scrape0119_1 = require("./class/Scrape0119"); // scraper
const ElectronDialog0118_1 = __importDefault(require("./class/ElectronDialog0118")); // logger
const Logger0928_1 = __importDefault(require("./class/Logger0928")); // logger
const ElectronCsv0119_1 = __importDefault(require("./class/ElectronCsv0119")); // csv
// const
const DEF_GOOGLE_URL = "https://www.google.com/"; // scraping site
const CSV_ENCODING = "SJIS"; // csv char code
// csv
const csvMaker = new ElectronCsv0119_1.default(CSV_ENCODING);
// logger
const logger = new Logger0928_1.default("../../logs");
// dialog
const dialogMaker = new ElectronDialog0118_1.default();
// scraper
const puppScraper = new Scrape0119_1.Scrape();
// env
(0, dotenv_1.config)({ path: path.join(__dirname, "../.env") });
/// selector
// searchbox
const pageSearchBoxSelectorA = ".gLFyf";
// shop info
const shopaddressSelector = `span.LrzXr`;
const shoptelephoneSelector = `span.LrzXr > a > span`;
// typeA(business)
const shatusBaseA = "div.nwVKo > div.loJjTe > div";
const shopnameSelectorA = `div.QpPSMb > div > div`;
const shopreviewSelectorA = `${shatusBaseA} > span.Aq14fc`;
const shopcommentSelectorA = `${shatusBaseA} > div > span.hqzQac > span > a > span`;
const shopgenreSelectorA = `${shatusBaseA} > div > span.E5BaQ`;
const shopstatusSelectorA = `div.bJpcZ > div.vk_bk.h-n > span > span > span > span > span > span > span`;
// typeB(business)
const shopnameSelectorB = `div.SPZz6b > h2 > span`;
const shopreviewSelectorB = `span.Aq14fc`;
const shopcommentSelectorB = `span.hqzQac > span > a > span`;
const shopgenreSelectorB = `span.YhemCb`;
// typeC(close)
const shopnameSelectorC = "div > div.d7sCQ.kp-header > div.fYOrjf.kp-hc > div > div > div > h2 > span";
const shopstatusSelectorC = "#Shyhc > span";
// typeD(close)
const shopnameSelectorD = "#rhs > div.kp-wholepage-osrp > div.wPNfjb > div > div > div:nth-child(2) > div > div > div.QpPSMb > div > div";
const shopstatusSelectorD = "#Shyhc > span";
// desktop path
const dir_home = (_a = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"]) !== null && _a !== void 0 ? _a : "";
const dir_desktop = path.join(dir_home, "Desktop");
// selectorsA
const googleSelectorsA = {
    shopname: shopnameSelectorA,
    status: shopstatusSelectorA,
    review: shopreviewSelectorA,
    comment: shopcommentSelectorA,
    genre: shopgenreSelectorA,
    address: shopaddressSelector,
    telephone: shoptelephoneSelector,
};
// selectorsB
const googleSelectorsB = {
    shopname: shopnameSelectorB,
    status: shopstatusSelectorA,
    review: shopreviewSelectorB,
    comment: shopcommentSelectorB,
    genre: shopgenreSelectorB,
    address: shopaddressSelector,
    telephone: shoptelephoneSelector,
};
// selectorsC
const googleSelectorsC = {
    shopname: shopnameSelectorC,
    status: shopstatusSelectorC,
    address: shopaddressSelector,
    telephone: shoptelephoneSelector,
};
// selectorsD
const googleSelectorsD = {
    shopname: shopnameSelectorD,
    status: shopstatusSelectorD,
    address: shopaddressSelector,
    telephone: shoptelephoneSelector,
};
// columns
const globalColumns = {
    word: '検索ワード', // word
    shopname: '店舗名', // shopname
    status: '状態', // status
    address: '住所', // address
    telephone: '店舗電話', // telephone
    genre: 'ジャンル', // genre
    review: 'レビュー', // review
    comment: '口コミ', // comment
};
/* main */
// main window
let mainWindow;
// quit
let isQuiting;
// finalshop result
let finalShopResultArray = [];
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
            // mainWindow.webContents.openDevTools();
        });
        // minimize
        mainWindow.on("minimize", (event) => {
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
electron_1.app.on("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    logger.info("app: electron is ready");
    // create window
    createWindow();
    // icon
    const icon = electron_1.nativeImage.createFromPath(path.join(__dirname, "../assets/google.ico"));
    // tray
    const mainTray = new electron_1.Tray(icon);
    // context menu
    const contextMenu = electron_1.Menu.buildFromTemplate([
        // show
        {
            label: "表示",
            click: () => {
                mainWindow.show();
            },
        },
        // close
        {
            label: "閉じる",
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
    // close flg
    isQuiting = true;
});
// exit
electron_1.app.on("window-all-closed", () => {
    logger.info("app: close app");
    // exit app
    electron_1.app.quit();
});
/* IPC */
// scraping
electron_1.ipcMain.on("scrape", (event, arg) => __awaiter(void 0, void 0, void 0, function* () {
    // success Counter
    let successCounter = 0;
    // fail Counter
    let failCounter = 0;
    try {
        logger.info("ipc: scrape mode");
        // totalWords
        const totalWords = arg.length;
        // send totalWords
        event.sender.send("total", totalWords);
        // initialize scraper
        yield puppScraper.init();
        // loop for arg
        for (let info of arg) {
            try {
                // wait for 1 sec
                yield puppScraper.doWaitFor(1000);
                // go to google.com
                yield puppScraper.doGo(DEF_GOOGLE_URL);
                // wait for 1 sec
                yield puppScraper.doWaitFor(1000);
                // scrape
                const result = yield doScrape(info);
                // result empty
                if (result != "") {
                    // isempty
                    const isEmpty = Object.keys(result).length === 0 && result.constructor === Object;
                    // shop obj
                    const emptyObj = {
                        検索ワード: info,
                        店舗名: "",
                        状態: "",
                        住所: "",
                        店舗電話: "",
                        ジャンル: "",
                        レビュー: "",
                        口コミ: "",
                    };
                    // if empty
                    if (result == "" || isEmpty) {
                        // increment fail
                        failCounter++;
                        // push empty into array
                        finalShopResultArray.push(emptyObj);
                        // send error
                        event.sender.send("statusUpdate", "error");
                    }
                    else {
                        // increment success
                        successCounter++;
                        // push into array
                        finalShopResultArray.push(result);
                        // send success
                        event.sender.send("statusUpdate", result);
                    }
                }
            }
            catch (err) {
                // fail
                failCounter++;
                // error
                if (err instanceof Error) {
                    // error
                    logger.error(err.message);
                }
            }
            finally {
                // send success
                event.sender.send("success", successCounter);
                // send fail
                event.sender.send("fail", failCounter);
            }
        }
        // nowtime
        const nowtime = `${dir_desktop}\\${new Date()
            .toISOString()
            .replace(/[^\d]/g, "")
            .slice(0, 14)}`;
        // CSV file name
        const targetpath = `${nowtime}.csv`;
        // write CSV
        yield csvMaker.makeCsvData(finalShopResultArray, globalColumns, targetpath);
        // show message
        dialogMaker.showmessage("info", "取得が終わりました");
    }
    catch (e) {
        // error
        if (e instanceof Error) {
            // error
            logger.error(e.message);
        }
    }
}));
// CSV
electron_1.ipcMain.on("csv", (event, _) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info("ipc: csv mode");
        // get CSV data
        const result = yield csvMaker.getCsvDataDialog();
        // send result list
        event.sender.send("shopinfoCsvlist", result);
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
electron_1.ipcMain.on("pause", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info("ipc: pause mode");
        // show question dialog
        const selected = dialogMaker.showQuetion('質問', '停止', '停止してよろしいですか？これまでのデータはCSVに書き出されます。');
        // yes
        if (selected == 0) {
            // nowtime
            const nowtime = `${dir_desktop}\\${new Date()
                .toISOString()
                .replace(/[^\d]/g, "")
                .slice(0, 14)}`;
            // csv file name
            const targetpath = `${nowtime}.csv`;
            // write to CSV
            yield csvMaker.makeCsvData(finalShopResultArray, globalColumns, targetpath);
            // pause message
            dialogMaker.showmessage("info", "処理を中断しました");
            // close
            electron_1.app.quit();
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
electron_1.ipcMain.on("exit", () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info("ipc: exit mode");
        // show question dialog
        const selected = dialogMaker.showQuetion('質問', '終了', '終了してよろしいですか？これまでのデータは破棄されます。');
        // yes
        if (selected == 0) {
            // exit app
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
}));
// do scraping
const doScrape = (info) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // data exists
            let existFlg = false;
            // shop data
            let tmpShopObj;
            // final selector
            let finalSelectors;
            // wait for 1 sec
            yield puppScraper.doWaitFor(1000);
            // searchbox exists
            if (yield puppScraper.doCheckSelector(pageSearchBoxSelectorA)) {
                logger.info(`searching for ${info}`);
                // wait for 3 sec
                yield puppScraper.doWaitSelector(pageSearchBoxSelectorA, 3000);
                // type seach word
                yield puppScraper.doType(pageSearchBoxSelectorA, info);
                // press enter
                yield puppScraper.pressEnter();
                // wait for 1 sec
                yield puppScraper.doWaitFor(2000);
                // selector exists
                if (yield puppScraper.doCheckSelector(".wPNfjb")) {
                    // mode check
                    if (yield puppScraper.doCheckSelector(shopstatusSelectorD)) {
                        logger.info("scraping: D mode");
                        finalSelectors = googleSelectorsD;
                    }
                    else {
                        logger.info("scraping: A mode");
                        finalSelectors = googleSelectorsA;
                    }
                }
                else {
                    // mode check
                    if (yield puppScraper.doCheckSelector(shopstatusSelectorC)) {
                        logger.info("scraping: C mode");
                        finalSelectors = googleSelectorsC;
                    }
                    else {
                        logger.info("scraping: B mode");
                        finalSelectors = googleSelectorsB;
                    }
                }
                // wait for 0.1 sec
                yield puppScraper.doWaitFor(100);
                // shopname
                const shopname = yield goScrape(finalSelectors.shopname);
                // no shopname
                if (shopname == "") {
                    logger.info("no shopname found");
                }
                else {
                    logger.info(`shopname is ${shopname}`);
                    // wait for 0.1 sec
                    yield puppScraper.doWaitFor(100);
                    existFlg = true;
                }
                // status
                const status = yield goScrape(finalSelectors.status);
                // no status
                if (status == "") {
                    logger.info("no status found");
                }
                else {
                    logger.info(`status is ${status}`);
                    // wait for 0.1 sec
                    yield puppScraper.doWaitFor(100);
                    existFlg = true;
                }
                // address
                const address = yield goScrape(finalSelectors.address);
                // no address
                if (address == "") {
                    logger.info("no address found");
                }
                else {
                    logger.info(`address is ${address}`);
                    // wait for 0.1 sec
                    yield puppScraper.doWaitFor(100);
                    existFlg = true;
                }
                // telephone
                const telephone = yield goScrape(finalSelectors.telephone);
                // no telephone
                if (telephone == "") {
                    logger.info("no telephone found");
                }
                else {
                    logger.info(`telephone is ${telephone}`);
                    // wait for 0.1 sec
                    yield puppScraper.doWaitFor(100);
                    existFlg = true;
                }
                // review
                const review = yield goScrape(finalSelectors.review);
                // no review
                if (review == "") {
                    logger.info("no review found");
                }
                else {
                    logger.info(`review is ${review}`);
                    // wait for 0.1 sec
                    yield puppScraper.doWaitFor(100);
                    existFlg = true;
                }
                // comment
                const comment = yield goScrape(finalSelectors.comment);
                //  no comment
                if (comment == "") {
                    logger.info("no comment found");
                }
                else {
                    logger.info(`comment is ${comment}`);
                    // wait for 0.1 sec
                    yield puppScraper.doWaitFor(100);
                    existFlg = true;
                }
                // genre
                const genre = yield goScrape(finalSelectors.genre);
                // no genre
                if (genre == "") {
                    logger.info("no genre found");
                }
                else {
                    logger.info(`genre is ${genre}`);
                    // wait for 0.1 sec
                    yield puppScraper.doWaitFor(100);
                    existFlg = true;
                }
                // site exists
                if (existFlg) {
                    // shop data
                    tmpShopObj = {
                        検索ワード: info,
                        店舗名: shopname,
                        状態: status,
                        住所: address,
                        店舗電話: telephone,
                        ジャンル: genre,
                        レビュー: review,
                        口コミ: comment,
                    };
                    // return shop data
                    resolve(tmpShopObj);
                }
                else {
                    logger.debug(`error`);
                    // error
                    reject("");
                }
            }
        }
        catch (e) {
            // empty shop data
            const emptyErrObj = {
                検索ワード: info,
                店舗名: "",
                状態: "",
                住所: "",
                店舗電話: "",
                ジャンル: "",
                レビュー: "",
                口コミ: "",
            };
            // push into array
            finalShopResultArray.push(emptyErrObj);
            // return data
            resolve(emptyErrObj);
        }
    }));
});
// go scraping
const goScrape = (selector) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, _) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // url exists
            if (yield puppScraper.doCheckSelector(selector)) {
                // wait for selector
                yield puppScraper.doWaitSelector(selector, 10000);
                // got value
                const tmpValues = yield puppScraper.doSingleEval(selector, "innerHTML");
                // result
                const tmpResult = tmpValues.trim();
                // return result
                resolve(tmpResult);
            }
            else {
                // error
                logger.debug("no selector");
                resolve("");
            }
        }
        catch (e) {
            // error
            if (e instanceof Error) {
                // error
                logger.error(e.message);
            }
            resolve("");
        }
    }));
});
