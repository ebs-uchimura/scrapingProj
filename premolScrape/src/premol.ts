/*
 * premol.ts
 *
 * function：scraping electron app
 **/

// import modules
import { BrowserWindow, app, ipcMain, dialog, Tray, Menu, nativeImage } from 'electron'; // electron
import * as path from 'path'; // path
import { promises } from "fs"; // fs
import iconv from 'iconv-lite'; // Text converter
import { parse } from 'csv-parse/sync'; // parse
import { Scrape } from './class/Scrape0326'; // scraper
import ELLogger from './class/ELLogger0301'; // logger
import CSV from './class/Csv0506'; // csv

// 定数
const CSV_ENCODING: string = 'SJIS'; // csv encoding
const PREMOL_URL: string = 'https://gourmet.suntory.co.jp/search/f__'; // 都道府県ページURL
const CHOOSE_FILE: string = '読み込むCSVを選択してください。'; // ファイルダイアログ
// CSV用
const csvOperator: CSV = new CSV(dialog, CSV_ENCODING);
// ログ設定
const logger: ELLogger = new ELLogger('../../logs', 'access');
// スクレイピング用
const puppScraper: Scrape = new Scrape();
// デスクトップパス
const dir_home = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"] ?? '';
const dir_desktop = path.join(dir_home, "Desktop");
// ファイル読み込み用
const { readFile, writeFile } = promises;

// 配列初期化
let globalFinalCsvArray: any[] = [];
let globalFinalResultArray: any[] = [];

/*
 メイン
*/
// ウィンドウ定義
let mainWindow: Electron.BrowserWindow;
// 起動確認フラグ
let isQuiting: boolean;

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
  const icon: Electron.NativeImage = nativeImage.createFromPath(path.join(__dirname, '../assets/beer.ico'));
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

// スクレイピング
ipcMain.on('scrape', async (_: any, arg: any) => {
  try {
    logger.info('ipc: scrape mode');
    // カウンタ
    let counter: number = 0;

    // 配列初期化
    globalFinalResultArray = [];
    // 店舗名
    const targetShopName: string = '#gc > div.shop_header > div.sic > div.shop_info_block > div.sit > a > h2';
    // 店舗ジャンル
    const targetShopGenre: string = '#gc > div.shop_header > div.sic > div.shop_info_block > div.sit > a > p';
    // 最寄り駅
    const targetShopCloseStation: string = '#gc > div.shop_header > div.sic > div.shop_info_block > div.shop_info_access_budget > p.shop_nearest_station > span';
    // 予算
    const targetShopBudget: string = '#gc > div.shop_header > div.sic > div.shop_info_block > div.shop_info_access_budget > p.shop_budget > span';
    // 電話
    const targetPhoneNumber: string = '#gc > div.shop_container > div.shop_container__main > div.shop_data > div.shop_info > table > tbody > tr:nth-child(1) > td > div.pc_item_block > span';
    // 住所
    const targetShopAddress: string = '#gc > div.shop_container > div.shop_container__main > div.shop_data > div.shop_info > table > tbody > tr:nth-child(2) > td > div.pc_item_block > div > p.link_address > a';
    // 営業時間
    const targetShopBusinessTime: string = '#gc > div.shop_container > div.shop_container__main > div.shop_data > div.shop_info > table > tbody > tr:nth-child(4) > td';
    // 定休日
    const targetShopHoliday: string = '#gc > div.shop_container > div.shop_container__main > div.shop_data > div.shop_info > table > tbody > tr:nth-child(5) > td';
    // 座席数
    const targetShopSheet: string = '#gc > div.shop_container > div.shop_container__main > div.shop_data > div.shop_info > table > tbody > tr:nth-child(7) > td';

    // all selectors
    const premolSelectors: any = {
      店舗名: targetShopName,
      ジャンル: targetShopGenre,
      最寄り駅: targetShopCloseStation,
      予算: targetShopBudget,
      店舗電話: targetPhoneNumber,
      住所: targetShopAddress,
      営業時間: targetShopBusinessTime,
      定休日: targetShopHoliday,
      席数: targetShopSheet,
    };
    // スクレイパー初期化
    await puppScraper.init();

    // 収集ループ
    for await (const url of arg) {
      try {
        // 格納用
        let myShopObj: any = {
          店舗名: '', // shopname
          ジャンル: '', // genre
          最寄り駅: '', // status
          予算: '', // budget
          店舗電話: '', // shopphone
          住所: '', // address
          営業時間: '', // business time
          定休日: '', // holiday
          席数: '', // seat
        };
        // トップへ
        await puppScraper.doGo(url);
        // ウェイト
        await puppScraper.doWaitFor(2 * 1000);
        // 年齢チェック
        logger.debug(`app: scraping ${url}`);
        // 結果収集
        const shopnameresult: string = await doScrape(premolSelectors['店舗名']);
        // 店舗名
        myShopObj['店舗名'] = shopnameresult;
        // ジャンル
        const genreresult: string = await doScrape(premolSelectors['ジャンル']);
        myShopObj['ジャンル'] = genreresult;
        // 最寄り駅
        const stationresult: string = await doScrape(premolSelectors['最寄り駅']);
        myShopObj['最寄り駅'] = stationresult;
        // 予算
        const budgetresult: string = await doScrape(premolSelectors['予算']);
        myShopObj['予算'] = budgetresult;
        // 店舗電話
        const phoneresult: string = await doScrape(premolSelectors['店舗電話']);
        myShopObj['店舗電話'] = phoneresult;
        // 住所
        const addressresult: string = await doScrape(premolSelectors['住所']);
        myShopObj['住所'] = addressresult;
        // 営業時間
        const businessresult: string = await doScrape(premolSelectors['営業時間']);
        const businessTxt: string = await doCheck(businessresult);
        myShopObj['営業時間'] = businessTxt;
        // 定休日
        const holidayresult: string = await doScrape(premolSelectors['定休日']);
        const holidayTxt: string = await doCheck(holidayresult);
        myShopObj['定休日'] = holidayTxt;
        // 席数
        const seatresult: string = await doScrape(premolSelectors['席数']);
        const seatTxt: string = await doCheck(seatresult);
        myShopObj['席数'] = seatTxt;

        counter++;
        console.log(counter);
        console.log(myShopObj);

        globalFinalResultArray.push(myShopObj);

      } catch (err: unknown) {
        // エラー型
        if (err instanceof Error) {
          // エラー処理
          logger.error(err.message);
        }
      }
    }

    // CSVファイル名
    const nowtime: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, "").slice(0, 14)}.csv`;
    // CSV作成
    await csvOperator.makeCsvData(globalFinalResultArray, nowtime);
    logger.debug('CSV writing finished');
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
    // オブジェクト破棄
    await puppScraper.doClose();
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
ipcMain.on('scrapeurl', async (_: any, arg: any) => {
  try {
    logger.info('ipc: scrape mode');
    // カウンタ
    let counter: number = 0;
    // 対象リンク集
    let targetShopLinkArray: string[] = [];
    // 店舗数
    const targetShopTotal: string = '#gourmet_container > div.search_header > div > div.search_header_pageNation > p > span:nth-child(7)';
    // 店舗ループ用
    const shopLinks: number[] = makeNumberRange(1, 20);

    // 収集ループ
    for await (const j of shopLinks) {
      // 対象リンク
      targetShopLinkArray.push(`div.search_main_left > div:nth-child(${j}) > a > div > div.search_shop_header_ttl > div.ttl`);
    }
    // スクレイパー初期化
    await puppScraper.init();
    // セレクタ
    const prefUrl: string = PREMOL_URL + String(arg).padStart(2, '0');
    // トップへ
    await puppScraper.doGo(prefUrl);
    logger.debug(`scraping ${prefUrl}`);
    // 1秒待機
    await puppScraper.doWaitFor(1000);
    // 年齢チェック
    await doAgeChack();
    console.log('age checked');
    // 1秒待機
    await puppScraper.doWaitFor(1000);
    // セレクタ待機
    await puppScraper.doWaitSelector(targetShopTotal, 3000);

    // urlが存在する
    if (await puppScraper.doCheckSelector(targetShopTotal)) {
      // url
      const tmpTotalNumber: any = await puppScraper.doSingleEval(
        targetShopTotal,
        'innerHTML'
      );
      // 桁区切り除去
      const tmpFinalNumber: string = tmpTotalNumber.replace(',', '');
      //　合計数
      const totalPageNumber: number = Math.ceil(Number(tmpFinalNumber) / 20);
      // ページループ用
      const pageLinks: number[] = makeNumberRange(0, totalPageNumber);

      logger.debug(`total pages = ${totalPageNumber}`);

      // 収集ループ
      for await (const i of pageLinks) {
        try {
          // セレクタ
          const pageNum: string = String(20 * i + 1).padStart(2, '0');
          // URL
          const pageUrl: string = `${prefUrl}/b__${pageNum}`;
          // トップへ
          await puppScraper.doGo(pageUrl);

          // 収集ループ
          for await (const link of targetShopLinkArray) {
            try {
              // セレクタ待機
              await puppScraper.doWaitFor(5000);

              // urlが存在する
              if (await puppScraper.doCheckSelector(link)) {
                // 対象リンクをクリック
                await puppScraper.doClick(link);
                // ウェイト
                await puppScraper.doWaitFor(3 * 1000);
                // 対象URL
                const targetUrl: string = await puppScraper.getUrl();
                // CSV
                globalFinalCsvArray.push({
                  'URL': targetUrl,
                });
                logger.debug(targetUrl);
                logger.debug(counter.toString());
                counter++;
                // 前のページに戻る
                await puppScraper.doGoBack();

              } else {
                // 中断
                break;
              }

            } catch (e: unknown) {
              // エラー型
              if (e instanceof Error) {
                // エラー処理
                logger.error(e.message);
              }
            }
          }

        } catch (e: unknown) {
          // エラー型
          if (e instanceof Error) {
            // エラー処理
            logger.error(e.message);
          }
        }
      }

    } else {
      logger.error('no element');
      throw new Error('no element error');
    }
    // CSVファイル名
    const nowtime: string = `${dir_desktop}\\${(new Date).toISOString().replace(/[^\d]/g, "").slice(0, 14)}_url.csv`;
    // CSV作成
    await csvOperator.makeCsvData(globalFinalCsvArray, nowtime);

  } catch (err: unknown) {
    // エラー型
    if (err instanceof Error) {
      // エラー処理
      logger.error(err.message);
      // オブジェクト破棄
      await puppScraper.doClose();
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
    let targetCsvArray: any[] = [];
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
        targetCsvArray = globalFinalCsvArray;
        // 開店CSVファイル名
        targetpath = `${nowtime}_url.csv`;

      } else if (arg == 'shop') {
        // 対象CSV
        targetCsvArray = globalFinalResultArray;
        // 開店CSVファイル名
        targetpath = `${nowtime}.csv`;
      }
      // CSV作成
      await csvOperator.makeCsvData(targetCsvArray, targetpath);

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

// do check
const doCheck = async (word: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // 結果
      let tmpResult: string;
      // タグ文字列
      const regex: RegExp = new RegExp('(<([^>]+)>)', 'gi');
      // 改行文字列
      const retregex: RegExp = new RegExp(/\r?\n/g, 'gi');
      // 不要文字列
      const noregex: RegExp = new RegExp(/\t/g, 'gi');

      // タグあり
      if (regex.test(word)) {
        tmpResult = word.replace(regex, '');

      } else {
        tmpResult = word;
      }
      // タグあり
      if (retregex.test(tmpResult)) {
        tmpResult = tmpResult.replace(retregex, '');
      }
      // タグあり
      if (noregex.test(tmpResult)) {
        tmpResult = tmpResult.replace(noregex, '');
      }
      // 完了
      resolve(tmpResult);

    } catch (e: unknown) {
      // エラー型
      if (e instanceof Error) {
        // エラー処理
        logger.error(e.message);
        reject();
      }
    }
  });
}

// do scraping
const doScrape = async (selector: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // urlが存在する
      if (await puppScraper.doCheckSelector(selector)) {
        // url
        const tmpValues: any = await puppScraper.doSingleEval(
          selector,
          'innerHTML'
        );
        // 結果 
        resolve(tmpValues.trim());

      } else {
        resolve('');
      }

    } catch (e: unknown) {
      // エラー型
      if (e instanceof Error) {
        // エラー処理
        logger.error(e.message);
        reject();
      }
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

// do agecheck
const doAgeChack = async (): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      // 年齢確認
      const initCheckYearSelector: string = '#age_check_year';
      const initCheckMonthSelector: string = '#age_check_monthselect';
      const initCheckDateSelector: string = '#age_check_day';
      const initCheckConfirmSelector: string = '#ac_modal_btn > span.jp_txt';

      // 要素が存在する
      if (await puppScraper.doCheckSelector(initCheckYearSelector)) {
        // 出生年
        await puppScraper.doType(initCheckYearSelector, '1980');

      } else {
        logger.error('no element');
        throw new Error('no element error');
      }

      // セレクタ待機
      await puppScraper.doWaitSelector(initCheckMonthSelector, 3000);

      // 要素が存在する
      if (await puppScraper.doCheckSelector(initCheckMonthSelector)) {
        // 出生月
        await puppScraper.doSelect(initCheckMonthSelector, '1');

      } else {
        logger.error('no element');
        throw new Error('no element error');
      }

      // セレクタ待機
      await puppScraper.doWaitSelector(initCheckDateSelector, 3000);

      // 要素が存在する
      if (await puppScraper.doCheckSelector(initCheckDateSelector)) {
        // 出生日
        await puppScraper.doType(initCheckDateSelector, '1');

      } else {
        logger.error('no element');
        throw new Error('no element error');
      }

      // セレクタ待機
      await puppScraper.doWaitSelector(initCheckConfirmSelector, 3000);

      // 要素が存在する
      if (await puppScraper.doCheckSelector(initCheckConfirmSelector)) {
        // 確定ボタンクリック
        await puppScraper.doClick(initCheckConfirmSelector);

      } else {
        logger.error('no element');
        throw new Error('no element error');
      }
      // 完了
      resolve();

    } catch (e: unknown) {
      // エラー型
      if (e instanceof Error) {
        // エラー処理
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
        throw new Error('exit');
      }

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

// 数字配列
const makeNumberRange = (start: number, end: number) => [...new Array(end - start).keys()].map(n => n + start);