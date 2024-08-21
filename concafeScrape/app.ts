/*
 * app.ts
 *
 * function：Node.js server
 **/

// import global interface
import { } from "../@types/globalobj";

// import modules
import { Scrape } from "../class/myScraper0215"; // scraper

// scraper
const puppScraper = new Scrape();

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
            console.log(url);

            // goto page
            await puppScraper.doGo(url);
            // wait for navigation
            await puppScraper.doWaitNav();

            // wait for datalist
            await puppScraper.doWaitSelector(".current-item", 10000);
            // title
            const shopname: string = await puppScraper.doSingleEval(
                ".current-item",
                "innerHTML"
            );
            // wait for datalist
            await puppScraper.doWaitSelector("tbody.jsx-1795147722 tr:first-child td a", 10000);
            // telephone
            const telephone: string = await puppScraper.doSingleEval(
                "tbody.jsx-1795147722 tr:first-child td a",
                "innerHTML"
            );
            // wait for datalist
            await puppScraper.doWaitSelector("tbody.jsx-1795147722 tr:nth-child(3) td", 10000);
            // businesstime
            const businesstime: string = await puppScraper.doSingleEval(
                "tbody.jsx-1795147722 tr:nth-child(3) td",
                "innerHTML"
            );
            // wait for datalist
            await puppScraper.doWaitSelector("tbody.jsx-1795147722 tr:nth-child(4) td", 10000);
            // holiday
            const holiday: string = await puppScraper.doSingleEval(
                "tbody.jsx-1795147722 tr:nth-child(4) td",
                "innerHTML"
            );
            // wait for datalist
            await puppScraper.doWaitSelector(".map_label p", 10000);
            // shopaddress
            const shopaddress: string = await puppScraper.doSingleEval(
                ".map_label p",
                "innerHTML"
            );

            // wait for datalist
            await puppScraper.doWaitSelector("tbody.jsx-1795147722 tr:nth-child(10) td a", 10000);
            // homepage
            const homepage: string = await puppScraper.doSingleEval(
                "tbody.jsx-1795147722 tr:nth-child(10) td a",
                "innerHTML"
            );

            // close page
            await puppScraper.doClose();
            // wait for datalist
            /*
            await puppScraper.doWaitSelector("tbody.jsx-1795147722 tr:nth-child(12) td", 10000);
            // ztwitter
            const sns: string = await puppScraper.doSingleEval(
                "tbody.jsx-1795147722 tr:nth-child(12) td",
                "innerHTML"
            );
            console.log(`sns: ${sns}`);
            */

            // shop data
            const shopdata: shopdataObj = {
                shopname: shopname,
                telephone: telephone,
                businesstime: businesstime,
                holiday: holiday,
                shopaddress: shopaddress,
                homepage: homepage,
                //sns: sns,
            }
            // resolved
            resolve(shopdata);

            // set into array
        } catch (e) {
            console.log(e);
            reject(e);
        }
    });
}

(async () => {
    // initialize
    let counter = 0
    for (let url of url5) {
        try {
            if (counter > 5) {
                counter = 0;
            }
            await puppScraper.init(1);
            const result: any = await doScrape(url);
            console.log(result);
            counter++;

        } catch (e) {
            console.log(e);

        } finally {

        }
    }
})();

/*
(async () => {
    const allresult: any = await Promise.all(
        testurls.map((url: any): Promise<any> => {
            return new Promise(async (resolve, reject) => {
                try {
                    const result: any = await doScrape(url);
                    resolve(result);

                } catch (e: unknown) {
                    console.log(e);
                    reject(e);
                }

            })
        })
    );
    console.log(allresult);
})();
*/