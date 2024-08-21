/*
 * index.ts
 *
 * function：scraping electron app
 **/

// import modules
import { BrowserWindow, app, ipcMain, dialog, Tray, Menu, nativeImage } from 'electron'; // electron
import * as path from 'path'; // path
import { promises } from "fs"; // fs
import iconv from 'iconv-lite'; // Text converter
import { Scrape } from './class/myScraper0326el'; // scraper
import ELLogger from './class/MyLogger0301el'; // logger
import { setTimeout } from 'node:timers/promises'; // sleep
import { parse } from 'csv-parse/sync'; // parse
import { stringify } from 'csv-stringify/sync'; // write csv

// 定数
const CSV_ENCODING: string = 'SJIS'; // csv encoding
const CHOOSE_FILE: string = '読み込むCSVを選択してください。'; // ファイルダイアログ

// ファイル読み込み用
const { readFile, writeFile } = promises;

// ログ設定
const logger: ELLogger = new ELLogger('../../logs', 'access');
// スクレイピング用
const puppScraper: Scrape = new Scrape();

// Tabelog selector
const tabeLogUrlSelector: string = '.list-rst__rst-name-target';
// Tabelog hit selector
const tabeLogTotalSelector: string = '.c-page-count__num';
// Tabelog genre selector
const tabelLogGenreSelector: string = '#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(2) > td > span';
// Tabelog mainshopname selector
const tabeLogMainShopnameSelector: string = '#rstdtl-head > div.rstdtl-header > section > div.rdheader-title-data > div.rdheader-rstname-wrap > div > h2 > span';
// Tabelog mainshopname ruby selector
const tabeLogMainShopnameRubySelector: string = '#rstdtl-head > div.rstdtl-header > section > div.rdheader-title-data > div.rdheader-rstname-wrap > div > span';
// Tabelog station selector
const tabeLogStationSelector: string = '#rstdtl-head > div.rstdtl-header > section > div.rdheader-info-data > div > div > div:nth-child(1) > dl.rdheader-subinfo__item.rdheader-subinfo__item--station > dd > div > div.linktree__parent > a > span';
// Tabelog subshopname selector
const tabeLogMainSubshopname: string = '#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(1) > td > div > span';
// Tabelog reserve telephone selector
const tabeLogReservephoneSelector: string = '#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(3) > td > p > strong';
// Tabelog reservable selector
const tabeLogReservableSelector: string = '#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(4) > td > p';
// Tabelog address1 selector
const tabeLogAddress1Selector: string = '#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(5) > td > p > span:nth-child(1)';
// Tabelog address2 selector
const tabeLogAddress2Selector: string = '#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(5) > td > p > span:nth-child(2)';
// Tabelog businesstime monday selector
const tabeLogBusinesstimeMonSelector: string = '#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(1) > ul > li';
// Tabelog businesstime tuesday selector
const tabeLogBusinesstimeTueSelector: string = '#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(2) > ul > li';
// Tabelog businesstime wednesday selector
const tabeLogBusinesstimeWedSelector: string = '#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(3) > ul > li';
// Tabelog businesstime thursday selector
const tabeLogBusinesstimeThuSelector: string = '#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(4) > ul > li';
// Tabelog businesstime friday selector
const tabeLogBusinesstimeFriSelector: string = '#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(5) > ul > li';
// Tabelog businesstime saturday selector
const tabeLogBusinesstimeSatSelector: string = '#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(6) > ul > li';
// Tabelog businesstime sunday selector
const tabeLogBusinesstimeSunSelector: string = '#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(7) > ul > li';
// Tabelog businesstime holiday selector
const tabeLogBusinesstimeHolSelector: string = '#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > div > ul > li';
// Tabelog payment card selector
const tabeLogPaymentCardSelector: string = '#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(10) > td > div:nth-child(1) > p';
// Tabelog payment electronic mony selector
const tabeLogPaymentElSelector: string = '#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(10) > td > div:nth-child(2) > p';
// Tabelog payment code selector
const tabeLogPaymentCodeSelector: string = '#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(10) > td > div:nth-child(3) > p';
// Tabelog sheet selector
const tabeLogSheetSelector: string = '#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(1) > td > p';
// Tabelog reserve limit selector
const tabeLogReserveLimitSelector: string = '#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(2) > td > p';
// Tabelog privateroom selector
const tabeLogPrivateRoomSelector: string = '#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(3) > td > p';
// Tabelog rental selector
const tabeLogRentalSelector: string = '#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(4) > td > p:nth-child(1)';
// Tabelog smoking selector
const tabeLogSmokingSelector: string = '#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(5) > td';
// Tabelog parking selector
const tabeLogParkingSelector: string = '#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(6) > td';
// Tabelog alldrink selector
const tabeLogAlldrinkSelector: string = '#rst-data-head > table:nth-child(6) > tbody > tr:nth-child(1) > td > p';
// Tabelog homepage selector
const tabeLogHomepageSelector: string = '#rst-data-head > table:nth-child(9) > tbody > tr:nth-child(5) > td > p > a > span';
// Tabelog telephone selector
const tabeLogTelephoneSelector: string = '#rst-data-head > table:nth-child(9) > tbody > tr:nth-child(6) > td > p > strong';
// Tabelog telephone2 selector
const tabeLogTelephone2Selector: string = '#rst-data-head > table:nth-child(9) > tbody > tr:nth-child(5) > td > p > strong';

// all selectors
const tabeLogSelectors: any = {
    店舗名: tabeLogMainShopnameSelector,
    読み仮名: tabeLogMainShopnameRubySelector,
    最寄り駅: tabeLogStationSelector,
    店名: tabeLogMainSubshopname,
    ジャンル: tabelLogGenreSelector,
    予約用電話: tabeLogReservephoneSelector,
    予約可能: tabeLogReservableSelector,
    住所1: tabeLogAddress1Selector,
    住所2: tabeLogAddress2Selector,
    月: tabeLogBusinesstimeMonSelector,
    火: tabeLogBusinesstimeTueSelector,
    水: tabeLogBusinesstimeWedSelector,
    木: tabeLogBusinesstimeThuSelector,
    金: tabeLogBusinesstimeFriSelector,
    土: tabeLogBusinesstimeSatSelector,
    日: tabeLogBusinesstimeSunSelector,
    定休日: tabeLogBusinesstimeHolSelector,
    クレカ: tabeLogPaymentCardSelector,
    電子マネー: tabeLogPaymentElSelector,
    コード決済: tabeLogPaymentCodeSelector,
    席数: tabeLogSheetSelector,
    最大予約人数: tabeLogReserveLimitSelector,
    個室: tabeLogPrivateRoomSelector,
    貸切: tabeLogRentalSelector,
    喫煙: tabeLogSmokingSelector,
    駐車場: tabeLogParkingSelector,
    飲み放題: tabeLogAlldrinkSelector,
    ホームページ: tabeLogHomepageSelector,
    店舗電話: tabeLogTelephoneSelector,
    店舗電話2: tabeLogTelephone2Selector,
};

// デスクトップパス
const dir_home = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"] ?? '';
const dir_desktop = path.join(dir_home, "Desktop");

/*
 メイン
*/
// ウィンドウ定義
let mainWindow: Electron.BrowserWindow;
// 起動確認フラグ
let isQuiting: boolean;
// 最終URL配列
let finalCsvArray: any = [];
// 最終店舗配列
let finalResultArray: any = [];

// ウィンドウ作成
const createWindow = (): void => {
    try {
        // ウィンドウ
        mainWindow = new BrowserWindow({
            width: 1200, // 幅
            height: 1000, // 高さ
            webPreferences: {
                nodeIntegration: false, // Node.js利用許可
                contextIsolation: true, // コンテキスト分離
                preload: path.join(__dirname, 'preload/preload.js'), // プリロード
            },
        });

        // index.htmlロード
        mainWindow.loadFile(path.join(__dirname, '../index.html'));
        // 準備完了
        mainWindow.once('ready-to-show', () => {
            // 開発モード
            // mainWindow.webContents.openDevTools();
        });

        // 最小化のときはトレイ常駐
        mainWindow.on('minimize', (event: any): void => {
            // キャンセル
            event.preventDefault();
            // ウィンドウを隠す
            mainWindow.hide();
            // falseを返す
            event.returnValue = false;
        });

        // 閉じる
        mainWindow.on('close', (event: any): void => {
            // 起動中
            if (!isQuiting) {
                // apple以外
                if (process.platform !== 'darwin') {
                    // falseを返す
                    event.returnValue = false;
                }
            }
        });

        // ウィンドウが閉じたら後片付けする
        mainWindow.on('closed', (): void => {
            // ウィンドウをクローズ
            mainWindow.destroy();
        });

    } catch (e: unknown) {
        // エラー処理
        if (e instanceof Error) {
            // メッセージ表示
            logger.error(`${e.message})`);
        }
    }
}

// サンドボックス有効化
app.enableSandbox();

// 処理開始
app.on('ready', async () => {
    logger.info('app: electron is ready');
    // ウィンドウを開く
    createWindow();
    // アイコン
    const icon: Electron.NativeImage = nativeImage.createFromPath(path.join(__dirname, '../assets/gourmet.ico'));
    // トレイ
    const mainTray: Electron.Tray = new Tray(icon);
    // コンテキストメニュー
    const contextMenu: Electron.Menu = Menu.buildFromTemplate([
        // 表示
        {
            label: '表示', click: () => {
                mainWindow.show();
            }
        },
        // 閉じる
        {
            label: '閉じる', click: () => {
                app.quit();
            }
        }
    ]);
    // コンテキストメニューセット
    mainTray.setContextMenu(contextMenu);
    // ダブルクリックで再表示
    mainTray.on('double-click', () => mainWindow.show());
});

// 起動時
app.on('activate', () => {
    // 起動ウィンドウなし
    if (BrowserWindow.getAllWindows().length === 0) {
        // 再起動
        createWindow();
    }
});

// 閉じるボタン
app.on('before-quit', () => {
    logger.info('ipc: quit mode');
    // 閉じるフラグ
    isQuiting = true;
});

// 終了
app.on('window-all-closed', () => {
    logger.info('app: close app');
    // 閉じる
    app.quit();
});

/*
 IPC
*/
/* ページ表示 */
ipcMain.on('page', async (_, arg) => {
    try {
        logger.info('ipc: page mode');
        // 遷移先
        let url: string;

        // urlセット
        switch (arg) {
            // 終了
            case 'exit_page':
                // apple以外
                if (process.platform !== 'darwin') {
                    app.quit();
                    return false;
                }
                // 遷移先
                url = '';

                break;

            // トップページ
            case 'top_page':
                // 遷移先
                url = '../index.html';
                break;

            // URL取得画面
            case 'url_page':
                // 遷移先
                url = '../url.html';
                break;

            // 店舗情報取得画面
            case 'shop_page':
                // 遷移先
                url = '../shop.html';
                break;

            default:
                // 遷移先
                url = '';
        }
        // ページ遷移
        await mainWindow.loadFile(path.join(__dirname, url));

    } catch (e: unknown) {
        // エラー型
        if (e instanceof Error) {
            // エラー処理
            logger.error(e.message);
        }
    }
});

// CSV取得
ipcMain.on('csv', async (event, _) => {
    try {
        logger.info('ipc: csv mode');
        // CSVデータ取得
        const result: any = await getCsvData();
        // 配信ユーザ一覧返し
        event.sender.send('shopinfoCsvlist', result);

    } catch (e: unknown) {
        // エラー型
        if (e instanceof Error) {
            // エラー処理
            logger.error(e.message);
        }
    }
});

// スクレイピング
ipcMain.on('scrape', async (event: any, arg: any) => {
    try {
        logger.info('ipc: scrape mode');
        // 合計数
        let totalCounter: number = arg.length;
        // 成功数
        let successCounter: number = 0;
        // 失敗数
        let failCounter: number = 0;
        // エラー配列
        let errorResultArray: any[] = [];
        // 配列初期化
        finalResultArray = [];
        // タグ文字列
        const regex: RegExp = new RegExp('(<([^>]+)>)', 'gi');
        // スクレイパー初期化
        await puppScraper.init();
        // 成功進捗更新
        event.sender.send('total', totalCounter);

        // 収集ループ
        for (let url of arg) {
            try {
                // 格納用
                let myShopObj: any = {
                    店舗名: '', // shopname
                    読み仮名: '', // shopname ruby
                    最寄り駅: '', // status
                    店名: '', // shopname
                    ジャンル: '', // genre
                    予約用電話: '', // telephone
                    予約可能: '', // reservable
                    住所1: '', // address1
                    住所2: '', // address2
                    月: '', // monday
                    火: '', // tuesday
                    水: '', // wednesday
                    木: '', // thursday
                    金: '', // friday
                    土: '', // saturday
                    日: '', // sunday
                    定休日: '', // holiday
                    クレカ: '', // creditcard
                    電子マネー: '', // electronic money
                    コード決済: '', // code payment
                    席数: '', // seat
                    最大予約人数: '', // reservable
                    個室: '', // privateroom
                    貸切: '', // vip
                    喫煙: '', // smoking
                    駐車場: '', // parking
                    飲み放題: '', // alldrink
                    ホームページ: '', // homepage
                    店舗電話: '', // shopphone
                    店舗電話2: '', // shopphone2
                };

                // トップへ
                await puppScraper.doGo(url);
                // ウェイト
                await setTimeout(2 * 1000);
                logger.debug(`app: scraping ${url}`);
                // 対象URL返し
                event.sender.send('statusUpdate', url);

                // URLループ
                Object.keys(tabeLogSelectors).forEach(async (key: any) => {
                    // 結果
                    let tmpResult: string;
                    // 結果収集
                    const result: string = await doScrape(tabeLogSelectors[key]);
                    // 空判定
                    const isEmpty = Object.keys(result).length === 0 && result.constructor === Object;

                    // 空ならエラー
                    if (!isEmpty) {
                        // タグあり
                        if (regex.test(result)) {
                            tmpResult = result.replace(/(<([^>]+)>)/gi, '');

                        } else {
                            tmpResult = result;
                        }
                        // オブジェクトセット
                        myShopObj[`${key}`] = tmpResult;
                    }
                });
                // 成功数
                successCounter++;
                // 配列に格納
                finalResultArray.push(myShopObj);

            } catch (err) {
                // エラー型
                if (err instanceof Error) {
                    // エラー対象url
                    errorResultArray.push({ url: url });
                    // エラー処理
                    logger.error(err.message);
                    // 失敗
                    failCounter++;
                }

            } finally {
                // 成功進捗更新
                event.sender.send('success', successCounter);
                // 失敗進捗更新
                event.sender.send('fail', failCounter);
            }
        }

        // CSVファイル名
        const nowtime: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, "").slice(0, 14)}.csv`;
        // csvdata
        const csvData = stringify(finalResultArray, { header: true });
        // 書き出し
        await writeFile(nowtime, iconv.encode(csvData, 'shift_jis'));
        logger.debug('CSV writing finished');

        // エラーあり
        if (errorResultArray.length > 0) {
            // エラーCSVファイル名
            const errornowtime: string = `${dir_desktop}\\error_${(new Date).toISOString().replace(/[^\d]/g, "").slice(0, 14)}.csv`;
            // errorcsvdata
            const errorcsvdata = stringify(errorResultArray, { header: true });
            // エラー書き出し
            await writeFile(errornowtime, iconv.encode(errorcsvdata, 'shift_jis'));
            logger.debug('error CSV writing finished');
        }

        // ウィンドウを閉じる
        await puppScraper.doClose();
        // 終了メッセージ
        showmessage('info', '取得が終わりました');

    } catch (e: unknown) {
        // エラー型
        if (e instanceof Error) {
            // エラー処理
            logger.error(e.message);
        }
    }
});

// スクレイピング
ipcMain.on('scrapeurl', async (event: any, arg: any) => {
    try {
        logger.info('ipc: scrape mode');
        // 確定合計数
        let finalTotalCounter: number = 0;
        // 成功数
        let successCounter: number = 0;
        // 失敗数
        let failCounter: number = 0;
        // 配列初期化
        finalCsvArray = [];

        // スクレイパー初期化
        await puppScraper.init();
        // トップへ
        await puppScraper.doGo(`${arg}/1`);

        logger.debug(`scraping ${arg}/1`);

        // ウェイト
        await setTimeout(2 * 1000);

        // urlが存在する
        if (await puppScraper.doCheckSelector(tabeLogTotalSelector)) {
            logger.info('url exists');
            // wait for datalist
            await puppScraper.doWaitSelector(tabeLogTotalSelector, 10000);
            // url
            const tmptotal: any = await puppScraper.doMultiEval(
                tabeLogTotalSelector,
                'innerHTML'
            );
            // 合計数
            const totalCounter = Number(tmptotal[2].replace(/(<([^>]+)>)/gi, '')) / 20;
            logger.info(`total is ${totalCounter} pages`);

            // 上限超え
            if (totalCounter > 60) {
                // 終了メッセージ
                //showmessage('info', '1200件を超えています。');
                finalTotalCounter = 60;

            } else {
                finalTotalCounter = Math.floor(totalCounter);
            }
            logger.info(`final total is ${finalTotalCounter}`);

            // isNaNでない
            if (!isNaN(finalTotalCounter)) {
                // 合計数を送る
                event.sender.send('total', finalTotalCounter);
            }
        }

        // get url list
        const urls: string[] = [...Array(Math.ceil(finalTotalCounter)).keys()].map(i => `${arg}/${++i}`);

        // 収集ループ
        for (let url of urls) {
            try {
                // トップへ
                logger.debug(`app: scraping ${url}`);
                await puppScraper.doGo(url);
                // 結果収集
                const result: string[] = await doScrapeUrl(tabeLogUrlSelector);
                // 配列に格納
                finalCsvArray.push(result);
                logger.debug(`app: scraping ${url} success`);
                // 成功
                successCounter++;

            } catch (err) {
                // エラー型
                if (err instanceof Error) {
                    // エラー処理
                    logger.error(err.message);
                    // 失敗
                    failCounter = failCounter++;
                }

            } finally {
                // 対象URL返し
                event.sender.send('statusUpdate', url);
                // 成功進捗更新
                event.sender.send('success', successCounter);
                // 失敗進捗更新
                event.sender.send('fail', failCounter);
            }
        }

        // CSVファイル名
        const nowtime: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, "").slice(0, 14)}_url.csv`;
        // csvdata
        const csvData = stringify(finalCsvArray);
        // 書き出し
        await writeFile(nowtime, iconv.encode(csvData, 'shift_jis'));

        logger.debug('CSV writing finished');

        // 終了メッセージ
        showmessage('info', '取得が終わりました');

        // ウィンドウを閉じる
        await puppScraper.doClose();

    } catch (e: unknown) {
        // エラー型
        if (e instanceof Error) {
            // エラー処理
            logger.error(e.message);
        }
    }
});

// スクレイピング停止
ipcMain.on('pause', async (_: any, arg: any) => {
    try {
        logger.info('ipc: pause mode');
        // CSVパス
        let targetpath: string = '';
        // CSVデータ
        let targetCsvArray: any = [];
        // 質問項目
        const options: Electron.MessageBoxSyncOptions = {
            type: 'question',
            title: '質問',
            message: '停止',
            detail: '停止してよろしいですか？これまでのデータはCSVに書き出されます。',
            buttons: ['はい', 'いいえ'],
            cancelId: -1, // Escで閉じられたときの戻り値
        }
        // 選んだ選択肢
        const selected: number = dialog.showMessageBoxSync(options);

        // はいを選択
        if (selected == 0) {
            // 終了メッセージ
            showmessage('info', '処理を中断しました');

            // 現在時刻
            const nowtime: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, '').slice(0, 14)}`;

            if (arg == 'url') {
                // 対象CSV
                targetCsvArray = finalCsvArray;
                // 開店CSVファイル名
                targetpath = `${nowtime}_url.csv`;

            } else if (arg == 'shop') {
                // 対象CSV
                targetCsvArray = finalResultArray;
                // 開店CSVファイル名
                targetpath = `${nowtime}.csv`;
            }
            // CSV作成
            await makeCsvData(targetCsvArray, targetpath);

        } else {
            return false;
        }

    } catch (e: unknown) {
        // エラー型
        if (e instanceof Error) {
            // エラー処理
            logger.error(e.message);
        }
    }
});

// スクレイピング停止
ipcMain.on('exit', async () => {
    try {
        logger.info('ipc: exit mode');
        // アプリ終了
        await exitApp();

    } catch (e: unknown) {
        // エラー型
        if (e instanceof Error) {
            // エラー処理
            logger.error(e.message);
        }
    }
});

// do scraping
const doScrape = async (selector: string): Promise<string> => {
    return new Promise(async (resolve, reject) => {
        try {
            // 待機
            await setTimeout(5 * 1000);

            // urlが存在する
            if (await puppScraper.doCheckSelector(selector)) {
                // wait for datalist
                await puppScraper.doWaitSelector(selector, 10000);
                // url
                const tmpValues: any = await puppScraper.doSingleEval(
                    selector,
                    'innerHTML'
                );
                logger.debug(tmpValues.trim());
                // 結果 
                resolve(tmpValues.trim());

            } else {
                resolve('');
            }

        } catch (e) {
            logger.error(e);
            reject('');
        }
    });
}

// do scraping
const doScrapeUrl = async (selector: string): Promise<any> => {
    return new Promise(async (resolve, _) => {
        try {
            // 待機
            await setTimeout(2 * 1000);

            // urlが存在する
            if (await puppScraper.doCheckSelector(selector)) {
                // wait for datalist
                await puppScraper.doWaitSelector(selector, 10000);
                // url
                const tmpUrls: any = await puppScraper.doMultiEval(
                    selector,
                    'href'
                );
                // 結果 
                resolve(tmpUrls);
            }

        } catch (e) {
            console.log(e);
        }
    });
}

// CSV抽出
const getCsvData = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        try {
            logger.info('func: getCsvData mode');
            // ファイル選択ダイアログ
            dialog.showOpenDialog({
                properties: ['openFile'], // ファイル
                title: CHOOSE_FILE, // ファイル選択
                defaultPath: '.', // ルートパス
                filters: [
                    { name: 'csv(Shif-JIS)', extensions: ['csv'] }, // csvのみ
                ],

            }).then(async (result) => {
                // ファイルパス
                const filenames: string[] = result.filePaths;

                // ファイルあり
                if (filenames.length) {
                    // ファイル読み込み
                    const csvdata = await readFile(filenames[0]);
                    // デコード
                    const str: string = iconv.decode(csvdata, CSV_ENCODING);

                    // csvパース
                    const tmpRecords: string[][] = parse(str, {
                        columns: false, // カラム設定なし
                        from_line: 2, // 開始行無視
                        skip_empty_lines: true, // 空白セル無視
                    });

                    // 値返し
                    resolve({
                        record: tmpRecords, // データ
                        filename: filenames[0], // ファイル名
                    });

                } else {
                    // ファイルなし
                    reject(result.canceled);
                }

            }).catch((err: unknown) => {
                // エラー型
                if (err instanceof Error) {
                    // エラー
                    logger.error(err.message);
                }
            });

        } catch (e: unknown) {
            // エラー型
            if (e instanceof Error) {
                // エラー
                logger.error(e.message);
                reject(e.message);
            }
        }
    });
}

// CSV抽出
const makeCsvData = (arr: any[], filename: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        try {
            logger.info('func: makeCsvData mode');
            // CSVファイル名
            const nowtime: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, "").slice(0, 14)}_url.csv`;
            // csvdata
            const csvData = stringify(finalResultArray);
            // 書き出し
            await writeFile(nowtime, iconv.encode(csvData, 'shift_jis'));
            logger.debug('CSV writing finished');
            // ウィンドウを閉じる
            await puppScraper.doClose();
            // 完了
            resolve();

        } catch (e: unknown) {
            // エラー型
            if (e instanceof Error) {
                // エラー
                logger.error(e.message);
                reject();
            }
        }
    });
}

// メッセージ表示
const showmessage = async (type: string, message: string): Promise<void> => {
    try {
        // モード
        let tmpType: 'none' | 'info' | 'error' | 'question' | 'warning' | undefined;
        // タイトル
        let tmpTitle: string | undefined;

        // urlセット
        switch (type) {
            // 通常モード
            case 'info':
                tmpType = 'info';
                tmpTitle = '情報';
                break;

            // エラーモード
            case 'error':
                tmpType = 'error';
                tmpTitle = 'エラー';
                break;

            // 警告モード
            case 'warning':
                tmpType = 'warning';
                tmpTitle = '警告';
                break;

            // それ以外
            default:
                tmpType = 'none';
                tmpTitle = '';
        }

        // オプション
        const options: Electron.MessageBoxOptions = {
            type: tmpType, // タイプ
            message: tmpTitle, // メッセージタイトル
            detail: message,  // 説明文
        }
        // ダイアログ表示
        dialog.showMessageBox(options);

    } catch (e: unknown) {
        // エラー型
        if (e instanceof Error) {
            // エラー
            logger.error(e.message);
        }
    }
}

// アプリ終了
const exitApp = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            logger.info('ipc: exit mode');
            // 質問項目
            const options: Electron.MessageBoxSyncOptions = {
                type: 'question',
                title: '質問',
                message: '終了',
                detail: '終了してよろしいですか？これまでのデータは破棄されます。',
                buttons: ['はい', 'いいえ'],
                cancelId: -1, // Escで閉じられたときの戻り値
            }
            // 選んだ選択肢
            const selected: number = dialog.showMessageBoxSync(options);

            // はいを選択
            if (selected == 0) {
                // 閉じる
                app.quit();
                // 閉じる
                resolve();

            } else {
                reject();
            }

        } catch (e: unknown) {
            // エラー型
            if (e instanceof Error) {
                // エラー
                logger.error(e.message);
            }
        }
    });
}
