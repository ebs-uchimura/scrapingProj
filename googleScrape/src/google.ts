/*
 * index.ts
 *
 * function：Node.js server
 **/

// 定数
const DEF_GOOGLE_URL: string = 'https://www.google.com/'; // スクレイピング対象サイト
const CSV_ENCODING: string = 'SJIS'; // csv文字コード
const CHOOSE_FILE: string = '読み込むCSVを選択してください。'; // ファイルダイアログ

// import modules
import { config as dotenv } from 'dotenv'; // dotenv
import { BrowserWindow, app, ipcMain, dialog, Tray, Menu, nativeImage } from 'electron'; // electron
import * as path from 'path'; // path
import { promises } from "fs"; // fs
import { parse } from 'csv-parse/sync'; // parse
import iconv from 'iconv-lite'; // Text converter
import Encoding from 'encoding-japanese'; // エンコード用
import { Scrape } from './class/Scrape0326'; // scraper
import ELLogger from './class/ELLogger0301'; // logger
import { stringify } from 'csv-stringify/sync'; // stringify

// ファイル読み込み用
const { readFile, writeFile } = promises;
// ログ設定
const logger: ELLogger = new ELLogger('../../logs', 'access');
// スクレイピング用
const puppScraper: Scrape = new Scrape();
// 環境変数
dotenv({ path: path.join(__dirname, '../.env') });

// 店舗情報セレクタ
interface shopinfoselector {
  shopname: string;
  status: string;
  address: string;
  subaddress?: string;
  telephone: string;
  genre?: string;
  review?: string;
  comment?: string;
}
// 送付用店舗情報
interface shopinfoobj {
  検索ワード: string;
  店舗名: string;
  状態: string;
  住所: string;
  店舗電話: string;
  ジャンル: string;
  レビュー: string;
  口コミ: string;
}

// セレクタ
const pageSearchBoxSelectorA: string = '.gLFyf';
// 共通セレクタ
const shopaddressSelector: string = `span.LrzXr`;
const shoptelephoneSelector: string = `span.LrzXr > a > span`;
// typeA(営業中)
const shatusBaseA: string = 'div.nwVKo > div.loJjTe > div';
const shopnameSelectorA: string = `div.QpPSMb > div > div`;
const shopreviewSelectorA: string = `${shatusBaseA} > span.Aq14fc`;
const shopcommentSelectorA: string = `${shatusBaseA} > div > span.hqzQac > span > a > span`;
const shopgenreSelectorA: string = `${shatusBaseA} > div > span.E5BaQ`;
const shopstatusSelectorA: string = `div.bJpcZ > div.vk_bk.h-n > span > span > span > span > span > span > span`;
// typeB(営業中)
const shopnameSelectorB: string = `div.SPZz6b > h2 > span`;
const shopreviewSelectorB: string = `span.Aq14fc`;
const shopcommentSelectorB: string = `span.hqzQac > span > a > span`;
const shopgenreSelectorB: string = `span.YhemCb`;
// typeC(閉店)
const shopnameSelectorC: string = 'div > div.d7sCQ.kp-header > div.fYOrjf.kp-hc > div > div > div > h2 > span';
const shopstatusSelectorC: string = '#Shyhc > span';
// typeD(閉店)
const shopnameSelectorD: string = '#rhs > div.kp-wholepage-osrp > div.wPNfjb > div > div > div:nth-child(2) > div > div > div.QpPSMb > div > div';
const shopstatusSelectorD: string = '#Shyhc > span';
// desktopパス取得
const dir_home = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"] ?? '';
const dir_desktop = path.join(dir_home, "Desktop");

// selectorsA
const googleSelectorsA: shopinfoselector = {
  shopname: shopnameSelectorA,
  status: shopstatusSelectorA,
  review: shopreviewSelectorA,
  comment: shopcommentSelectorA,
  genre: shopgenreSelectorA,
  address: shopaddressSelector,
  telephone: shoptelephoneSelector,
};

// selectorsB
const googleSelectorsB: shopinfoselector = {
  shopname: shopnameSelectorB,
  status: shopstatusSelectorA,
  review: shopreviewSelectorB,
  comment: shopcommentSelectorB,
  genre: shopgenreSelectorB,
  address: shopaddressSelector,
  telephone: shoptelephoneSelector,
};

// selectorsC
const googleSelectorsC: shopinfoselector = {
  shopname: shopnameSelectorC,
  status: shopstatusSelectorC,
  address: shopaddressSelector,
  telephone: shoptelephoneSelector,
};

// selectorsD
const googleSelectorsD: shopinfoselector = {
  shopname: shopnameSelectorD,
  status: shopstatusSelectorD,
  address: shopaddressSelector,
  telephone: shoptelephoneSelector,
};

/* メイン */
// ウィンドウ定義
let mainWindow: Electron.BrowserWindow;
// 起動確認フラグ
let isQuiting: boolean;
// 最終店舗配列
let finalShopResultArray: any = [];

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
        preload: path.join(__dirname, 'preload.js'), // プリロード
      },
    });

    // メニューバー非表示
    mainWindow.setMenuBarVisibility(false);
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
  const icon: Electron.NativeImage = nativeImage.createFromPath(path.join(__dirname, '../assets/google.ico'));
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
  // 閉じるフラグ
  isQuiting = true;
});

// 終了
app.on('window-all-closed', () => {
  logger.info('app: close app');
  // 閉じる
  app.quit();
});

/* IPC */
// スクレイピング
ipcMain.on('scrape', async (event: any, arg: any) => {
  // 成功数
  let successCounter: number = 0;
  // 失敗数
  let failCounter: number = 0;

  try {
    logger.info('ipc: scrape mode');
    // 合計数
    const totalWords: number = arg.length;
    // 合計数を送る
    event.sender.send('total', totalWords);
    // スクレイパー初期化
    await puppScraper.init();

    // 収集ループ
    for (let info of arg) {
      try {
        // google.comへ
        await puppScraper.doGo(DEF_GOOGLE_URL);
        // 1秒待機
        await puppScraper.doWaitFor(1000);
        // 結果収集
        const result: any = await doScrape(info);
        // 空判定
        const isEmpty: boolean = Object.keys(result).length === 0 && result.constructor === Object;
        // 送付用店舗情報
        const emptyObj: shopinfoobj = {
          検索ワード: info,
          店舗名: '',
          状態: '',
          住所: '',
          店舗電話: '',
          ジャンル: '',
          レビュー: '',
          口コミ: '',
        }

        // 空ならエラー
        if (result == '' || isEmpty) {
          // 失敗
          failCounter++;
          // 配列に格納
          finalShopResultArray.push(emptyObj);
          // エラー返し
          event.sender.send('statusUpdate', 'error');

        } else {
          // 成功
          successCounter++;
          // 配列に格納
          finalShopResultArray.push(result);
          // 配信ユーザ一覧返し
          event.sender.send('statusUpdate', result);
        }

      } catch (err) {
        // 失敗
        failCounter++;

        // エラー型
        if (err == 'error') {
          // エラー処理
          logger.error(err);
        }

      } finally {
        // 成功進捗更新
        event.sender.send('success', successCounter);
        // 失敗進捗更新
        event.sender.send('fail', failCounter);
      }
    }
    // 現在時刻
    const nowtime: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, "").slice(0, 14)}`;
    // CSVファイル名
    const targetpath: string = `${nowtime}.csv`;
    // CSV書き出し
    await makeCsvData(finalShopResultArray, targetpath);
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

// スクレイピング停止
ipcMain.on('pause', async () => {
  try {
    logger.info('ipc: pause mode');
    // 質問項目
    const options: Electron.MessageBoxSyncOptions = {
      type: 'question',
      title: '質問',
      message: '終了',
      detail: '終了してよろしいですか？これまでのデータはCSVに書き出されます。',
      buttons: ['はい', 'いいえ'],
      cancelId: -1, // Escで閉じられたときの戻り値
    }
    // 選んだ選択肢
    const selected: number = dialog.showMessageBoxSync(options);

    // はいを選択
    if (selected == 0) {
      // 現在時刻
      const nowtime: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, "").slice(0, 14)}`;
      // CSVファイル名
      const targetpath: string = `${nowtime}.csv`;
      // CSV書き出し
      await makeCsvData(finalShopResultArray, targetpath);
      // 終了メッセージ
      showmessage('info', '処理を中断しました');
      // 閉じる
      app.quit();

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
      // エラー処理
      logger.error(e.message);
    }
  }
});

// do scraping
const doScrape = async (info: string): Promise<shopinfoobj | string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // データありフラグ
      let existFlg: boolean = false;
      // 最終セレクタ
      let tmpShopObj: shopinfoobj;
      // 最終セレクタ
      let finalSelectors: any;
      // 1秒待機
      await puppScraper.doWaitFor(1000);

      // 検索ボックスが存在する
      if (await puppScraper.doCheckSelector(pageSearchBoxSelectorA)) {
        logger.info(`searching for ${info}`);
        // 待機3秒
        await puppScraper.doWaitSelector(pageSearchBoxSelectorA, 3000);
        // 検索ボックス
        await puppScraper.doType(pageSearchBoxSelectorA, info);
        // エンター押下
        await puppScraper.pressEnter();
        // 1秒待機
        await puppScraper.doWaitFor(2000);

        // 固定セレクタあり
        if (await puppScraper.doCheckSelector('.wPNfjb')) {
          // モード分岐
          if (await puppScraper.doCheckSelector(shopstatusSelectorD)) {
            logger.info('scraping: D mode');
            finalSelectors = googleSelectorsD;

          } else {
            logger.info('scraping: A mode');
            finalSelectors = googleSelectorsA;
          }

        } else {
          // モード分岐
          if (await puppScraper.doCheckSelector(shopstatusSelectorC)) {
            logger.info('scraping: C mode');
            finalSelectors = googleSelectorsC;

          } else {
            logger.info('scraping: B mode');
            finalSelectors = googleSelectorsB;
          }
        }
        // 0.1秒待機
        await puppScraper.doWaitFor(100);

        // 店名
        const shopname: string = await goScrape(finalSelectors.shopname);
        // 店名無し
        if (shopname == '') {
          logger.info('no shopname found');

        } else {
          logger.info(`shopname is ${shopname}`);
          // 0.1秒待機
          await puppScraper.doWaitFor(100);
          existFlg = true;
        }

        // 状態
        const status: string = await goScrape(finalSelectors.status);
        // 状態無し
        if (status == '') {
          logger.info('no status found');

        } else {
          logger.info(`status is ${status}`);
          // 0.1秒待機
          await puppScraper.doWaitFor(100);
          existFlg = true;
        }

        // 住所
        const address: string = await goScrape(finalSelectors.address);
        // 住所無し
        if (address == '') {
          logger.info('no address found');

        } else {
          logger.info(`address is ${address}`);
          // 0.1秒待機
          await puppScraper.doWaitFor(100);
          existFlg = true;
        }

        // 電話番号
        const telephone: string = await goScrape(finalSelectors.telephone);
        // 電話番号無し
        if (telephone == '') {
          logger.info('no telephone found');

        } else {
          logger.info(`telephone is ${telephone}`);
          // 0.1秒待機
          await puppScraper.doWaitFor(100);
          existFlg = true;
        }

        // レビュー
        const review: string = await goScrape(finalSelectors.review);
        // レビュー無し
        if (review == '') {
          logger.info('no review found');

        } else {
          logger.info(`review is ${review}`);
          // 0.1秒待機
          await puppScraper.doWaitFor(100);
          existFlg = true;
        }

        // 口コミ
        const comment: string = await goScrape(finalSelectors.comment);
        //  口コミ無し
        if (comment == '') {
          logger.info('no comment found');

        } else {
          logger.info(`comment is ${comment}`);
          // 0.1秒待機
          await puppScraper.doWaitFor(100);
          existFlg = true;
        }

        // ジャンル
        const genre: string = await goScrape(finalSelectors.genre);
        //  ジャンル無し
        if (genre == '') {
          logger.info('no genre found');

        } else {
          logger.info(`genre is ${genre}`);
          // 0.1秒待機
          await puppScraper.doWaitFor(100);
          existFlg = true;
        }

        if (existFlg) {
          // 格納用
          tmpShopObj = {
            検索ワード: info,
            店舗名: shopname,
            状態: status,
            住所: address,
            店舗電話: telephone,
            ジャンル: genre,
            レビュー: review,
            口コミ: comment,
          };
          // 値返却
          resolve(tmpShopObj);

        } else {
          // 結果 
          reject('error');
        }

      } else {
        // 結果 
        reject('error');
      }

    } catch (e) {
      // 送付用店舗情報
      const emptyErrObj: shopinfoobj = {
        検索ワード: info,
        店舗名: '',
        状態: '',
        住所: '',
        店舗電話: '',
        ジャンル: '',
        レビュー: '',
        口コミ: '',
      }
      // 配列に格納
      finalShopResultArray.push(emptyErrObj);
      // 値返却
      resolve(emptyErrObj);
    }
  });
}

// go scraping
const goScrape = async (selector: string): Promise<string> => {
  return new Promise(async (resolve, _) => {
    try {
      // urlが存在する
      if (await puppScraper.doCheckSelector(selector)) {
        // セレクタ表示待ち
        await puppScraper.doWaitSelector(selector, 10000);
        // 取得
        const tmpValues: any = await puppScraper.doSingleEval(
          selector,
          'innerHTML'
        );
        // 結果
        const tmpResult: string = tmpValues.trim();
        // 結果
        resolve(tmpResult);

      } else {
        // 結果
        logger.debug('no selector');
        resolve('');
      }

    } catch (e) {
      logger.error(e);
      resolve('');
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
          const csvdata: any = await readFile(filenames[0]);

          // ShiftJis以外はエラー
          if (Encoding.detect(csvdata) == 'UTF8') {
            logger.info(`${Encoding.detect(csvdata)}`);
            showmessage('error', 'Shift - JIS形式のCSVを読み込んでください');
            throw new Error('data is not Shift-JIS');
          }

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
      // csvdata
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
