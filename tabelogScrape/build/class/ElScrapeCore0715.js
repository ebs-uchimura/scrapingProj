/**
 * ElScrape.ts
 *
 * class：ElScrape
 * function：scraping site
 * updated: 2025/06/16
 **/
'use strict';
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
var _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scrape = void 0;
// constants
const USER_ROOT_PATH = (_a = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"]) !== null && _a !== void 0 ? _a : ''; // user path
const CHROME_EXEC_PATH1 = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'; // chrome.exe path1
const CHROME_EXEC_PATH2 = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; // chrome.exe path2
const CHROME_EXEC_PATH3 = '\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe'; // chrome.exe path3
const DEF_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36"; // useragent
// define modules
const fs = __importStar(require("node:fs")); // fs
const path = __importStar(require("node:path")); // path
const promises_1 = require("node:timers/promises"); // wait for seconds
const puppeteer_core_1 = __importDefault(require("puppeteer-core")); // Puppeteer for scraping
// class
class Scrape {
    // constractor
    constructor(logger) {
        // loggeer instance
        _b.logger = logger;
        // result
        this._result = false;
        // height
        this._height = 0;
        _b.logger.debug('scrape: constructed');
    }
    // initialize
    init() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _b.logger.debug('scrape: initialize mode.');
                const puppOptions = {
                    headless: true, // no display mode
                    executablePath: getChromePath(), // chrome.exe path
                    ignoreDefaultArgs: [], // ignore extensions
                    args: [], // args
                };
                // lauch browser
                _b.browser = yield puppeteer_core_1.default.launch(puppOptions);
                // get all tabs
                _b.page = (yield _b.browser.pages())[0];
                // set viewport
                _b.page.setViewport({
                    width: 1920,
                    height: 1000,
                });
                // mimic agent
                yield _b.page.setUserAgent(DEF_USER_AGENT);
                _b.logger.debug('scrape: initialize finished.');
                // resolved
                resolve();
            }
            catch (e) {
                _b.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // get page url
    getUrl() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _b.logger.debug('scrape: getUrl mode.');
                // resolved
                resolve(yield _b.page.url());
            }
            catch (e) {
                _b.logger.error(e);
                // reject
                reject('error');
            }
        }));
    }
    // get page title
    getTitle() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _b.logger.debug('scrape: getTitle mode.');
                // resolved
                resolve(yield _b.page.title);
            }
            catch (e) {
                _b.logger.error(e);
                // reject
                reject('error');
            }
        }));
    }
    // get a href
    getHref(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _b.logger.debug('scrape: getHref mode.');
                // resolved
                resolve(yield _b.page.$eval(elem, (elm) => elm.href));
            }
            catch (e) {
                _b.logger.error(e);
                // reject
                reject('error');
            }
        }));
    }
    // press enter
    pressEnter() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _b.logger.debug('scrape: pressEnter mode.');
                // press enter key
                yield _b.page.keyboard.press('Enter');
                // resolved
                resolve();
            }
            catch (e) {
                _b.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // go page
    doGo(targetPage) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _b.logger.debug('scrape: doGo mode.');
                // goto target page
                yield _b.page.goto(targetPage);
                // get page height
                const height = yield _b.page.evaluate(() => {
                    return document.body.scrollHeight;
                });
                // body height
                this._height = height;
                // resolved
                resolve();
            }
            catch (e) {
                //Scrape.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // goback
    doGoBack() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _b.logger.debug('scrape: doGoBack mode.');
                // go back
                yield _b.page.goBack();
                // resolved
                resolve();
            }
            catch (e) {
                _b.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // click
    doClick(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _b.logger.debug('scrape: doClick mode.');
                // click target element
                yield _b.page.$$eval(elem, (elements) => elements[0].click());
                // resolved
                resolve();
            }
            catch (e) {
                _b.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // type
    doType(elem, value) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _b.logger.debug('scrape: doType mode.');
                // type element on specified value
                yield _b.page.type(elem, value, { delay: 100 });
                // resolved
                resolve();
            }
            catch (e) {
                _b.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // clear
    doClear(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _b.logger.debug('scrape: doClear mode.');
                // clear the textbox
                yield _b.page.$eval(elem, (element) => (element.value = ''));
                // resolved
                resolve();
            }
            catch (e) {
                _b.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // select
    doSelect(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _b.logger.debug('scrape: doSelect mode.');
                // select dropdown element
                yield _b.page.select(elem);
                // resolved
                resolve();
            }
            catch (e) {
                _b.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // screenshot
    doScreenshot(path) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _b.logger.debug('scrape: doScreenshot mode.');
                // take screenshot of window
                yield _b.page.screenshot({ path: path });
                // resolved
                resolve();
            }
            catch (e) {
                _b.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // mouse wheel
    mouseWheel() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _b.logger.debug('scrape: mouseWheel mode.');
                // mouse wheel to bottom
                yield _b.page.mouse.wheel({ deltaY: this._height - 200 });
                // resolved
                resolve();
            }
            catch (e) {
                _b.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // eval
    doSingleEval(selector, property) {
        return new Promise((resolve, _) => __awaiter(this, void 0, void 0, function* () {
            try {
                //Scrape.logger.debug('scrape: doSingleEval mode.');
                // target item
                const exists = yield _b.page.$eval(selector, () => true).catch(() => false);
                // no result
                if (!exists) {
                    //Scrape.logger.debug('not exists');
                    resolve('');
                }
                else {
                    // target value
                    const item = yield _b.page.$(selector);
                    // if not null
                    if (item !== null) {
                        // got data
                        const data = yield (yield item.getProperty(property)).jsonValue();
                        // if got data not null
                        if (data) {
                            // resolved
                            resolve(data);
                        }
                        else {
                            resolve('');
                        }
                    }
                    else {
                        resolve('');
                    }
                }
            }
            catch (e) {
                _b.logger.error(e);
                resolve('error');
            }
        }));
    }
    // eval
    doMultiEval(selector, property) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                //Scrape.logger.debug('scrape: doMultiEval mode.');
                // data set
                let datas = [];
                // target list
                const list = yield _b.page.$$(selector);
                // result
                const result = yield _b.page.$(selector).then((res) => !!res);
                // if element exists
                if (result) {
                    // loop in list
                    for (const ls of list) {
                        // push to data set
                        datas.push(yield (yield ls.getProperty(property)).jsonValue());
                    }
                    // resolved
                    resolve(datas);
                }
                else {
                    // reject
                    reject('error');
                }
            }
            catch (e) {
                _b.logger.error(e);
                // reject
                reject('error');
            }
        }));
    }
    // waitSelector
    doWaitFor(time) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                //Scrape.logger.debug('scrape: doWaitFor mode.');
                // wait for time
                yield (0, promises_1.setTimeout)(time);
                resolve();
            }
            catch (e) {
                _b.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // check Selector
    doCheckSelector(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                //Scrape.logger.debug('scrape: doCheckSelector mode.');
                // target item
                const exists = yield _b.page.$eval(elem, () => true).catch(() => false);
                // return true/false
                resolve(exists);
            }
            catch (e) {
                _b.logger.error(e);
                // reject
                reject(false);
            }
        }));
    }
    // close window
    doClose() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                _b.logger.debug('scrape: doClose mode.');
                // close page
                yield _b.page.close();
                // disconnect browser
                yield _b.browser.disconnect();
                // close browser
                yield _b.browser.close();
                // kill process
                (_a = _b.browser.process()) === null || _a === void 0 ? void 0 : _a.kill(9);
            }
            catch (e) {
                _b.logger.error(e);
                // reject
                reject();
            }
            finally {
                // resolved
                yield _b.closeBrowser(_b.page, _b.browser);
                _b.logger.debug('Browser closed successfully.');
                // resolve
                resolve();
            }
        }));
    }
    // reload
    doReload() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _b.logger.debug('scrape: doReload mode.');
                // close browser
                yield _b.page.reload();
                // resolved
                resolve();
            }
            catch (e) {
                _b.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // set result
    set setSucceed(selector) {
        // Do something with val that takes time
        this._result = _b.page.$(selector).then((res) => !!res);
    }
    // get result
    get getSucceed() {
        return this._result;
    }
}
exports.Scrape = Scrape;
_b = Scrape;
Scrape.closeBrowser = (page, browser) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    yield page.close(); // ページを閉じる
    yield browser.disconnect(); // 接続を解除
    yield browser.close(); // ブラウザを閉じる
    (_a = browser.process()) === null || _a === void 0 ? void 0 : _a.kill(9); // プロセスを強制終了
});
// get chrome absolute path
const getChromePath = () => {
    // chrome tmp path
    const tmpPath = path.join(USER_ROOT_PATH, CHROME_EXEC_PATH3);
    // 32bit
    if (fs.existsSync(CHROME_EXEC_PATH1)) {
        return CHROME_EXEC_PATH1 !== null && CHROME_EXEC_PATH1 !== void 0 ? CHROME_EXEC_PATH1 : '';
        // 64bit
    }
    else if (fs.existsSync(CHROME_EXEC_PATH2)) {
        return CHROME_EXEC_PATH2 !== null && CHROME_EXEC_PATH2 !== void 0 ? CHROME_EXEC_PATH2 : '';
        // user path
    }
    else if (fs.existsSync(tmpPath)) {
        return tmpPath !== null && tmpPath !== void 0 ? tmpPath : '';
        // error
    }
    else {
        // error logging
        console.log('16: no chrome path error');
        return '';
    }
};
