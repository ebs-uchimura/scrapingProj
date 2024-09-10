/*
 * index.ts
 *
 * function：scraping electron app
 **/

"use strict";

// ◇ モジュール
import {
  BrowserWindow,
  app,
  ipcMain,
  dialog,
  Tray,
  Menu,
  nativeImage,
} from "electron"; // electron
import * as path from "path"; // path
import { promises } from "fs"; // fs
import iconv from "iconv-lite"; // charcode converter
import { Scrape } from "./class/Scrape0905"; // scraper
import ELLogger from "./class/ELLogger0301"; // logger
import { setTimeout } from "node:timers/promises"; // sleep
import { parse } from "csv-parse/sync"; // parse
import { stringify } from "csv-stringify/sync"; // write csv

// ◇ 定数
const PAGE_COUNT: number = 10; // ページ店舗数
const CSV_ENCODING: string = "SJIS"; // CSV文字コード
const CHOOSE_FILE: string = "読み込むCSV選択してください。"; // ファイルダイアログ
const ANDBAR_FIXED_URL: string = "https://andbar.net/map/?prefecture="; // ルートURL

// ◇ 設定
// ファイル読み込み用
const { readFile, writeFile } = promises;
// ログ設定
const logger: ELLogger = new ELLogger("../../logs", "access");
// スクレイピング用
const puppScraper: Scrape = new Scrape();
// ルートパス
const dir_home =
  process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"] ?? "";
// デスクトップパス
const dir_desktop = path.join(dir_home, "Desktop");

// ◇ セレクター
// see more
const AndBarSeemoreSelector: string =
  "#root > div:nth-child(2) > div > section > div.css-1q8fput > div.css-9hqybf > div.css-11yd8q > nav > div > p > i";
const AndBarSeemoreNextSelector: string =
  "#root > div:nth-child(2) > div > section > div.css-1q8fput > div.css-9hqybf > div.css-11yd8q > nav > div > p:nth-child(3)";
// 合計数
const AndBarTotalSelector: string =
  "#root > div:nth-child(2) > div > section > div.css-lr6r9q > p > span";

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
        preload: path.join(__dirname, "preload/preload.js"), // プリロード
      },
    });
    // メニューバー非表示
    mainWindow.setMenuBarVisibility(false);
    // index.htmlロード
    mainWindow.loadFile(path.join(__dirname, "../index.html"));

    // 準備完了
    mainWindow.once("ready-to-show", () => {
      // 開発モード
      // mainWindow.webContents.openDevTools();
    });

    // 最小化のときはトレイ常駐
    mainWindow.on("minimize", (event: any): void => {
      // キャンセル
      event.preventDefault();
      // ウィンドウを隠す
      mainWindow.hide();
      // falseを返す
      event.returnValue = false;
    });

    // 閉じる
    mainWindow.on("close", (event: any): void => {
      // 終了中
      if (!isQuiting) {
        // apple以外
        if (process.platform !== "darwin") {
          // falseを返す
          event.returnValue = false;
        }
      }
    });

    // ウィンドウが閉じたら後片付けする
    mainWindow.on("closed", (): void => {
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
};
// サンドボックス有効化
app.enableSandbox();

// メインプロセス(Nodejs)の多重起動防止
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log("メインプロセスが多重起動しました。終了します。");
  app.quit();
}

// 処理開始
app.on("ready", async () => {
  logger.info("app: electron is ready");
  // ウィンドウを開く
  createWindow();
  // アイコン
  const icon: Electron.NativeImage = nativeImage.createFromPath(
    path.join(__dirname, "../assets/andbar.ico")
  );
  // トレイ
  const mainTray: Electron.Tray = new Tray(icon);
  // コンテキストメニュー
  const contextMenu: Electron.Menu = Menu.buildFromTemplate([
    // 表示
    {
      label: "表示",
      click: () => {
        mainWindow.show();
      },
    },
    // 閉じる
    {
      label: "閉じる",
      click: () => {
        app.quit();
      },
    },
  ]);
  // コンテキストメニューセット
  mainTray.setContextMenu(contextMenu);
  // ダブルクリックで再表示
  mainTray.on("double-click", () => mainWindow.show());
});

// 起動時
app.on("activate", () => {
  // 起動ウィンドウなし
  if (BrowserWindow.getAllWindows().length === 0) {
    // 再起動
    createWindow();
  }
});

// 閉じるボタン
app.on("before-quit", () => {
  logger.info("ipc: quit mode");
  // 閉じるフラグ
  isQuiting = true;
});

// 終了
app.on("window-all-closed", () => {
  logger.info("app: close app");
  // 閉じる
  app.quit();
});

/*
 IPC
*/
/* ページ表示 */
ipcMain.on("page", async (_, arg) => {
  try {
    logger.info("ipc: page mode");
    // 遷移先
    let url: string = "";

    // urlセット
    switch (arg) {
      // 終了
      case "exit_page":
        // apple以外
        if (process.platform !== "darwin") {
          app.quit();
          return false;
        }
        // 遷移先
        url = "";
        break;

      // トップページ
      case "top_page":
        // 遷移先
        url = "../index.html";
        break;

      // URL取得画面
      case "url_page":
        // 遷移先
        url = "../url.html";
        break;

      // 店舗情報取得画面
      case "shop_page":
        // 遷移先
        url = "../shop.html";
        break;

      default:
        // 遷移先
        url = "";
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
ipcMain.on("csv", async (event, _) => {
  try {
    logger.info("ipc: csv mode");
    // CSVデータ取得
    const result: any = await getCsvData();
    // 配信ユーザ一覧返し
    event.sender.send("shopinfoCsvlist", result);
  } catch (e: unknown) {
    // エラー型
    if (e instanceof Error) {
      // エラー処理
      logger.error(e.message);
    }
  }
});

// スクレイピング
ipcMain.on("scrape", async (event: any, arg: any) => {
  try {
    logger.info("ipc: scrape mode");
    // セレクタ可変部
    let selectorVariable: string = "";
    // 成功数
    let successCounter: number = 0;
    // 失敗数
    let failCounter: number = 0;
    // 合計数
    let totalCounter: number = arg.length;
    // タグ文字列
    const regex: RegExp = new RegExp("(<([^>]+)>)", "gi");
    // スクレイパー初期化
    await puppScraper.init();
    // 成功進捗更新
    event.sender.send("total", totalCounter);

    // 収集ループ
    for (let url of arg) {
      try {
        // 格納用
        // all selectors
        const myShopObj: any = {
          店舗名: "",
          予算: "",
          電話番号: "",
          料金システム: "",
          営業時間1: "",
          営業時間2: "",
          営業時間3: "",
          営業時間4: "",
          営業時間5: "",
          営業時間6: "",
          営業時間7: "",
          営業時間8: "",
          所在地: "",
          カテゴリ: "",
          お店URL: "",
          座席数: "",
          個室有無: "",
          カウンター: "",
        };
        // トップへ
        await puppScraper.doGo(url);
        // 1秒ウェイト
        await setTimeout(1000);
        // ウェイト
        logger.debug(`app: scraping ${url}`);

        // 判定用
        const AndBarTestSelector1: string =
          "#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(7) > div > div > section:nth-child(1) > div > p:nth-child(1)";
        // 判定用
        const AndBarTestSelector2: string =
          "#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(5) > div > div > section:nth-child(1) > div > p:nth-child(1)";

        // パターン判定
        if (await puppScraper.doCheckSelector(AndBarTestSelector1)) {
          selectorVariable = "7";
          logger.debug("variable is 7");
        } else if (await puppScraper.doCheckSelector(AndBarTestSelector2)) {
          selectorVariable = "5";
          logger.debug("variable is 5");
        } else {
          selectorVariable = "4";
          logger.debug("variable is 4");
        }

        // 店舗名
        const AndBarShopnameSelector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mtkwgb > div > div > div > div > div > p.css-3gxuzy`;
        // 予算
        const AndBarBudgetSelector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div.css-15ldb09 > div > p:nth-child(3)`;
        // 電話番号
        const AndBarTelephoneSelector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mtkwgb > div > div > div > div > a > span:nth-child(2)`;
        // 料金システム
        const AndBarSystemSelector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > section:nth-child(5) > div:nth-child(2) > div > p`;
        // 営業時間1
        const AndBarBusinessTime1Selector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(${selectorVariable}) > div > div > section:nth-child(1) > div > p:nth-child(1)`;
        // 営業時間2
        const AndBarBusinessTime2Selector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(${selectorVariable}) > div > div > section:nth-child(1) > div > p:nth-child(2)`;
        // 営業時間3
        const AndBarBusinessTime3Selector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(${selectorVariable}) > div > div > section:nth-child(1) > div > p:nth-child(3)`;
        // 営業時間4
        const AndBarBusinessTime4Selector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(${selectorVariable}) > div > div > section:nth-child(1) > div > p:nth-child(4)`;
        // 営業時間5
        const AndBarBusinessTime5Selector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(${selectorVariable}) > div > div > section:nth-child(1) > div > p:nth-child(5)`;
        // 営業時間6
        const AndBarBusinessTime6Selector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(${selectorVariable}) > div > div > section:nth-child(1) > div > p:nth-child(6)`;
        // 営業時間7
        const AndBarBusinessTime7Selector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(${selectorVariable}) > div > div > section:nth-child(1) > div > p:nth-child(7)`;
        // 営業時間8
        const AndBarBusinessTime8Selector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(${selectorVariable}) > div > div > section:nth-child(1) > div > p:nth-child(8)`;
        // 所在地
        const AndBarAddressSelector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div > div.css-mlbouc > div:nth-child(${selectorVariable}) > div > div > section:nth-child(2) > div > p:nth-child(1)`;
        // カテゴリ
        const AndBarCategorySelector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(${selectorVariable}) > div > div > section:nth-child(3) > div`;
        // お店URL
        const AndBarShopUrlSelector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(${selectorVariable}) > div > div > section:nth-child(5) > a > span`;
        // 座席数
        const AndBarSeatSelector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(${selectorVariable}) > div > div > section:nth-child(8) > div`;
        // 個室有無
        const AndBarPrivateRoomSelector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(${selectorVariable}) > div > div > section:nth-child(9) > div`;
        // カウンター
        const AndBarCounterSelector: string = `#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc > div:nth-child(${selectorVariable}) > div > div > section:nth-child(10) > div`;

        // all selectors
        const AndBarSelectors: any = {
          店舗名: AndBarShopnameSelector,
          予算: AndBarBudgetSelector,
          電話番号: AndBarTelephoneSelector,
          料金システム: AndBarSystemSelector,
          営業時間1: AndBarBusinessTime1Selector,
          営業時間2: AndBarBusinessTime2Selector,
          営業時間3: AndBarBusinessTime3Selector,
          営業時間4: AndBarBusinessTime4Selector,
          営業時間5: AndBarBusinessTime5Selector,
          営業時間6: AndBarBusinessTime6Selector,
          営業時間7: AndBarBusinessTime7Selector,
          営業時間8: AndBarBusinessTime8Selector,
          所在地: AndBarAddressSelector,
          カテゴリ: AndBarCategorySelector,
          お店URL: AndBarShopUrlSelector,
          座席数: AndBarSeatSelector,
          個室有無: AndBarPrivateRoomSelector,
          カウンター: AndBarCounterSelector,
        };

        // URLループ
        for (const key of Object.keys(AndBarSelectors)) {
          try {
            // 結果
            let tmpResult: string = "";
            // 0.5秒ウェイト
            await setTimeout(500);

            // 結果収集
            const result: any = await doScrape(AndBarSelectors[key]);
            // 取得結果
            logger.debug(result);

            // 空ならエラー
            if (result != "") {
              // タグあり
              if (regex.test(result)) {
                // タグ除去処理
                tmpResult = result.replace(/(<([^>]+)>)/gi, "");
              } else {
                // そのまま
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
        }
        // 成功数
        successCounter++;
        // 空判定
        const isEmpty =
          Object.keys(myShopObj).length === 0 &&
          myShopObj.constructor === Object;

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
        event.sender.send("statusUpdate", url);
        // 成功進捗更新
        event.sender.send("success", successCounter);
        // 失敗進捗更新
        event.sender.send("fail", failCounter);
      }
    }

    // CSVファイル名
    const nowtime: string = `${dir_desktop}\\${new Date()
      .toISOString()
      .replace(/[^\d]/g, "")
      .slice(0, 14)}.csv`;
    // csvdata
    const csvData = stringify(finalResultArray, { header: true });
    // 書き出し
    await writeFile(nowtime, iconv.encode(csvData, "shift_jis"));
    logger.info("CSV writing finished");
    // ウィンドウを閉じる
    await puppScraper.doClose();
    // 終了メッセージ
    showmessage("info", "取得が終わりました");
  } catch (e: unknown) {
    // エラー型
    if (e instanceof Error) {
      // エラー処理
      logger.error(e.message);
    }
  }
});

// スクレイピング
ipcMain.on("scrapeurl", async (event: any, arg: any) => {
  try {
    logger.info("ipc: scrape mode");
    // もっと見るセレクタ
    let seemoreSelector: string = "";
    // 成功数
    let successCounter: number = 0;
    // 失敗数
    let failCounter: number = 0;
    // ページ数
    let pageCounter: number = 1;
    // 総件数
    let totalNumber: any = 0;
    // スクレイパー初期化
    await puppScraper.init();
    // 対象URL
    const targetURL: string = ANDBAR_FIXED_URL + String(arg);
    // トップへ
    await puppScraper.doGo(targetURL);
    logger.debug(`app: scraping ${targetURL}`);
    // 1秒ウェイト
    await setTimeout(1000);

    // ページが存在する
    if (await puppScraper.doCheckSelector(AndBarTotalSelector)) {
      // 結果収集
      totalNumber = await doScrape(AndBarTotalSelector);
      // 合計数を送る
      event.sender.send("total", Number(totalNumber));
      console.log("1: " + totalNumber);
    }

    // 連番配列
    const numbers: number[] = [...Array(totalNumber)].map((_, i) => i + 1);

    console.log("2: " + numbers);

    // 収集ループ
    for (let i = 1; i < totalNumber + 1; i++) {
      try {
        // 0.5秒ウェイト
        await setTimeout(500);

        // ページMAX
        if (i % PAGE_COUNT == 0) {
          if (i / PAGE_COUNT == 1) {
            seemoreSelector = AndBarSeemoreSelector;
          } else {
            seemoreSelector = AndBarSeemoreNextSelector;
          }
          // もっと見るクリック
          await puppScraper.doClick(seemoreSelector);
          logger.debug("app: seamore clicked");
          // 0.5秒ウェイト
          await setTimeout(500);
          // ページ数
          pageCounter++;
        }
        // 下までスクロール
        await puppScraper.mouseWheel();
        logger.debug(`app: scrolling...`);
        // 取得URL
        const tmpUrl: any = await doScrapeUrl((i % PAGE_COUNT) + 1);

        // 取得失敗
        if (tmpUrl == "") {
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
        event.sender.send("success", successCounter);
        // 失敗進捗更新
        event.sender.send("fail", failCounter);
      }
    }
    // 現在時刻
    const nowtime: string = `${dir_desktop}\\${new Date()
      .toISOString()
      .replace(/[^\d]/g, "")
      .slice(0, 14)}`;
    // CSVファイル名
    const targetpath: string = `${nowtime}_url.csv`;
    // CSV書き出し
    await makeCsvData(finalCsvArray, targetpath);
    // 終了メッセージ
    showmessage("info", "取得が終わりました");
  } catch (e: unknown) {
    // エラー型
    if (e instanceof Error) {
      // エラー処理
      logger.error(e.message);
    }
  }
});

// スクレイピング停止
ipcMain.on("pause", async (_: any, arg: any) => {
  try {
    logger.info("ipc: pause mode");
    // CSVパス
    let targetpath: string = "";
    // CSVデータ
    let targetCsvArray: any = [];
    // 質問項目
    const options: Electron.MessageBoxSyncOptions = {
      type: "question",
      title: "質問",
      message: "停止",
      detail: "停止してよろしいですか？これまでのデータはCSVに書き出されます。",
      buttons: ["はい", "いいえ"],
      cancelId: -1, // Escで閉じられたときの戻り値
    };
    // 選んだ選択肢
    const selected: number = dialog.showMessageBoxSync(options);

    // はいを選択
    if (selected == 0) {
      // 現在時刻
      const nowtime: string = `${dir_desktop}\\${new Date()
        .toISOString()
        .replace(/[^\d]/g, "")
        .slice(0, 14)}`;

      // URL
      if (arg == "url") {
        // 対象CSV
        targetCsvArray = finalCsvArray;
        // 開店CSVファイル名
        targetpath = `${nowtime}_url.csv`;
      } else if (arg == "shop") {
        // 対象CSV
        targetCsvArray = finalResultArray;
        // 開店CSVファイル名
        targetpath = `${nowtime}.csv`;
      }
      // CSV作成
      await makeCsvData(targetCsvArray, targetpath);
      // 終了メッセージ
      showmessage("info", "処理を中断しました");
    } else {
      // いいえならそのまま閉じる
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
ipcMain.on("exit", async () => {
  try {
    logger.info("ipc: exit mode");
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

// 店舗情報スクレイピング
const doScrape = async (selector: string): Promise<any> => {
  return new Promise(async (resolve, _) => {
    try {
      // 0.2秒ウェイト
      await setTimeout(200);

      // セレクタあり
      if (selector !== "") {
        // 取得url
        const tmpValues: any = await puppScraper.doSingleEval(
          selector,
          "innerHTML"
        );
        // 結果
        resolve(tmpValues.trim());
      }
    } catch (e) {
      logger.error(e);
      // エラー
      resolve("");
    }
  });
};

// URLスクレイピング
const doScrapeUrl = async (num: number): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      // URLセレクタ
      const AndBarDetailSelector: string = `#root > div:nth-child(2) > div > section > div.css-1q8fput > div.css-9hqybf > div.css-11yd8q > ul > li:nth-child(${num}) > span > div.css-48hjcm > a`;
      // 0.5秒ウェイト
      await setTimeout(500);

      // ページが存在する
      if (await puppScraper.doCheckSelector(AndBarDetailSelector)) {
        // 0.5秒ウェイト
        await setTimeout(500);
        // 一時url
        const tmpUrl: any = await puppScraper.doSingleEval(
          AndBarDetailSelector,
          "href"
        );
        logger.info(`scraping: ${tmpUrl}`);
        // 成功
        resolve(tmpUrl);
      } else {
        logger.error("no selector.");
        // 失敗
        reject("");
      }
    } catch (e) {
      logger.error(e);
      reject("");
    }
  });
};

// CSV抽出
const getCsvData = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    try {
      logger.info("func: getCsvData mode");
      // ファイル選択ダイアログ
      dialog
        .showOpenDialog({
          properties: ["openFile"], // ファイル
          title: CHOOSE_FILE, // ファイル選択
          defaultPath: ".", // ルートパス
          filters: [
            { name: "csv(Shif-JIS)", extensions: ["csv"] }, // csvのみ
          ],
        })
        .then(async (result) => {
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
        })
        .catch((err: unknown) => {
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
};

// CSV抽出
const makeCsvData = (arr: any[], filename: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      logger.info("func: makeCsvData mode");
      // csvデータ
      const csvData: any = stringify(arr, { header: true });
      // 書き出し
      await writeFile(filename, iconv.encode(csvData, "shift_jis"));
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
};

// メッセージ表示
const showmessage = async (type: string, message: string): Promise<void> => {
  try {
    // モード
    let tmpType: "none" | "info" | "error" | "question" | "warning" | undefined;
    // タイトル
    let tmpTitle: string | undefined;

    // urlセット
    switch (type) {
      // 通常モード
      case "info":
        tmpType = "info";
        tmpTitle = "情報";
        break;

      // エラーモード
      case "error":
        tmpType = "error";
        tmpTitle = "エラー";
        break;

      // 警告モード
      case "warning":
        tmpType = "warning";
        tmpTitle = "警告";
        break;

      // それ以外
      default:
        tmpType = "none";
        tmpTitle = "";
    }

    // オプション
    const options: Electron.MessageBoxOptions = {
      type: tmpType, // タイプ
      message: tmpTitle, // メッセージタイトル
      detail: message, // 説明文
    };
    // ダイアログ表示
    dialog.showMessageBox(options);
  } catch (e: unknown) {
    // エラー型
    if (e instanceof Error) {
      // エラー
      logger.error(e.message);
    }
  }
};

// アプリ終了
const exitApp = (): void => {
  try {
    logger.info("ipc: exit mode");
    // 質問項目
    const options: Electron.MessageBoxSyncOptions = {
      type: "question",
      title: "質問",
      message: "終了",
      detail: "終了してよろしいですか？これまでのデータは破棄されます。",
      buttons: ["はい", "いいえ"],
      cancelId: -1, // Escで閉じられたときの戻り値
    };
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
};
