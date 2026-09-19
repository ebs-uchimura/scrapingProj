/*
 * concafe.ts
 *
 * function：Node.js server
 **/

// import modules
import * as path from "path"; // path
import { Scrape } from "./class/Scrape0119"; // scraper
import CSV from "./class/Csv1104"; // csv

// scraper
const puppScraper = new Scrape();
// csv
const csvMaker = new CSV('SJIS');

// root path
const dir_home =
    process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"] ?? "";
// desktop path
const dir_desktop = path.join(dir_home, "Desktop");

// urls
const url5: string[] = [
    'https://con-cafe.jp/list/area02/pre08/sub039/11480',
    'https://con-cafe.jp/list/area02/pre08/sub050/11484',
    'https://con-cafe.jp/list/area02/pre08/sub050/12032',
    'https://con-cafe.jp/list/area02/pre08/sub050/11338',
    'https://con-cafe.jp/list/area02/pre08/sub050/11679',
    'https://con-cafe.jp/list/area02/pre08/sub050/11899',
    'https://con-cafe.jp/list/area02/pre08/sub050/11904',
    'https://con-cafe.jp/list/area02/pre08/sub050/11956',
    'https://con-cafe.jp/list/area02/pre08/sub050/11968',
    'https://con-cafe.jp/list/area02/pre08/sub039/11795',
    'https://con-cafe.jp/list/area02/pre08/sub040/11900',
    'https://con-cafe.jp/list/area02/pre08/sub040/11990',
    'https://con-cafe.jp/list/area02/pre08/sub040/11220',
    'https://con-cafe.jp/list/area02/pre08/sub040/11424',
    'https://con-cafe.jp/list/area02/pre08/sub040/36217',
    'https://con-cafe.jp/list/area02/pre08/sub040/36256',
    'https://con-cafe.jp/list/area02/pre08/sub044/11607',
    'https://con-cafe.jp/list/area02/pre08/sub050/11852',
    'https://con-cafe.jp/list/area02/pre08/sub050/11978',
];

// do scraping
const doScrape = async (url: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            // goto page
            await puppScraper.doGo(url);
            // wait for navigation
            await puppScraper.doWaitFor(3000);
            // title
            const shopname: string = await puppScraper.doSingleEval(
                "#main_col > section:nth-child(3) > div > div > div.jsx-1795147722.row > div:nth-child(1) > div > h1",
                "innerHTML"
            );
            console.log(shopname);
            // wait for navigation
            await puppScraper.doWaitFor(500);
            // telephone
            const telephone: string = await puppScraper.doSingleEval(
                "#str-tab-top_content > table > tbody > tr:nth-child(1) > td > a",
                "innerHTML"
            );
            console.log(telephone);
            // wait for navigation
            await puppScraper.doWaitFor(500);
            // businesstime
            const businesstime: string = await puppScraper.doSingleEval(
                "#str-tab-top_content > table > tbody > tr:nth-child(3) > td",
                "innerHTML"
            );
            console.log(businesstime);
            // wait for navigation
            await puppScraper.doWaitFor(500);
            // holiday
            const holiday: string = await puppScraper.doSingleEval(
                "#str-tab-top_content > table > tbody > tr:nth-child(4) > td",
                "innerHTML"
            );
            console.log(holiday);
            // wait for navigation
            await puppScraper.doWaitFor(500);
            // shopaddress
            const shopaddress: string = await puppScraper.doSingleEval(
                "#main_contents > div.jsx-1795147722.map_label.p-3 > p",
                "innerHTML"
            );
            console.log(shopaddress);
            // wait for navigation
            await puppScraper.doWaitFor(500);
            // homepage
            const homepage: string = await puppScraper.doSingleEval(
                "#str-tab-top_content > table > tbody > tr:nth-child(10) > td > a",
                "innerHTML"
            );
            console.log(homepage);
            // close page
            await puppScraper.doClose();
            // shop data
            const shopdata: any = {
                shopname: shopname,
                telephone: telephone,
                businesstime: businesstime,
                holiday: holiday,
                shopaddress: shopaddress,
                homepage: homepage,
            }
            console.log(shopdata);
            // resolved
            resolve(shopdata);

            // set into array
        } catch (e: unknown) {
            // error
            if (e instanceof Error) {
                console.log(e.message);
            }
            reject('error');
        }
    });
}

(async () => {
    // initialize
    let counter: number = 0
    // last array
    let finalArray: any = [];
    // header
    const columns: { [key: string]: string } = {
        shopname: 'shopname', // shopname
        telephone: 'telephone', // telephone
        businesstime: 'businesstime', // businesstime
        holiday: 'holiday', // holiday
        shopaddress: 'shopaddress', // shopaddress
        homepage: 'homepage', // homepage
    };

    // loop for urls
    for (let url of url5) {
        try {
            // reset counter
            if (counter > 5) {
                counter = 0;
            }
            // initialze scraper
            await puppScraper.init();
            // get data
            const result: any = await doScrape(url);
            // set to array
            finalArray.push(result);
            counter++;

        } catch (e: unknown) {
            // error
            if (e instanceof Error) {
                console.log(e.message);
            }
        }
    }
    // CSVfile name
    const nowtime: string = `${dir_desktop}\\${new Date()
        .toISOString()
        .replace(/[^\d]/g, "")
        .slice(0, 14)}.csv`;
    // write data
    await csvMaker.makeCsvData(finalArray, columns, nowtime);
    // close scraper
    await puppScraper.doClose();
})();
