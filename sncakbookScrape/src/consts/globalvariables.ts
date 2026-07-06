/**
 * globalvariables.ts
 **
 * function：global variables
 **/

/** const */
// my const
export namespace myConst {
  export const DEV_FLG: boolean = false;
  export const APP_NAME: string = "snackbookScraper";
  export const COMPANY_NAME: string = 'Ebisudo';
  export const CSV_ENCODING: string = "SJIS";
  export const SNACKBOOK_BASE: string = "https://snsn.jp/";
  export const LOG_LEVEL: string = 'all';
}

// window size
export namespace myWindows {
  export const WINDOW_WIDTH: number = 1200;
  export const WINDOW_HEIGHT: number = 1000;
}

// properties
export namespace myProperties {
  export const WAIT_MILLSECOND: number = 100;
  export const WAIT_SECOND: number = 1000;
  export const PAGE_LIMIT: number = 1200;
  export const PAGE_NUMBER: number = 30;
}

// column titles
export namespace pageColumn {
  // gaykama csvColumns
  export const csvColumns: string[] = ['url', 'shopname', 'area', 'businesstime', 'holiday', 'shopphone', 'address'];
}

/** selector */
// my selector
export namespace mySelector {
  // snackbook hit selector
  export const snackbookTotalSelector: string = "body > main > div > section > div.page-nation > p > span.__total";
  // snackbook header selector
  export const snackbookHeaderSelector: string = "body > main > div > section > h2";
  // snackbook first url selector
  export const snackbookFirstUrlSelector: string = "body > main > div > section > div.snk-card.snk-card--business > div.snk-card__header > div.snk-card__title > h3 > a";
  // snackbook shopname selector
  export const snackbookMainShopnameSelector: string = "body > main > article > div.snk-fv > div > div.snk-fv__info-box--left > h1";
  // snackbook area selector
  export const snackbookAreaSelector: string = "body > main > article > div:nth-child(4) > div.snk-basic > table > tbody > tr:nth-child(2) > td";
  // snackbook businesstime selector
  export const snackbookBusinesstimeSelector: string = "body > main > article > div:nth-child(4) > div.snk-basic > table > tbody > tr:nth-child(3) > td";
  // snackbook holiday selector
  export const snackbookHolidaySelector: string = "body > main > article > div:nth-child(4) > div.snk-basic > table > tbody > tr:nth-child(4) > td";
  // snackbook holiday selector
  export const snackbookShopUrlSelector: string = "body > main > div > section > div > div.snk-card__header > div.snk-card__title > h3 > a";
  // snackbook address selector
  export const snackbookAddressSelector: string = "#snk-map > p.snk-map__address";
  // snackbook telephone selector
  export const snackbookTelephoneSelector: string = "#snk-map > div.snk-fv__tel > a";
}
