/**
 * ELScrape.ts
 *
 * name：ELScrape
 * function：scraping site for electron
 * updated: 2025/03/10
 **/
"use strict";
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
const DISABLE_EXTENSIONS = "--disable-extensions"; // disable extension
const DEF_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36"; // useragent
// define modules
const promises_1 = require("node:timers/promises"); // wait for seconds
const puppeteer_1 = __importDefault(require("puppeteer")); // Puppeteer for scraping
// class
class Scrape {
    // constractor
    constructor(logger) {
        // result
        this._result = false;
        // height
        this._height = 0;
        // logger setting
        Scrape.logger = logger;
        Scrape.logger.info("scrape: constructed.");
    }
    // initialize
    init() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                Scrape.logger.info("scrape: initialize started.");
                // pupp options
                const puppOptions = {
                    headless: false, // no display mode
                    ignoreDefaultArgs: [DISABLE_EXTENSIONS], // ignore extensions
                    args: [], // args
                };
                // lauch browser
                Scrape.browser = yield puppeteer_1.default.launch(puppOptions);
                // create new page
                Scrape.page = yield Scrape.browser.newPage();
                // set viewport
                Scrape.page.setViewport({
                    width: 1920,
                    height: 1000,
                });
                // mimic agent
                yield Scrape.page.setUserAgent(DEF_USER_AGENT);
                // resolved
                resolve();
                Scrape.logger.info("scrape: initialize end.");
            }
            catch (e) {
                // error
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
                //Scrape.logger.info("scrape: getUrl start.");
                // resolved
                resolve(yield Scrape.page.url());
                //Scrape.logger.info("scrape: getUrl end.");
            }
            catch (e) {
                // error
                Scrape.logger.error(e);
                // reject
                reject("error");
            }
        }));
    }
    // get page title
    getTitle() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                //Scrape.logger.info("scrape: getTitle start.");
                // resolved
                resolve(yield Scrape.page.title);
                //Scrape.logger.info("scrape: getTitle end.");
            }
            catch (e) {
                // error
                Scrape.logger.error(e);
                // reject
                reject("error");
            }
        }));
    }
    // get a href
    getHref(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                //Scrape.logger.info("scrape: getHref start.");
                // resolved
                resolve(yield Scrape.page.$eval(elem, (elm) => elm.href));
                //Scrape.logger.info("scrape: getHref end.");
            }
            catch (e) {
                // error
                Scrape.logger.error(e);
                // reject
                reject("error");
            }
        }));
    }
    // press enter
    pressEnter() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                //Scrape.logger.info("scrape: pressEnter start.");
                // press enter key
                yield Scrape.page.keyboard.press("Enter");
                //Scrape.logger.info("scrape: pressEnter end.");
                // resolved
                resolve();
            }
            catch (e) {
                // error
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
                //Scrape.logger.info("scrape: doGo start.");
                // goto target page
                yield Scrape.page.goto(targetPage);
                // get page height
                const height = yield Scrape.page.evaluate(() => {
                    return document.body.scrollHeight;
                });
                // body height
                this._height = height;
                // resolved
                resolve();
                //Scrape.logger.info("scrape: doGo end.");
            }
            catch (e) {
                // error
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
                //Scrape.logger.info("scrape: doGoBack start.");
                // go back
                yield Scrape.page.goBack();
                // resolved
                resolve();
                //Scrape.logger.info("scrape: doGoBack end.");
            }
            catch (e) {
                // error
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
                //Scrape.logger.info("scrape: doClick start.");
                // click target element
                yield Scrape.page.$$eval(elem, (elements) => elements[0].click());
                // resolved
                resolve();
                //Scrape.logger.info("scrape: doClick end.");
            }
            catch (e) {
                // error
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
                //Scrape.logger.info("scrape: doType start.");
                // type element on specified value
                yield Scrape.page.type(elem, value, { delay: 100 });
                // resolved
                resolve();
                //Scrape.logger.info("scrape: doType end.");
            }
            catch (e) {
                // error
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
                //Scrape.logger.info("scrape: doClear start.");
                // clear the textbox
                yield Scrape.page.$eval(elem, (element) => (element.value = ""));
                // resolved
                resolve();
                //Scrape.logger.info("scrape: doClear end.");
            }
            catch (e) {
                // error
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
                //Scrape.logger.info("scrape: doSelect start.");
                // select dropdown element
                yield Scrape.page.select(elem);
                // resolved
                resolve();
                //Scrape.logger.info("scrape: doSelect end.");
            }
            catch (e) {
                // error
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
                //Scrape.logger.info("scrape: doScreenshot start.");
                // take screenshot of window
                yield Scrape.page.screenshot({ path: path });
                // resolved
                resolve();
                //Scrape.logger.info("scrape: doScreenshot end.");
            }
            catch (e) {
                // error
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
                //Scrape.logger.info("scrape: mouseWheel start.");
                // mouse wheel to bottom
                yield Scrape.page.mouse.wheel({ deltaY: this._height - 200 });
                // resolved
                resolve();
                //Scrape.logger.info("scrape: mouseWheel end.");
            }
            catch (e) {
                // error
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
                //Scrape.logger.info("scrape: doSingleEval start.");
                // target item
                const exists = yield Scrape.page
                    .$eval(selector, () => true)
                    .catch(() => false);
                // no result
                if (!exists) {
                    Scrape.logger.info("scrape: not exists");
                    resolve("");
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
                            //Scrape.logger.debug("scrape: nodata error");
                            resolve("");
                        }
                    }
                    else {
                        //Scrape.logger.debug("scrape: target null");
                        resolve("");
                    }
                    //Scrape.logger.info("scrape: doSingleEval end.");
                }
            }
            catch (e) {
                // error
                Scrape.logger.error(e);
                resolve("error");
            }
        }));
    }
    // eval
    doMultiEval(selector, property) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                //Scrape.logger.info("scrape: doMultiEval start.");
                // data set
                let datas = [];
                // target list
                const list = yield Scrape.page.$$(selector);
                // result
                const result = yield Scrape.page
                    .$(selector)
                    .then((res) => !!res);
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
                //Scrape.logger.info("scrape: doMultiEval end.");
            }
            catch (e) {
                // error
                Scrape.logger.error(e);
                reject("error");
            }
        }));
    }
    // waitSelector
    doWaitFor(time) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                //Scrape.logger.info("scrape: doWaitFor start.");
                // wait for time
                yield (0, promises_1.setTimeout)(time);
                resolve();
                //Scrape.logger.info("scrape: doWaitFor end.");
            }
            catch (e) {
                // error
                Scrape.logger.error(e);
                reject();
            }
        }));
    }
    // waitSelector
    doWaitSelector(elem, time) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                //Scrape.logger.info("scrape: doWaitSelector start.");
                // target item
                const exists = yield Scrape.page
                    .$eval(elem, () => true)
                    .catch(() => false);
                // if element exists
                if (exists) {
                    // wait for loading selector
                    yield Scrape.page.waitForSelector(elem, { timeout: time });
                    // resolved
                    resolve();
                }
                //Scrape.logger.info("scrape: doWaitSelector end.");
            }
            catch (e) {
                // error
                Scrape.logger.error(e);
                reject();
            }
        }));
    }
    // wait for navigaion
    doWaitForNav(time) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                //Scrape.logger.info("scrape: doWaitForNav start.");
                // wait for time
                yield Scrape.page.waitForNavigation({
                    waitUntil: "networkidle2",
                    timeout: time,
                });
                resolve();
                //Scrape.logger.info("scrape: doWaitForNav end.");
            }
            catch (e) {
                // error
                Scrape.logger.error(e);
                reject();
            }
        }));
    }
    // check Selector
    doCheckSelector(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                //Scrape.logger.info("scrape: doCheckSelector start.");
                // target item
                const exists = yield Scrape.page
                    .$eval(elem, () => true)
                    .catch(() => false);
                // return true/false
                resolve(exists);
                //Scrape.logger.info("scrape: doCheckSelector end.");
            }
            catch (e) {
                // error
                Scrape.logger.error(e);
                reject(false);
            }
        }));
    }
    // close window
    doClose() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                //Scrape.logger.info("scrape: doClose start.");
                // close browser
                yield Scrape.browser.close();
                // close page
                yield Scrape.page.close();
                // resolved
                resolve();
                //Scrape.logger.info("scrape: doClose end.");
            }
            catch (e) {
                // error
                Scrape.logger.error(e);
                reject();
            }
        }));
    }
    // reload
    doReload() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                //Scrape.logger.info("scrape: doReload start.");
                // close browser
                yield Scrape.page.reload();
                // resolved
                resolve();
                //Scrape.logger.info("scrape: doReload end.");
            }
            catch (e) {
                // error
                Scrape.logger.error(e);
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
