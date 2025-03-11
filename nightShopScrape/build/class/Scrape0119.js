"use strict";
/**
 * Scrape.ts
 *
 * class：Scrape
 * function：scraping site
 * updated: 2025/01/19
 **/
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
const ALLOW_INSECURE = "--allow-running-insecure-content"; // allow insecure content
const IGNORE_CERT_ERROR = "--ignore-certificate-errors"; // ignore cert-errors
const NO_SANDBOX = "--no-sandbox"; // no sandbox
const DISABLE_SANDBOX = "--disable-setuid-sandbox"; // no setup sandbox
const DISABLE_DEV_SHM = "--disable-dev-shm-usage"; // no dev shm
const DISABLE_GPU = "--disable-gpu"; // no gpu
const NO_FIRST_RUN = "--no-first-run"; // no first run
const NO_ZYGOTE = "--no-zygote"; // no zygote
const MAX_SCREENSIZE = "--start-maximized"; // max screen
const DEF_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36"; // useragent
// define modules
const promises_1 = require("node:timers/promises"); // wait for seconds
const puppeteer_1 = __importDefault(require("puppeteer")); // Puppeteer for scraping
// class
class Scrape {
    // constractor
    constructor() {
        // result
        this._result = false;
        // height
        this._height = 0;
    }
    // initialize
    init() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                const puppOptions = {
                    headless: false, // no display mode
                    ignoreDefaultArgs: [DISABLE_EXTENSIONS], // ignore extensions
                    args: [
                        NO_SANDBOX,
                        DISABLE_SANDBOX,
                        DISABLE_DEV_SHM,
                        DISABLE_GPU,
                        NO_FIRST_RUN,
                        NO_ZYGOTE,
                        ALLOW_INSECURE,
                        IGNORE_CERT_ERROR,
                        MAX_SCREENSIZE,
                    ], // args
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
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`init: ${e.message}`);
                    // reject
                    reject();
                }
            }
        }));
    }
    // get page url
    getUrl() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // resolved
                resolve(yield Scrape.page.url());
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`getTitle: ${e.message}`);
                    // reject
                    reject(e.message);
                }
            }
        }));
    }
    // get page title
    getTitle() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // resolved
                resolve(yield Scrape.page.title);
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`getTitle: ${e.message}`);
                    // reject
                    reject(e.message);
                }
            }
        }));
    }
    // get a href
    getHref(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // resolved
                resolve(yield Scrape.page.$eval(elem, (elm) => elm.href));
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`getHref: ${e.message}`);
                    // reject
                    reject(e.message);
                }
            }
        }));
    }
    // press enter
    pressEnter() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // press enter key
                yield Scrape.page.keyboard.press("Enter");
                // resolved
                resolve();
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`pressEnter: ${e.message}`);
                    // reject
                    reject();
                }
            }
        }));
    }
    // go page
    doGo(targetPage) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
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
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`doGo: ${e.message}`);
                    // reject
                    reject();
                }
            }
        }));
    }
    // goback
    doGoBack() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // go back
                yield Scrape.page.goBack();
                // resolved
                resolve();
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`doGoBack: ${e.message}`);
                    // reject
                    reject(e.message);
                }
            }
        }));
    }
    // click
    doClick(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // click target element
                yield Scrape.page.$$eval(elem, (elements) => elements[0].click());
                // resolved
                resolve();
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`doClick: ${e.message}`);
                    // reject
                    reject();
                }
            }
        }));
    }
    // type
    doType(elem, value) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // type element on specified value
                yield Scrape.page.type(elem, value, { delay: 100 });
                // resolved
                resolve();
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`doType: ${e.message}`);
                    // reject
                    reject();
                }
            }
        }));
    }
    // clear
    doClear(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // clear the textbox
                yield Scrape.page.$eval(elem, (element) => (element.value = ""));
                // resolved
                resolve();
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`doClear: ${e.message}`);
                    // reject
                    reject();
                }
            }
        }));
    }
    // select
    doSelect(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // select dropdown element
                yield Scrape.page.select(elem);
                // resolved
                resolve();
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`doSelect: ${e.message}`);
                    // reject
                    reject();
                }
            }
        }));
    }
    // screenshot
    doScreenshot(path) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // take screenshot of window
                yield Scrape.page.screenshot({ path: path });
                // resolved
                resolve();
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`doScreenshot: ${e.message}`);
                    // reject
                    reject();
                }
            }
        }));
    }
    // mouse wheel
    mouseWheel() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // mouse wheel to bottom
                yield Scrape.page.mouse.wheel({ deltaY: this._height - 200 });
                // resolved
                resolve();
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`mouseWheel: ${e.message}`);
                    // reject
                    reject();
                }
            }
        }));
    }
    // eval
    doSingleEval(selector, property) {
        return new Promise((resolve, _) => __awaiter(this, void 0, void 0, function* () {
            try {
                // target item
                const exists = yield Scrape.page.$eval(selector, () => true).catch(() => false);
                // no result
                if (!exists) {
                    console.log("not exists");
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
                            console.log("nodata error");
                            resolve('');
                        }
                    }
                    else {
                        console.log("target null");
                        resolve('');
                    }
                }
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`doSingleEval: ${e.message}`);
                }
                resolve('');
            }
        }));
    }
    // eval
    doMultiEval(selector, property) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
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
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`doMultiEval: ${e.message}`);
                    // reject
                    reject(e.message);
                }
            }
        }));
    }
    // waitSelector
    doWaitFor(time) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // wait for time
                yield (0, promises_1.setTimeout)(time);
                resolve();
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`doWaitFor: ${e.message}`);
                    // reject
                    reject();
                }
            }
        }));
    }
    // waitSelector
    doWaitSelector(elem, time) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
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
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`doWaitSelector: ${e.message}`);
                    // reject
                    reject();
                }
            }
        }));
    }
    // wait for navigaion
    doWaitForNav(time) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // wait for time
                yield Scrape.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: time });
                resolve();
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`doWaitForNav: ${e.message}`);
                    // reject
                    reject();
                }
            }
        }));
    }
    // check Selector
    doCheckSelector(elem) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // target item
                const exists = yield Scrape.page.$eval(elem, () => true).catch(() => false);
                // return true/false
                resolve(exists);
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`doCheckSelector: ${e.message}`);
                    // reject
                    reject(false);
                }
            }
        }));
    }
    // close window
    doClose() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // close browser
                yield Scrape.browser.close();
                // close page
                yield Scrape.page.close();
                // resolved
                resolve();
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`doClose: ${e.message}`);
                    // reject
                    reject();
                }
            }
        }));
    }
    // reload
    doReload() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                // close browser
                yield Scrape.page.reload();
                // resolved
                resolve();
            }
            catch (e) {
                // if type is error
                if (e instanceof Error) {
                    // error
                    console.log(`doReload: ${e.message}`);
                    // reject
                    reject();
                }
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
