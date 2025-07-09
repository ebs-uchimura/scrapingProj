/**
 * ElScrape.ts
 *
 * class：ElScrape
 * function：scraping site
 * updated: 2025/06/16
 **/
'use strict';
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
exports.Scrape = void 0;
const DISABLE_EXTENSIONS = '--disable-extensions'; // disable extension
const DEF_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36';
// define modules
const promises_1 = require("node:timers/promises"); // wait for seconds
const puppeteer_1 = __importDefault(require("puppeteer")); // Puppeteer for scraping
// class
class Scrape {
    // constractor
    constructor(logger) {
        // loggeer instance
        _a.logger = logger;
        // result
        this._result = false;
        // height
        this._height = 0;
        _a.logger.debug('scrape: constructed');
    }
    // initialize
    init() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _a.logger.debug('scrape: initialize mode.');
                const puppOptions = {
                    headless: true, // no display mode
                    ignoreDefaultArgs: [DISABLE_EXTENSIONS], // ignore extensions
                    args: [], // args
                };
                // lauch browser
                _a.browser = yield puppeteer_1.default.launch(puppOptions);
                // get all tabs
                _a.page = (yield _a.browser.pages())[0];
                // set viewport
                _a.page.setViewport({
                    width: 1920,
                    height: 1000,
                });
                // mimic agent
                yield _a.page.setUserAgent(DEF_USER_AGENT);
                _a.logger.debug('scrape: initialize finished.');
                // resolved
                resolve();
            }
            catch (e) {
                _a.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // get page url
    getUrl() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _a.logger.debug('scrape: getUrl mode.');
                // resolved
                resolve(yield _a.page.url());
            }
            catch (e) {
                _a.logger.error(e);
                // reject
                reject('error');
            }
        }));
    }
    // get page title
    getTitle() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _a.logger.debug('scrape: getTitle mode.');
                // resolved
                resolve(yield _a.page.title);
            }
            catch (e) {
                _a.logger.error(e);
                // reject
                reject('error');
            }
        }));
    }
    // get a href
    getHref(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _a.logger.debug('scrape: getHref mode.');
                // resolved
                resolve(yield _a.page.$eval(elem, (elm) => elm.href));
            }
            catch (e) {
                _a.logger.error(e);
                // reject
                reject('error');
            }
        }));
    }
    // press enter
    pressEnter() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _a.logger.debug('scrape: pressEnter mode.');
                // press enter key
                yield _a.page.keyboard.press('Enter');
                // resolved
                resolve();
            }
            catch (e) {
                _a.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // go page
    doGo(targetPage) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _a.logger.debug('scrape: doGo mode.');
                // goto target page
                _a.logger.debug(targetPage);
                yield _a.page.goto(targetPage);
                // get page height
                const height = yield _a.page.evaluate(() => {
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
                _a.logger.debug('scrape: doGoBack mode.');
                // go back
                yield _a.page.goBack();
                // resolved
                resolve();
            }
            catch (e) {
                _a.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // click
    doClick(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _a.logger.debug('scrape: doClick mode.');
                // click target element
                yield _a.page.$$eval(elem, (elements) => elements[0].click());
                // resolved
                resolve();
            }
            catch (e) {
                _a.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // type
    doType(elem, value) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _a.logger.debug('scrape: doType mode.');
                // type element on specified value
                yield _a.page.type(elem, value, { delay: 100 });
                // resolved
                resolve();
            }
            catch (e) {
                _a.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // clear
    doClear(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _a.logger.debug('scrape: doClear mode.');
                // clear the textbox
                yield _a.page.$eval(elem, (element) => (element.value = ''));
                // resolved
                resolve();
            }
            catch (e) {
                _a.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // select
    doSelect(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _a.logger.debug('scrape: doSelect mode.');
                // select dropdown element
                yield _a.page.select(elem);
                // resolved
                resolve();
            }
            catch (e) {
                _a.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // screenshot
    doScreenshot(path) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _a.logger.debug('scrape: doScreenshot mode.');
                // take screenshot of window
                yield _a.page.screenshot({ path: path });
                // resolved
                resolve();
            }
            catch (e) {
                _a.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // mouse wheel
    mouseWheel() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _a.logger.debug('scrape: mouseWheel mode.');
                // mouse wheel to bottom
                yield _a.page.mouse.wheel({ deltaY: this._height - 200 });
                // resolved
                resolve();
            }
            catch (e) {
                _a.logger.error(e);
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
                const exists = yield _a.page.$eval(selector, () => true).catch(() => false);
                // no result
                if (!exists) {
                    _a.logger.debug('not exists');
                    resolve('');
                }
                else {
                    // target value
                    const item = yield _a.page.$(selector);
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
                _a.logger.error(e);
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
                const list = yield _a.page.$$(selector);
                // result
                const result = yield _a.page.$(selector).then((res) => !!res);
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
                _a.logger.error(e);
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
                _a.logger.error(e);
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
                const exists = yield _a.page.$eval(elem, () => true).catch(() => false);
                // return true/false
                resolve(exists);
            }
            catch (e) {
                _a.logger.error(e);
                // reject
                reject(false);
            }
        }));
    }
    // close window
    doClose() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            var _b;
            try {
                _a.logger.debug('scrape: doClose mode.');
                // close page
                yield _a.page.close();
                // disconnect browser
                yield _a.browser.disconnect();
                // close browser
                yield _a.browser.close();
                // kill process
                (_b = _a.browser.process()) === null || _b === void 0 ? void 0 : _b.kill(9);
            }
            catch (e) {
                _a.logger.error(e);
                // reject
                reject();
            }
            finally {
                // resolved
                yield _a.closeBrowser(_a.page, _a.browser);
                _a.logger.debug('Browser closed successfully.');
                // resolve
                resolve();
            }
        }));
    }
    // reload
    doReload() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                _a.logger.debug('scrape: doReload mode.');
                // close browser
                yield _a.page.reload();
                // resolved
                resolve();
            }
            catch (e) {
                _a.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // set result
    set setSucceed(selector) {
        // Do something with val that takes time
        this._result = _a.page.$(selector).then((res) => !!res);
    }
    // get result
    get getSucceed() {
        return this._result;
    }
}
exports.Scrape = Scrape;
_a = Scrape;
Scrape.closeBrowser = (page, browser) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    yield page.close(); // ページを閉じる
    yield browser.disconnect(); // 接続を解除
    yield browser.close(); // ブラウザを閉じる
    (_b = browser.process()) === null || _b === void 0 ? void 0 : _b.kill(9); // プロセスを強制終了
});
