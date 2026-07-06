/**
 * globalvariables.ts
 **
 * function：global variables
 **/

/** const */
export namespace myConst {
  export const DEV_FLG: boolean = true;
  export const APP_NAME: string = "gaykamaScraper";
  export const COMPANY_NAME: string = 'Ebisudo';
  export const CSV_ENCODING: string = "SJIS";
  export const GAYKAMA_BASE: string = "https://gaykama.com/";
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

/** selector */
export namespace mySelector {
  // gaykama hit selector
  export const gaykamaTotalSelector: string = "#sub_selector > div > ul > li.active > a";
  // gaykama shopname selector
  export const gaykamaMainShopnameSelector: string = "#shop_info_table > tbody > tr:nth-child(1) > td";
  // gaykama area selector
  export const gaykamaAreaSelector: string = "#shop_info_table > tbody > tr:nth-child(2) > td";
  // gaykama genre selector
  export const gaykamaGenreSelector: string = "#shop_info_table > tbody > tr:nth-child(3) > td";
  // gaykama address selector
  export const gaykamaAddressSelector: string = "#shop_info_table > tbody > tr:nth-child(4) > td";
  // gaykama telephone selector
  export const gaykamaTelephoneSelector: string = "#shop_info_table > tbody > tr:nth-child(5) > td";
  // gaykama businesstime selector
  export const gaykamaBusinesstimeSelector: string = "#shop_info_table > tbody > tr:nth-child(6) > td";
  // gaykama holiday selector
  export const gaykamaHolidaySelector: string = "#shop_info_table > tbody > tr:nth-child(7) > td";
}

export namespace pageSelector {
  export const shopurl = (num: number): string => {
    return `#shop-list > div > div.bottom > div > ul.all > li:nth-child(${num}) > div > h5 > a`;
  }
}

export namespace pageColumn {
  // gaykama csvColumns
  export const csvColumns: string[] = ['url', 'shopname', 'area', 'genre', 'address', 'shopphone', 'businesstime', 'holiday'];
}
