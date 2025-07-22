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
  export const WAIT_SECOND: number = 1000;
  export const PAGE_LIMIT: number = 1200;
}

export namespace myCategories {
  export const GENRES: string[] = ['washoku', 'RC02', 'chinese', 'RC04', 'curry', 'RC13', 'nabe', 'RC21', 'RC98', 'ramen', 'cafe', 'sweets', 'pan', 'BC01', 'YC01', 'ZZ99'];
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

