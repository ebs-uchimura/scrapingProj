/*
 * index.ts
 *
 * function：scraping electron app
 **/

// ◇ モジュール
import { BrowserWindow, app, ipcMain, dialog, Tray, Menu, nativeImage } from 'electron'; // electron
import * as path from 'path'; // path
import { promises } from 'fs'; // fs
import iconv from 'iconv-lite'; // charcode converter
import { Scrape } from './class/myScraper0326el'; // scraper
import ELLogger from './class/MyLogger0301el'; // logger
import { setTimeout } from 'node:timers/promises'; // sleep
import { parse } from 'csv-parse/sync'; // parse
import { stringify } from 'csv-stringify/sync'; // write csv

// ◇ 定数
const PAGE_COUNT: number = 30; // ページ店舗数
const TOTAL_COUNT: number = 2850; // 合計店舗数
const CSV_ENCODING: string = 'SJIS'; // CSV文字コード
const CHOOSE_FILE: string = '読み込むCSV選択してください。'; // ファイルダイアログ
const LULINE_FIXED_URL: string = 'https://luline.jp/shop_list/all/search/'; // ルートURL

// ◇ 設定
// ファイル読み込み用
const { readFile, writeFile } = promises;
// ログ設定
const logger: ELLogger = new ELLogger('../../logs', 'access');
// スクレイピング用
const puppScraper: Scrape = new Scrape();
// デスクトップパス
const dir_home = process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'] ?? '';
const dir_desktop = path.join(dir_home, 'Desktop');

// ◇ セレクター
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
    店舗名: LulineShopnameSelector,
    店舗名読み: LulineShopnameRubySelector,
    ジャンル: LulineGenreSelector,
    エリア: LulineAreaSelector,
    営業時間: LulineBusinesstimeSelector,
    住所1: LulineAddress1Selector,
    住所2: LulineAddress2Selector,
    最寄り駅: LilineAdjacentStationSelector,
    電話番号: LilineTelephoneSelector,
    メール: LilineEmailSelector,
};

/*
 メイン
*/
// ウィンドウ定義
let mainWindow: Electron.BrowserWindow;
// 起動確認フラグ
let isQuiting: boolean;
// 最終CSV配列
let finalCsvArray: any = [];
// 最終店舗情報配列
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
            // 終了中
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
    const icon: Electron.NativeImage = nativeImage.createFromPath(path.join(__dirname, '../assets/nightshop.ico'));
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
        let url: string = '';

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
        // 成功数
        let successCounter: number = 0;
        // 失敗数
        let failCounter: number = 0;
        // 合計数
        let totalCounter: number = arg.length;
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
                const myShopObj: any = {
                    店舗名: '',
                    店舗名読み: '',
                    ジャンル: '',
                    エリア: '',
                    営業時間: '',
                    住所1: '',
                    住所2: '',
                    最寄り駅: '',
                    電話番号: '',
                    メール: '',
                };
                // トップへ
                await puppScraper.doGo(url);
                // ウェイト
                await setTimeout(5 * 1000);
                logger.debug(`app: scraping ${url}`);

                // URLループ
                Object.keys(LulineSelectors).forEach(async (key: any) => {
                    try {
                        // 結果
                        let tmpResult: string = '';
                        // ウェイト
                        await setTimeout(1 * 1000);
                        // 結果収集
                        const result: string = await doScrape(LulineSelectors[key]);

                        // 空ならエラー
                        if (result != '') {
                            // タグあり
                            if (regex.test(result)) {
                                tmpResult = result.replace(/(<([^>]+)>)/gi, '');

                            } else {
                                tmpResult = result;
                            }
                            // オブジェクトセット
                            myShopObj[`${key}`] = tmpResult;
                        }

                    } catch (error: unknown) {
                        // エラー型
                        if (error instanceof Error) {
                            // エラー処理
                            logger.error(error.message);
                        }
                    }
                });
                // 成功数
                successCounter++;
                // 空判定
                const isEmpty = Object.keys(myShopObj).length === 0 && myShopObj.constructor === Object;

                // 空ならエラー
                if (!isEmpty) {
                    // 配列に格納
                    finalResultArray.push(myShopObj);
                }

            } catch (err: unknown) {
                // エラー型
                if (err instanceof Error) {
                    // エラー処理
                    logger.error(err.message);
                    // 失敗
                    failCounter++;
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
        const nowtime: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, '').slice(0, 14)}.csv`;
        // csvdata
        const csvData = stringify(finalResultArray, { header: true });
        // 書き出し
        await writeFile(nowtime, iconv.encode(csvData, 'shift_jis'));
        logger.info('CSV writing finished');
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
ipcMain.on('scrapeurl', async (event: any, _: any) => {
    try {
        logger.info('ipc: scrape mode');
        // 成功数
        let successCounter: number = 0;
        // 失敗数
        let failCounter: number = 0;
        // ページ数
        let pageCounter: number = 1;
        // 合計数を送る
        event.sender.send('total', TOTAL_COUNT);
        // スクレイパー初期化
        await puppScraper.init();
        // トップへ
        await puppScraper.doGo(LULINE_FIXED_URL);
        logger.debug(`app: scraping ${LULINE_FIXED_URL}`);
        // 連番配列
        const numbers: number[] = [...Array(TOTAL_COUNT)].map((_, i) => i + 1);
        // ウェイト
        await setTimeout(3 * 1000);
        // 下までスクロール
        await puppScraper.mouseWheel();
        logger.debug(`app: scrolling...`);

        // 収集ループ
        for (let number of numbers) {
            try {
                // ページMAX
                if (number % PAGE_COUNT == 0) {
                    // もっと見るクリック
                    await puppScraper.doClick(LilineSeemoreSelector);
                    logger.debug('app: seamore clicked');
                    // ウェイト
                    await setTimeout(3 * 1000);
                    // ページ数
                    pageCounter++
                }
                // 取得URL
                const tmpUrl: any = await doScrapeUrl(pageCounter, number % PAGE_COUNT + 1);

                // 取得失敗
                if (tmpUrl == '') {
                    // 失敗
                    failCounter++;

                } else {
                    // 成功配列
                    finalCsvArray.push({
                        url: tmpUrl,
                    });
                    // 成功
                    successCounter++;
                }

            } catch (err) {
                // エラー型
                if (err instanceof Error) {
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
        // 現在時刻
        const nowtime: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, '').slice(0, 14)}`;
        // CSVファイル名
        const targetpath: string = `${nowtime}_url.csv`;
        // CSV書き出し
        await makeCsvData(finalCsvArray, targetpath);
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
        };
        // 選んだ選択肢
        const selected: number = dialog.showMessageBoxSync(options);

        // はいを選択
        if (selected == 0) {
            // 現在時刻
            const nowtime: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, '').slice(0, 14)}`;

            // URL
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
            // 終了メッセージ
            showmessage('info', '処理を中断しました');

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
        exitApp();

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
            await setTimeout(2 * 100);

            // urlが存在する
            if (await puppScraper.doCheckSelector(selector)) {
                // wait for datalist
                await puppScraper.doWaitSelector(selector, 10000);
                // url
                const tmpValues: any = await puppScraper.doSingleEval(
                    selector,
                    'innerHTML'
                );
                // 結果 
                resolve(tmpValues.trim());

            } else {
                // エラー
                reject('');
            }

        } catch (e) {
            logger.error(e);
            // エラー
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

            // 待機
            await setTimeout(1 * 1000);

            // ページが存在する
            if (await puppScraper.doCheckSelector(LulineDetailSelector)) {
                // url
                const tmpUrl: any = await puppScraper.doSingleEval(
                    LulineDetailSelector,
                    'href'
                );
                logger.info(`scraping: ${tmpUrl}`);
                // 成功
                resolve(tmpUrl);

            } else {
                // 失敗
                reject('');
            }

        } catch (e) {
            logger.error(e);
            reject('');
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
            // csvデータ
            const csvData: any = stringify(arr, { header: true });
            // 書き出し
            await writeFile(filename, iconv.encode(csvData, 'shift_jis'));
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
const exitApp = (): void => {
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
        }

    } catch (e: unknown) {
        // エラー型
        if (e instanceof Error) {
            // エラー
            logger.error(e.message);
        }
    }
}
