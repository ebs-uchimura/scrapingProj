/**
 * globalvariables.ts
 **
 * function：global variables
 **/

/** const */
export namespace myConst {
  export const DEV_FLG: boolean = false;
  export const APP_NAME: string = "pepperScraper";
  export const COMPANY_NAME: string = 'Ebisudo';
  export const CSV_ENCODING: string = "SJIS";
  export const pepper_BASE: string = "https://hotpepper.jp/";
  export const LOG_LEVEL: string = 'info';
}

export namespace myWindows {
  export const WINDOW_WIDTH: number = 1200;
  export const WINDOW_HEIGHT: number = 1000;
}

export namespace myProperties {
  export const WAIT_SECOND: number = 100;
  export const PAGE_LIMIT: number = 1200;
}

/** selector */
export namespace mySelector {
  // phone link selector
  export const phoneLinkSelector: string = "#shopHeaderWrapper > div > div.shopHeaderContents.pr > div.shopHeaderContentsInner > div.shopHeaderContentsBtn > p > a";
  // phone selector
  export const phoneSelector: string = "#containerWrap > div > div > div.mainContent > div > div.storeTelephoneWrap > p";
  // url selector
  export const pepperUrlSelector: string = "#basicSearchForm > div.contentWrapper.cf > div.mainContent > div:nth-child(8) > div > div > div > div > div > div.shopDetailCoreInner.cf > div.shopDetailText > h3 > a";
  // pepper totalnumber selector
  export const pepperTotalNumSelector: string =
    "#basicSearchForm > div.contentWrapper.cf > div.mainContent > div.searchResultWrap.cf > div > p > span.fcLRed.bold.fs18.padLR3";
  // pepper phoenumber selector
  export const pepperPhoneNumberSelector: string =
    "#containerWrap > div > div > div.mainContent > div > div.storeTelephoneWrap > p";
  // pepper mainshopname selector
  export const pepperMainShopnameSelector: string =
    "#shopHeaderWrapper > div > div.shopHeaderContents.pr > div.shopHeaderContentsInner > div.shopHeaderContentsInfo > div.shopHeaderLogoTitleWrap > div > div.shopNameBlock > h1";
  // pepper genre selector
  export const pepperGenreSelector: string =
    "#shopHeaderWrapper > div > div.shopHeaderContents.pr > div.shopHeaderContentsInner > div.shopHeaderContentsInfo > div.shopInfoInnerSectionWrap > ul > li:nth-child(2) > dl > dd:nth-child(2) > p > a"
  // pepper area selector
  export const pepperAreaSelector: string =
    "#shopHeaderWrapper > div > div.shopHeaderContents.pr > div.shopHeaderContentsInner > div.shopHeaderContentsInfo > div.shopInfoInnerSectionWrap > ul > li:nth-child(3) > dl > dd:nth-child(2) > p > a"
  // pepper mainshopname selector
  export const pepperSubShopnameSelector: string =
    "#mainContentsWrapSecond > div.shopInner.meiryoFont > div:nth-child(2) > table > tbody > tr:nth-child(1) > td";
  // pepper address selector
  export const pepperAddressSelector: string =
    "#mainContentsWrapSecond > div.shopInner.meiryoFont > div:nth-child(2) > table > tbody > tr:nth-child(2) > td";
  // pepper access selector
  export const pepperAccessSelector: string =
    "#mainContentsWrapSecond > div.shopInner.meiryoFont > div:nth-child(4) > table > tbody > tr:nth-child(3) > td";
  // pepper businesstime selector
  export const pepperBusinesstimeSelector: string = "#mainVisual > div:nth-child(4) > div";
  // pepper budget
  export const pepperBudgetSelector: string =
    "#mainContentsWrapSecond > div.shopInner.meiryoFont > div:nth-child(4) > table > tbody > tr:nth-child(9) > td";
  // pepper seatnum
  export const pepperSeatnumSelector: string =
    "#mainContentsWrapSecond > div.shopInner.meiryoFont > div:nth-child(4) > table > tbody > tr:nth-child(1) > td";
}

/** columns */
export namespace myArrays {
  export const columns: string[] = [
    "電話番号", // 電話
    "店名1", // 店名1
    "エリア", // エリア
    "店名2", // 店名2
    "ジャンル", // ジャンル
    "住所", // 住所
    "アクセス", // アクセス
    "営業時間", // 営業時間
  ];
}

/** myPrefNos */
export namespace myPrefNos {
  export const prefs: any = {
    1: "SA41",
    2: "SA51",
    3: "SA52",
    4: "SA53",
    5: "SA54",
    6: "SA55",
    7: "SA56",
    8: "SA15",
    9: "SA16",
    10: "SA17",
    11: "SA13",
    12: "SA14",
    13: "SA11",
    14: "SA12",
    15: "SA61",
    16: "SA62",
    17: "SA63",
    18: "SA64",
    19: "SA65",
    20: "SA66",
    21: "SA31",
    22: "SA32",
    23: "SA33",
    24: "SA34",
    25: "SA21",
    26: "SA22",
    27: "SA23",
    28: "SA24",
    29: "SA25",
    30: "SA26",
    31: "SA71",
    32: "SA72",
    33: "SA73",
    34: "SA74",
    35: "SA75",
    36: "SA81",
    37: "SA82",
    38: "SA83",
    39: "SA84",
    40: "SA91",
    41: "SA92",
    42: "SA93",
    43: "SA94",
    44: "SA95",
    45: "SA96",
    46: "SA97",
    47: "SA98",
  }
}