"use strict";
/*
 * index.ts
 *
 * function：Node.js server
 **/
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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
// 定数
const DEF_GOOGLE_URL = 'https://www.google.com/';
const CSV_ENCODING = 'SJIS'; // csv encoding
const CHOOSE_FILE = '読み込むCSVを選択してください。'; // ファイルダイアログ
// import modules
const dotenv_1 = require("dotenv"); // 隠蔽用
const electron_1 = require("electron"); // electron
const crypto_1 = __importDefault(require("crypto")); // crypto
const path = __importStar(require("path")); // path
const fs_1 = require("fs"); // fs
const sync_1 = require("csv-parse/sync"); // parse
const iconv_lite_1 = __importDefault(require("iconv-lite")); // Text converter
const myScraper0308_1 = require("./class/myScraper0308"); // scraper
const MyLogger0301el_1 = __importDefault(require("./class/MyLogger0301el")); // logger
const myAggregator0308_1 = require("./class/myAggregator0308"); // aggregator
// promises
const { readFile, writeFile } = fs_1.promises;
// ログ設定
const logger = new MyLogger0301el_1.default('../../logs', 'access');
// make empty xlsx
const makeEmptyXlsx = (filePath) => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // create empty file
            yield writeFile(filePath, '');
            // resolved
            resolve();
        }
        catch (e) {
            // error   
            logger.error(e);
            reject();
        }
    }));
};
// スクレイピング用
const puppScraper = new myScraper0308_1.Scrape();
// aggregator
const aggregator = new myAggregator0308_1.Aggregate();
// 環境変数
(0, dotenv_1.config)({ path: path.join(__dirname, '../.env') });
/*
 メイン
*/
// ウィンドウ定義
let mainWindow;
// 起動確認フラグ
let isQuiting;
// ウィンドウ作成
const createWindow = () => {
    try {
        // ウィンドウ
        mainWindow = new electron_1.BrowserWindow({
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
            mainWindow.webContents.openDevTools();
        });
        // 最小化のときはトレイ常駐
        mainWindow.on('minimize', (event) => {
            // キャンセル
            event.preventDefault();
            // ウィンドウを隠す
            mainWindow.hide();
            // falseを返す
            event.returnValue = false;
        });
        // 閉じる
        mainWindow.on('close', (event) => {
            // 起動中
            if (!isQuiting) {
                // apple以外
                if (process.platform !== 'darwin') {
                    // 終了
                    electron_1.app.quit();
                    // falseを返す
                    event.returnValue = false;
                }
            }
        });
        // ウィンドウが閉じたら後片付けする
        mainWindow.on('closed', () => {
            // ウィンドウをクローズ
            mainWindow.destroy();
        });
    }
    catch (e) {
        // エラー処理
        if (e instanceof Error) {
            // メッセージ表示
            logger.error(`${e.message})`);
        }
    }
};
// サンドボックス有効化
electron_1.app.enableSandbox();
// 処理開始
electron_1.app.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    logger.info('app: electron is ready');
    // ウィンドウを開く
    createWindow();
    // アイコン
    const icon = electron_1.nativeImage.createFromPath(path.join(__dirname, '../assets/mainicon.ico'));
    // トレイ
    const mainTray = new electron_1.Tray(icon);
    // コンテキストメニュー
    const contextMenu = electron_1.Menu.buildFromTemplate([
        // 表示
        {
            label: '表示', click: () => {
                mainWindow.show();
            }
        },
        // 閉じる
        {
            label: '閉じる', click: () => {
                electron_1.app.quit();
            }
        }
    ]);
    // コンテキストメニューセット
    mainTray.setContextMenu(contextMenu);
    // ダブルクリックで再表示
    mainTray.on('double-click', () => mainWindow.show());
}));
// 起動時
electron_1.app.on('activate', () => {
    // 起動ウィンドウなし
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        // 再起動
        createWindow();
    }
});
// 閉じるボタン
electron_1.app.on('before-quit', () => {
    // 閉じるフラグ
    isQuiting = true;
});
// 終了
electron_1.app.on('window-all-closed', () => {
    logger.info('app: close app');
    // 閉じる
    electron_1.app.quit();
});
// スクレイピング
electron_1.ipcMain.on('scrape', (_, arg) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // randomString
        const randomString = crypto_1.default.randomBytes(20).toString('hex');
        // selector
        const searchBoxSelector = '.RNNXgb';
        // file path
        const xlsxFilePath = `./output/output${randomString}.xlsx`;
        // make empty csv
        yield makeEmptyXlsx(xlsxFilePath);
        // init file path
        yield aggregator.init(xlsxFilePath);
        // initialize
        yield puppScraper.init();
        // goto google page
        yield puppScraper.doGo(DEF_GOOGLE_URL);
        // wait for nav 
        yield puppScraper.doWaitNav();
        // wait for datalist
        yield puppScraper.doWaitSelector(searchBoxSelector, 3000);
        // enter search box
        yield puppScraper.doType(searchBoxSelector, 'aa');
        // press enter
        yield puppScraper.pressEnter();
        // wait for nav 
        yield puppScraper.doWaitNav();
        // 店舗情報一覧返し
        const allResults = Promise.all(
        // scraping
        arg.map((info) => {
            return new Promise((resolve, _) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    // 取得
                    const result = yield doScraping(info);
                    resolve(result);
                }
                catch (e) {
                    // エラー型
                    if (e instanceof Error) {
                        // エラー処理
                        logger.error(e.message);
                    }
                }
            }));
        }));
        // タイトル
        const titleArray = [['店名', '状態', '住所', '電話']];
        // データ書き込み
        yield aggregator.writeData(titleArray, allResults, '店舗情報');
        // close window
        yield puppScraper.doClose();
        // メッセージ表示
        showmessage('info', '取得が完了しました');
    }
    catch (e) {
        // エラー型
        if (e instanceof Error) {
            // エラー処理
            logger.error(e.message);
        }
    }
}));
// CSV取得
electron_1.ipcMain.on('csv', (event, _) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger.info('ipc: csv mode');
        // CSVデータ取得
        const result = yield getCsvData();
        // 配信ユーザ一覧返し
        event.sender.send('shopinfoCsvlist', result);
    }
    catch (e) {
        // エラー型
        if (e instanceof Error) {
            // エラー処理
            logger.error(e.message);
        }
    }
}));
// スクレイピング
const doScraping = (word) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
            // variable
            let tmpshopname;
            let tmpstatus;
            let tmpshopaddress;
            let tmptelephone;
            let tmpArray = [];
            // flg
            let shopnameFlg = false; // 店舗名取得フラグ
            let shopstatusFlg = false; // 店舗状態取得フラグ
            // selector
            const pageSearchBoxSelector = '.gLFyf';
            const shopnameSelector = '.qrShPb > span';
            const shopstatusSelector = '.Shyhc > span';
            const shopaddressSelector = '.LrzXr';
            const shoptelephoneSelector = '.LrzXr > a > span';
            const shopname2Selector = '.PZPZlf';
            const shopstatus2Selector = '.Shyhc > span';
            // wait for datalist
            yield puppScraper.doWaitSelector(pageSearchBoxSelector, 3000);
            // enter search box
            yield puppScraper.doType(pageSearchBoxSelector, word);
            // check if exists
            if (yield puppScraper.doCheckSelector(shopnameSelector)) {
                console.log('shopname exists');
                // wait for datalist
                yield puppScraper.doWaitSelector(shopnameSelector, 10000);
                // status
                tmpshopname = yield puppScraper.doSingleEval(shopnameSelector, 'innerHTML');
                console.log(tmpshopname);
                shopnameFlg = true;
                tmpArray[0] = tmpshopname;
            }
            // check if exists
            if (yield puppScraper.doCheckSelector(shopstatusSelector)) {
                console.log('shopstatus exists');
                // wait for datalist
                yield puppScraper.doWaitSelector(shopstatusSelector, 5000);
                // shopname
                tmpstatus = yield puppScraper.doSingleEval(shopstatusSelector, 'innerHTML');
                console.log(tmpstatus);
                shopstatusFlg = true;
                tmpArray[1] = tmpstatus;
            }
            // check if exists
            if (yield puppScraper.doCheckSelector(shopaddressSelector)) {
                console.log('shopaddress exists');
                // wait for datalist
                yield puppScraper.doWaitSelector(shopaddressSelector, 5000);
                // shopname2
                tmpshopaddress = yield puppScraper.doSingleEval(shopaddressSelector, 'innerHTML');
                console.log(tmpshopaddress);
                tmpArray[2] = tmpshopaddress;
            }
            // check if exists
            if (yield puppScraper.doCheckSelector(shoptelephoneSelector)) {
                console.log('telephone exists');
                // wait for datalist
                yield puppScraper.doWaitSelector(shoptelephoneSelector, 5000);
                // address
                tmptelephone = yield puppScraper.doSingleEval(shoptelephoneSelector, 'innerHTML');
                console.log(tmptelephone);
                tmpArray[3] = tmptelephone;
            }
            // check if exists
            if ((yield puppScraper.doCheckSelector(shopname2Selector)) && !shopnameFlg) {
                console.log('shopname2 exists');
                // wait for datalist
                yield puppScraper.doWaitSelector(shopname2Selector, 5000);
                // status
                tmpshopname = yield puppScraper.doSingleEval(shopnameSelector, 'innerHTML');
                console.log(tmpshopname);
                tmpArray[0] = tmpshopname;
            }
            // check if exists
            if ((yield puppScraper.doCheckSelector(shopstatus2Selector)) && !shopstatusFlg) {
                console.log('shopstatus2 exists');
                // wait for datalist
                yield puppScraper.doWaitSelector(shopstatus2Selector, 5000);
                // status
                tmpstatus = yield puppScraper.doSingleEval(shopstatus2Selector, 'innerHTML');
                console.log(tmpstatus);
                tmpArray[1] = tmpstatus;
            }
            // 完了
            resolve(tmpArray);
        })).catch((err) => {
            // エラー型
            if (err instanceof Error) {
                // エラー
                logger.error(err.message);
            }
        });
    }
    catch (e) {
        // エラー型
        if (e instanceof Error) {
            // エラー処理
            logger.error(e.message);
        }
    }
});
// CSV抽出
const getCsvData = () => {
    return new Promise((resolve, reject) => {
        try {
            logger.info('func: getCsvData mode');
            // ファイル選択ダイアログ
            electron_1.dialog.showOpenDialog({
                properties: ['openFile'], // ファイル
                title: CHOOSE_FILE, // ファイル選択
                defaultPath: '.', // ルートパス
                filters: [
                    { name: 'csv(Shif-JIS)', extensions: ['csv'] }, // csvのみ
                ],
            }).then((result) => __awaiter(void 0, void 0, void 0, function* () {
                // ファイルパス
                const filenames = result.filePaths;
                // ファイルあり
                if (filenames.length) {
                    // ファイル読み込み
                    const csvdata = yield readFile(filenames[0]);
                    // デコード
                    const str = iconv_lite_1.default.decode(csvdata, CSV_ENCODING);
                    // csvパース
                    const tmpRecords = (0, sync_1.parse)(str, {
                        columns: false, // カラム設定なし
                        from_line: 2, // 開始行無視
                        skip_empty_lines: true, // 空白セル無視
                    });
                    // 値返し
                    resolve({
                        record: tmpRecords, // データ
                        filename: filenames[0], // ファイル名
                    });
                    // ファイルなし
                }
                else {
                    reject(result.canceled);
                }
            })).catch((err) => {
                // エラー型
                if (err instanceof Error) {
                    // エラー
                    logger.error(err.message);
                }
            });
        }
        catch (e) {
            // エラー型
            if (e instanceof Error) {
                // エラー
                logger.error(e.message);
                reject(e.message);
            }
        }
    });
};
// メッセージ表示
const showmessage = (type, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // モード
        let tmpType;
        // タイトル
        let tmpTitle;
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
        const options = {
            type: tmpType, // タイプ
            message: tmpTitle, // メッセージタイトル
            detail: message, // 説明文
        };
        // ダイアログ表示
        electron_1.dialog.showMessageBox(options);
    }
    catch (e) {
        // エラー型
        if (e instanceof Error) {
            // エラー
            logger.error(e.message);
        }
    }
});
