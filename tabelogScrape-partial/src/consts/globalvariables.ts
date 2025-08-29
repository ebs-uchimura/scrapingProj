/**
 * globalvariables.ts
 **
 * function：global variables
 **/

/** const */
export namespace myConst {
  export const DEV_FLG: boolean = false;
  export const APP_NAME: string = "tabelogScraper";
  export const COMPANY_NAME: string = 'Ebisudo';
  export const CSV_ENCODING: string = "SJIS";
  export const TABELOG_BASE: string = "https://tabelog.com/";
  export const LOG_LEVEL: string = 'all';
}

export namespace myWindows {
  export const WINDOW_WIDTH: number = 1200;
  export const WINDOW_HEIGHT: number = 1000;
}

export namespace myProperties {
  export const WAIT_MILLSECOND: number = 100;
  export const WAIT_SECOND: number = 1000;
  export const PAGE_LIMIT: number = 1200;
}

export namespace myCategories {
  export const CATEGORIES: string[] = ['washoku', 'RC02', 'chinese', 'RC04', 'curry', 'RC13', 'nabe', 'RC21', 'RC98', 'ramen', 'cafe', 'sweets', 'pan', 'BC01', 'YC01', 'ZZ99'];
  export const GENRES: string[] = [
    'sushi', 'japanese', 'seafood', 'RC0105', 'tempura', 'RC0125', 'RC0106', 'RC0107', 'RC0121', 'RC0104', 'RC0123', 'RC0124', 'RC0109', 'RC0111', 'RC0108', 'RC0199', 'RC0209', 'RC0201', 'french', 'italian', 'spain', 'RC0219', 'RC0220', 'RC0301', 'RC0305', 'RC0306', 'RC0307', 'gyouza', 'RC0309', 'RC0310', 'RC0303', 'RC0499', 'korea', 'RC0402', 'RC0403', 'RC0404', 'RC0411', 'RC0412', 'RC1201', 'RC1203', 'RC1205', 'yakiniku', 'horumon', 'RC1302', 'RC1408', 'motsu', 'RC1404', 'RC1401', 'RC1406', 'RC1402', 'izakaya', 'RC2102', 'RC2105', 'RC2103', 'RC2104', 'RC9801', 'RC9802', 'RC9803', 'RC9804', 'RC9805', 'RC9806', 'RC9807', 'RC9808', 'RC9809', 'viking', 'RC9811', 'RC9812', 'MC0101', 'MC0130', 'MC0131', 'MC0132', 'MC0133', 'MC0134', 'MC0135', 'SC1001', 'kissaten', 'SC1003', 'SC1004', 'SC1005', 'SC1006', 'SC1007', 'SC1008', 'tapioca', 'SC0210', 'SC0201', 'cake', 'SC0213', 'SC0214', 'SC0215', 'SC0216', 'SC0217', 'SC0218', 'SC0219', 'SC0202', 'SC0221', 'SC0222', 'SC0223', 'SC0224', 'SC0225', 'SC0226', 'SC0203', 'SC0228', 'SC0229', 'SC0230', 'SC0101', 'SC0102', 'SC0103', 'BC0101', 'BC0102', 'BC0103', 'BC0104', 'BC0105', 'BC0106', 'BC0107', 'ryokan', 'YC0102', 'ZZ9999'];
}

/** selector */
export namespace mySelector {

  // Tabelog selector
  export const tabeLogUrlSelector: string = ".list-rst__rst-name-target";
  // Tabelog category selector
  export const tabeLogCategoryUrlSelector: string = ".list-rst__rst-name-wrap > h3 > a";
  // Tabelog hit selector
  export const tabeLogTotalSelector: string = "#container > div.rstlist-contents.clearfix > div.flexible-rstlst > div.flexible-rstlst-main > div.list-controll.clearfix > div > span:nth-child(4)";
  // Tabelog hit selector
  export const tabeLogGenreTotalSelector: string = "#container > div.rstlist-contents.clearfix > div.flexible-rstlst > div > div.list-controll.clearfix > div:nth-child(2) > div > span:nth-child(4) > strong";
  // Tabelog mainshopname selector
  export const tabeLogMainShopnameSelector: string =
    "#rstdtl-head > div.rstdtl-header > section > div.rdheader-title-data > div.rdheader-rstname-wrap > div > h2 > span";
  // Tabelog station selector
  export const tabeLogStationSelector: string =
    "#rstdtl-head > div.rstdtl-header > section > div.rdheader-info-data > div > div > div:nth-child(1) > dl.rdheader-subinfo__item.rdheader-subinfo__item--station > dd > div > div.linktree__parent > a > span";
  // Tabelog subshopname selector
  export const tabeLogMainSubshopname: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(1) > td";
  // Tabelog genre selector
  export const tabelLogGenreSelector: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(2) > td > span";
  // Tabelog reserve telephone selector
  export const tabeLogReservephoneSelector: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(3) > td > p > strong";
  // Tabelog address1 selector
  export const tabeLogAddress1Selector: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(5) > td > p > span:nth-child(1)";
  // Tabelog address2 selector
  export const tabeLogAddress2Selector: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(5) > td > p > span:nth-child(2)";
  // Tabelog address3 selector
  export const tabeLogAddress3Selector: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(5) > td > p > span:nth-child(3)";
  // Tabelog businesstime selector
  export const tabeLogBusinesstimeSelector: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td";
  // Tabelog sheet selector
  export const tabeLogSheetSelector: string =
    "#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(1) > td > p";
  // Tabelog homepage selector
  export const tabeLogHomepageSelector: string =
    "#rst-data-head > table:nth-child(9) > tbody > tr:nth-child(5) > td > p > a > span";
  // Tabelog telephone selector
  export const tabeLogTelephoneSelector: string =
    "#rst-data-head > table:nth-child(9) > tbody > tr:nth-child(6) > td > p > strong";
  // Tabelog telephone2 selector
  export const tabeLogTelephone2Selector: string =
    "#rst-data-head > table:nth-child(9) > tbody > tr:nth-child(5) > td > p > strong";
  // Tabelog selector
  export const errorUrlSelector: string = "#contents > div > div.error-common.error-common--404 > h2";
}

/** columns */
export namespace myArrays {
  export const columns: string[] = [
    "shopname", // shopname
    "station", // station
    "shopname2", // shopname2
    "genre", // genre
    "telephone", // telephone
    "address1", // address1
    "address2", // address2
    "address3", // address3
    "businesstime", // businesstime
    "homepage", // homepage
    "shopphone", // shopphone
    "shopphone2", // shopphone2
  ];
}

export namespace myPrefectures {
  export const duplicateNos: { [key: string]: number[] } = {
    'hokkaido': [1, 2],
    'aomori': [],
    'iwate': [],
    'miyagi': [],
    'akita': [],
    'yamagata': [],
    'fukushima': [],
    'ibaraki': [],
    'tochigi': [],
    'gunma': [],
    'saitama': [],
    'chiba': [],
    'tokyo': [],
    'kanagawa': [1, 2],
    'niigata': [],
    'toyama': [],
    'ishikawa': [],
    'fukui': [],
    'yamanashi': [],
    'nagano': [],
    'gifu': [],
    'shizuoka': [],
    'aichi': [],
    'mie': [],
    'shiga': [],
    'kyoto': [1, 2, 3, 4, 5],
    'osaka': [1, 2, 3],
    'hyogo': [1],
    'nara': [],
    'wakayama': [],
    'tottori': [],
    'shimane': [],
    'okayama': [],
    'hiroshima': [],
    'yamaguchi': [],
    'tokushima': [],
    'kagawa': [],
    'ehime': [],
    'kochi': [],
    'fukuoka': [1, 4],
    'saga': [],
    'nagasaki': [],
    'kumamoto': [],
    'oita': [],
    'miyazaki': [],
    'kagoshima': [],
    'okinawa': [],
  }
}
