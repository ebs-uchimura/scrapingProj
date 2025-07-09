/**
 * ElScrape.ts
 *
 * class：ElScrape
 * function：scraping site
 * updated: 2025/05/31
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
        Scrape.logger = logger;
        // result
        this._result = false;
        // height
        this._height = 0;
        Scrape.logger.debug('scrape: constructed');
    }
    // initialize
    init() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.debug('scrape: initialize mode.');
                const puppOptions = {
                    headless: false, // no display mode
                    ignoreDefaultArgs: [DISABLE_EXTENSIONS], // ignore extensions
                    args: [], // args
                };
                // lauch browser
                Scrape.browser = yield puppeteer_1.default.launch(puppOptions);
                // get all tabs
                Scrape.page = (yield Scrape.browser.pages())[0];
                // set viewport
                Scrape.page.setViewport({
                    width: 1920,
                    height: 1000,
                });
                // mimic agent
                yield Scrape.page.setUserAgent(DEF_USER_AGENT);
                Scrape.logger.debug('scrape: initialize finished.');
                // resolved
                resolve();
            }
            catch (e) {
                Scrape.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // get page url
    getUrl() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.debug('scrape: getUrl mode.');
                // resolved
                resolve(yield Scrape.page.url());
            }
            catch (e) {
                Scrape.logger.error(e);
                // reject
                reject('error');
            }
        }));
    }
    // get page title
    getTitle() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.debug('scrape: getTitle mode.');
                // resolved
                resolve(yield Scrape.page.title);
            }
            catch (e) {
                Scrape.logger.error(e);
                // reject
                reject('error');
            }
        }));
    }
    // get a href
    getHref(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.debug('scrape: getHref mode.');
                // resolved
                resolve(yield Scrape.page.$eval(elem, (elm) => elm.href));
            }
            catch (e) {
                Scrape.logger.error(e);
                // reject
                reject('error');
            }
        }));
    }
    // press enter
    pressEnter() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.debug('scrape: pressEnter mode.');
                // press enter key
                yield Scrape.page.keyboard.press('Enter');
                // resolved
                resolve();
            }
            catch (e) {
                Scrape.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // go page
    doGo(targetPage) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.debug('scrape: doGo mode.');
                // goto target page
                Scrape.logger.debug(targetPage);
                yield Scrape.page.goto(targetPage);
                // get page height
                const height = yield Scrape.page.evaluate(() => {
                    return document.body.scrollHeight;
                });
                // body height
                this._height = height;
                // resolved
                resolve();
            }
            catch (e) {
                Scrape.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // goback
    doGoBack() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.debug('scrape: doGoBack mode.');
                // go back
                yield Scrape.page.goBack();
                // resolved
                resolve();
            }
            catch (e) {
                Scrape.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // click
    doClick(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.debug('scrape: doClick mode.');
                // click target element
                yield Scrape.page.$$eval(elem, (elements) => elements[0].click());
                // resolved
                resolve();
            }
            catch (e) {
                Scrape.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // type
    doType(elem, value) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.debug('scrape: doType mode.');
                // type element on specified value
                yield Scrape.page.type(elem, value, { delay: 100 });
                // resolved
                resolve();
            }
            catch (e) {
                Scrape.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // clear
    doClear(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.debug('scrape: doClear mode.');
                // clear the textbox
                yield Scrape.page.$eval(elem, (element) => (element.value = ''));
                // resolved
                resolve();
            }
            catch (e) {
                Scrape.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // select
    doSelect(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.debug('scrape: doSelect mode.');
                // select dropdown element
                yield Scrape.page.select(elem);
                // resolved
                resolve();
            }
            catch (e) {
                Scrape.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // screenshot
    doScreenshot(path) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.debug('scrape: doScreenshot mode.');
                // take screenshot of window
                yield Scrape.page.screenshot({ path: path });
                // resolved
                resolve();
            }
            catch (e) {
                Scrape.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // mouse wheel
    mouseWheel() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.debug('scrape: mouseWheel mode.');
                // mouse wheel to bottom
                yield Scrape.page.mouse.wheel({ deltaY: this._height - 200 });
                // resolved
                resolve();
            }
            catch (e) {
                Scrape.logger.error(e);
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
                const exists = yield Scrape.page.$eval(selector, () => true).catch(() => false);
                // no result
                if (!exists) {
                    Scrape.logger.debug('not exists');
                    resolve('');
                }
                else {
                    // target value
                    const item = yield Scrape.page.$(selector);
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
                Scrape.logger.error(e);
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
                const list = yield Scrape.page.$$(selector);
                // result
                const result = yield Scrape.page.$(selector).then((res) => !!res);
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
                Scrape.logger.error(e);
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
                Scrape.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // waitSelector
    doWaitSelector(elem, time) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.debug('scrape: doWaitSelector mode.');
                // target item
                const exists = yield Scrape.page.$eval(elem, () => true).catch(() => false);
                // if element exists
                if (exists) {
                    // wait for loading selector
                    yield Scrape.page.waitForSelector(elem, { timeout: time });
                    // resolved
                    resolve();
                }
            }
            catch (e) {
                Scrape.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // wait for navigaion
    doWaitForNav(time) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.debug('scrape: doWaitForNav mode.');
                // wait for time
                yield Scrape.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: time });
                resolve();
            }
            catch (e) {
                Scrape.logger.error(e);
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
                const exists = yield Scrape.page.$eval(elem, () => true).catch(() => false);
                // return true/false
                resolve(exists);
            }
            catch (e) {
                Scrape.logger.error(e);
                // reject
                reject(false);
            }
        }));
    }
    // close window
    doClose() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.debug('scrape: doClose mode.');
                // close browser
                yield Scrape.browser.close();
                // close page
                yield Scrape.page.close();
                // resolved
                resolve();
            }
            catch (e) {
                Scrape.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // reload
    doReload() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.debug('scrape: doReload mode.');
                // close browser
                yield Scrape.page.reload();
                // resolved
                resolve();
            }
            catch (e) {
                Scrape.logger.error(e);
                // reject
                reject();
            }
        }));
    }
    // set result
    set setSucceed(selector) {
        // Do something with val that takes time
        this._result = Scrape.page.$(selector).then((res) => !!res);
    }
    // get result
    get getSucceed() {
        return this._result;
    }
}
exports.Scrape = Scrape;
