/*
 * night.ts
 *
 * function：scraping electron app
 **/

/// import modules
import { BrowserWindow, app, ipcMain, Tray, Menu, nativeImage } from 'electron'; // electron
import * as path from 'path'; // path
import { setTimeout } from 'node:timers/promises'; // sleep
import { Scrape } from "./class/Scrape0119"; // scraper
import Logger from "./class/Logger0928"; // logger
import Dialog from "./class/ElectronDialog0118"; // dialog
import CSV from "./class/ElectronCsv0119"; // csv

/// const
const PAGE_COUNT: number = 30; // shop pages
const TOTAL_COUNT: number = 2850; // total shops
const CSV_ENCODING: string = 'SJIS'; // CSV charcode
const LULINE_FIXED_URL: string = 'https://luline.jp/shop_list/all/search/'; // root url

/// config
// csv
const csvMaker: CSV = new CSV(CSV_ENCODING);
// logger
const logger: Logger = new Logger("../../logs");
// scraper
const puppScraper: Scrape = new Scrape();
// dialog
const dialogMaker: Dialog = new Dialog();
// desktop path
const dir_home = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'] ?? '';
const dir_desktop = path.join(dir_home, 'Desktop');

/// selector
// mainshopname selector
const LulineShopnameSelector: string = '#ankerMap > div > div > div > div > h5';
// mainshopname ruby selector
const LulineShopnameRubySelector: string = '#ankerMap > div > div > div > div > h6';
// genre selectors
const LulineGenreSelector: string = '#ankerMap > div > div > div > table > tbody > tr:nth-child(1) > td > a';
// area selector
const LulineAreaSelector: string = '#ankerMap > div > div > div > table > tbody > tr:nth-child(2) > td > a';
// businesstime selector
const LulineBusinesstimeSelector: string = '#ankerMap > div > div > div > table > tbody > tr:nth-child(3) > td';
// address selector
const LulineAddress1Selector: string = '#ankerMap > div > div > div > table > tbody > tr:nth-child(4) > td > a';
// address selector
const LulineAddress2Selector: string = '#ankerMap > div > div > div > table > tbody > tr:nth-child(5) > td > a';
// adjacent station selector
const LilineAdjacentStationSelector: string = '#ankerMap > div > div > div > table > tbody > tr:nth-child(6) > td';
// telephone selector
const LilineTelephoneSelector: string = '#ankerMap > div > div > div > table > tbody > tr:nth-child(7) > td';
// email selector
const LilineEmailSelector: string = '#ankerMap > div > div > div > table > tbody > tr:nth-child(8) > td';
// see more
const LilineSeemoreSelector: string = '#shopList > section > div.listViewWrap > div.moreViewBtn';
// all selectors
const LulineSelectors: any = {
    shopname: LulineShopnameSelector,
    shopnameruby: LulineShopnameRubySelector,
    genre: LulineGenreSelector,
    area: LulineAreaSelector,
    businesstime: LulineBusinesstimeSelector,
    address1: LulineAddress1Selector,
    address2: LulineAddress2Selector,
    station: LilineAdjacentStationSelector,
    telephone: LilineTelephoneSelector,
    mail: LilineEmailSelector,
};

// columns
const globalColumns: { [key: string]: string } = {
    shopname: 'shopname', // word
    shopnameruby: 'shopnameruby', // shopnameruby
    genre: 'genre', // genre
    area: 'area', // area
    businesstime: 'businesstime', // businesstime
    address1: 'address1', // address1
    address2: 'address2', // address2
    station: 'station', // station
    telephone: 'telephone', // telephone
    mail: 'mail', // mail
};

/*
 main
*/
// main window
let mainWindow: Electron.BrowserWindow;
// quit
let isQuiting: boolean;
// final csv array
let finalCsvArray: any = [];
// finalshop result
let finalResultArray: any = [];

// create window
const createWindow = (): void => {
    try {
        // window
        mainWindow = new BrowserWindow({
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
        mainWindow.on('minimize', (event: any): void => {
            // cancel
            event.preventDefault();
            // hide window
            mainWindow.hide();
            // return false
            event.returnValue = false;
        });

        // close
        mainWindow.on('close', (event: any): void => {
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
        mainWindow.on('closed', (): void => {
            // destroy window
            mainWindow.destroy();
        });

    } catch (e: unknown) {
        // error
        if (e instanceof Error) {
            // show error message
            logger.error(`${e.message})`);
        }
    }
}
// enable sandbox
app.enableSandbox();

// ready
app.on('ready', async () => {
    logger.info('app: electron is ready');
    // create window
    createWindow();
    // icon
    const icon: Electron.NativeImage = nativeImage.createFromPath(path.join(__dirname, '../assets/nightshop.ico'));
    // tray
    const mainTray: Electron.Tray = new Tray(icon);
    // context menu
    const contextMenu: Electron.Menu = Menu.buildFromTemplate([
        // show
        {
            label: 'show', click: () => {
                mainWindow.show();
            }
        },
        // close
        {
            label: 'close', click: () => {
                app.quit();
            }
        }
    ]);
    // set context menu
    mainTray.setContextMenu(contextMenu);
    // doubleclick
    mainTray.on('double-click', () => mainWindow.show());
});

// activate
app.on('activate', () => {
    // no window
    if (BrowserWindow.getAllWindows().length === 0) {
        // reboot
        createWindow();
    }
});

// close
app.on('before-quit', () => {
    logger.info('ipc: quit mode');
    // close flg
    isQuiting = true;
});

// exit
app.on('window-all-closed', () => {
    logger.info('app: close app');
    // exit app
    app.quit();
});

/*
 IPC
*/
/* page */
ipcMain.on('page', async (_, arg) => {
    try {
        logger.info('ipc: page mode');
        // url
        let url: string = '';

        // switch on page
        switch (arg) {
            // exit
            case 'exit_page':
                // except for apple
                if (process.platform !== 'darwin') {
                    // quit app
                    app.quit();
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
        await mainWindow.loadFile(path.join(__dirname, url));

    } catch (e: unknown) {
        // error
        if (e instanceof Error) {
            // error
            logger.error(e.message);
        }
    }
});

// csv
ipcMain.on('csv', async (event, _) => {
    try {
        logger.info('ipc: csv mode');
        // get csv data
        const result: any = await csvMaker.getCsvDataDialog();
        // send shop information
        event.sender.send('shopinfoCsvlist', result);

    } catch (e: unknown) {
        // error
        if (e instanceof Error) {
            // error
            logger.error(e.message);
        }
    }
});

// scrape
ipcMain.on('scrape', async (event: any, arg: any) => {
    try {
        logger.info('ipc: scrape mode');
        // success
        let successCounter: number = 0;
        // fail
        let failCounter: number = 0;
        // total
        let totalCounter: number = arg.length;
        // regex
        const regex: RegExp = new RegExp('(<([^>]+)>)', 'gi');
        // initialize scraper
        await puppScraper.init();
        // send total
        event.sender.send('total', totalCounter);

        // loop for urls
        for (let url of arg) {
            try {
                // shop data
                const myShopObj: any = {
                    shopname: '',
                    shopnameruby: '',
                    genre: '',
                    area: '',
                    businesstime: '',
                    address1: '',
                    address2: '',
                    station: '',
                    telephone: '',
                    mail: '',
                };
                // goto page
                await puppScraper.doGo(url);
                // wait for 5 sec
                await setTimeout(5 * 1000);
                logger.debug(`app: scraping ${url}`);

                // URL loop
                Object.keys(LulineSelectors).forEach(async (key: any) => {
                    try {
                        // result
                        let tmpResult: string = '';
                        // wait for 1 sec
                        await setTimeout(1 * 1000);
                        // result
                        const result: string = await doScrape(LulineSelectors[key]);

                        // if not empty
                        if (result != '') {
                            // tag exists
                            if (regex.test(result)) {
                                // set replaced result
                                tmpResult = result.replace(/(<([^>]+)>)/gi, '');

                            } else {
                                // set result
                                tmpResult = result;
                            }
                            // set to shopdata
                            myShopObj[`${key}`] = tmpResult;
                        }

                    } catch (error: unknown) {
                        // error
                        if (error instanceof Error) {
                            // error
                            logger.error(error.message);
                        }
                    }
                });
                // success counter
                successCounter++;
                // empty
                const isEmpty = Object.keys(myShopObj).length === 0 && myShopObj.constructor === Object;

                // empty
                if (!isEmpty) {
                    // push into shopdata
                    finalResultArray.push(myShopObj);
                }

            } catch (err: unknown) {
                // error
                if (err instanceof Error) {
                    // error
                    logger.error(err.message);
                    // fail counter
                    failCounter++;
                }

            } finally {
                // statusUpdate
                event.sender.send('statusUpdate', url);
                // success
                event.sender.send('success', successCounter);
                // fail
                event.sender.send('fail', failCounter);
            }
        }

        // now time
        const csvpath: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, '').slice(0, 14)}.csv`;
        // write CSV
        await csvMaker.makeCsvData(finalResultArray, globalColumns, csvpath);
        logger.info('CSV writing finished');
        // close window
        await puppScraper.doClose();
        // show message
        dialogMaker.showmessage('info', 'scrape finished.');

    } catch (e: unknown) {
        // error
        if (e instanceof Error) {
            // error
            logger.error(e.message);
        }
    }
});

// scrape url
ipcMain.on('scrapeurl', async (event: any, _: any) => {
    try {
        logger.info('ipc: scrape mode');
        // success Counter
        let successCounter: number = 0;
        // fail Counter
        let failCounter: number = 0;
        // page Counter
        let pageCounter: number = 1;
        // send total
        event.sender.send('total', TOTAL_COUNT);
        // initialize scraper
        await puppScraper.init();
        // goto page
        await puppScraper.doGo(LULINE_FIXED_URL);
        logger.debug(`app: scraping ${LULINE_FIXED_URL}`);
        // loop number
        const numbers: number[] = [...Array(TOTAL_COUNT)].map((_, i) => i + 1);
        // wait for 3 sec
        await setTimeout(3 * 1000);
        // scroll to bottom
        await puppScraper.mouseWheel();
        logger.debug(`app: scrolling...`);

        // loop
        for (let number of numbers) {
            try {
                // page MAX
                if (number % PAGE_COUNT == 0) {
                    // click seemore
                    await puppScraper.doClick(LilineSeemoreSelector);
                    logger.debug('app: seamore clicked');
                    // wait for 3 sec
                    await setTimeout(3 * 1000);
                    // pages 
                    pageCounter++
                }
                // tmp url
                const tmpUrl: any = await doScrapeUrl(pageCounter, number % PAGE_COUNT + 1);

                // url empty
                if (tmpUrl == '') {
                    // increment fail
                    failCounter++;

                } else {
                    // push url
                    finalCsvArray.push({
                        url: tmpUrl,
                    });
                    // increment success
                    successCounter++;
                }

            } catch (err) {
                // error
                if (err instanceof Error) {
                    // error
                    logger.error(err.message);
                    // increment fail
                    failCounter++;
                }

            } finally {
                // send success
                event.sender.send('success', successCounter);
                // send fail
                event.sender.send('fail', failCounter);
            }
        }
        // now time
        const nowtime: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, '').slice(0, 14)}`;
        // CSV file name
        const targetpath: string = `${nowtime}_url.csv`;
        // make CSV
        await csvMaker.makeCsvData(finalCsvArray, globalColumns, targetpath);
        // show message
        dialogMaker.showmessage('info', 'url scrape finished');

    } catch (e: unknown) {
        // error
        if (e instanceof Error) {
            // error
            logger.error(e.message);
        }
    }
});

// pause
ipcMain.on('pause', async (_: any, arg: any) => {
    try {
        logger.info('ipc: pause mode');
        // CSV path
        let targetpath: string = '';
        // CSV data array
        let targetCsvArray: any = [];
        // show question dialog
        const selected: number = dialogMaker.showQuetion('Q', 'stop', 'app will stop ok？scraped data is written to csv file.');

        // yes
        if (selected == 0) {
            // nowtime
            const nowtime: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, '').slice(0, 14)}`;

            // URL
            if (arg == 'url') {
                // target CSV
                targetCsvArray = finalCsvArray;
                // CSV file name
                targetpath = `${nowtime}_url.csv`;

                // SHOP
            } else if (arg == 'shop') {
                // target CSV
                targetCsvArray = finalResultArray;
                // CSV file name
                targetpath = `${nowtime}.csv`;
            }
            // make CSV
            await csvMaker.makeCsvData(targetCsvArray, globalColumns, targetpath);
            // pause message
            dialogMaker.showmessage('info', 'stopped.');

        } else {
            return false;
        }

    } catch (e: unknown) {
        // error
        if (e instanceof Error) {
            // error
            logger.error(e.message);
        }
    }
});

// exit
ipcMain.on('exit', async () => {
    try {
        logger.info('ipc: exit mode');
        // exit App
        exitApp();

    } catch (e: unknown) {
        // error
        if (e instanceof Error) {
            // error
            logger.error(e.message);
        }
    }
});

// do scraping
const doScrape = async (selector: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            // wait for 2 sec
            await setTimeout(2 * 100);

            // url exists
            if (await puppScraper.doCheckSelector(selector)) {
                // wait for datalist
                await puppScraper.doWaitSelector(selector, 10000);
                // url
                const tmpValues: any = await puppScraper.doSingleEval(
                    selector,
                    'innerHTML'
                );
                // result 
                resolve(tmpValues.trim());

            } else {
                // error
                throw new Error("no selector");
            }

        } catch (e: unknown) {
            // error
            if (e instanceof Error) {
                logger.error(e.message);
            }
            // reject
            reject('');
        }
    });
}

// do scraping url
const doScrapeUrl = async (page: number, num: number): Promise<any> => {
    return new Promise(async (resolve, reject) => {
        try {
            // get url list
            const LulineDetailSelector: string = `#ListTable > div:nth-child(${page}) > div:nth-child(${num}) > div.shopDetailBtn > a`;

            // wait for 1 sec
            await setTimeout(1 * 1000);

            // selector exists
            if (await puppScraper.doCheckSelector(LulineDetailSelector)) {
                // url
                const tmpUrl: any = await puppScraper.doSingleEval(
                    LulineDetailSelector,
                    'href'
                );
                logger.info(`scraping: ${tmpUrl}`);
                // resolve url
                resolve(tmpUrl);

            } else {
                // error
                throw new Error("no selector");
            }

        } catch (e: unknown) {
            // error
            if (e instanceof Error) {
                logger.error(e.message);
            }
            // reject
            reject('');
        }
    });
}

// exit App
const exitApp = (): void => {
    try {
        logger.info('ipc: exit mode');
        // show question dialog
        const selected: number = dialogMaker.showQuetion('Q', 'exit', 'app will exist ok？ scraped data will be trashed.');

        // yes
        if (selected == 0) {
            // quit app
            app.quit();
        }

    } catch (e: unknown) {
        // error
        if (e instanceof Error) {
            // error
            logger.error(e.message);
        }
    }
}
