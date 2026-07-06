/**
 * globalvariables.ts
 **
 * function：global variables
 **/

/** const */
export namespace myConst {
  export const DEV_FLG: boolean = true;
  export const APP_NAME: string = "hosparaScraper";
  export const COMPANY_NAME: string = 'Ebisudo';
  export const CSV_ENCODING: string = "SJIS";
  export const HOSPARA_BASE: string = "https://hostjob.jp/";
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
  // hospara selector
  export const hosParaUrlSelector: string = "body > div > main > div.bgGray > section > div.results__columnBox > div.results__columnLeft > ul > li:nth-child(1) > div.shopList__itemHead > div > a";
  // hosPara hit selector
  export const hosParaTotalSelector: string = "body > div > main > div.bgGray > section > div.results__head > p > span > span";
  // hosPara shopname selector
  export const hosParaMainShopnameSelector: string = ".information__descItem";
  // hosPara businesstime selector
  export const hosParaBusinesstimeSelector: string = ".information__desc ul li";
  // hosPara holiday selector
  export const hosParaHolidaySelector: string = ".show__infoDesc";
  // hosPara address selector
  export const hosParaAddressSelector: string = ".js-address";
  // hosPara telephone selector
  export const hosParaTelephoneSelector: string = ".js-store-tel-tap";
}

export namespace pageSelector {
  export const shopurl = (num: number): string => {
    return `body > div > main > div.bgGray > section > div.results__columnBox > div.results__columnLeft > ul > li:nth-child(${num}) > div.shopList__itemHead > div > a`;
  }
}


