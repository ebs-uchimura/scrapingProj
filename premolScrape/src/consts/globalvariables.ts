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

/** selector */
export namespace mySelector {
  // Tabelog selector
  export const tabeLogUrlSelector: string = ".list-rst__rst-name-target";
  // ShopName
  export const targetShopName: string = '#gc > div.shop_header > div.sic > div.shop_info_block > div.sit > a > h2';
  // ShopGenre
  export const targetShopGenre: string = '#gc > div.shop_header > div.sic > div.shop_info_block > div.sit > a > p';
  // CloseStation
  export const targetShopCloseStation: string = '#gc > div.shop_header > div.sic > div.shop_info_block > div.shop_info_access_budget > p.shop_nearest_station > span';
  // ShopBudget
  export const targetShopBudget: string = '#gc > div.shop_header > div.sic > div.shop_info_block > div.shop_info_access_budget > p.shop_budget > span';
  // PhoneNumber
  export const targetPhoneNumber: string = '#gc > div.shop_container > div.shop_container__main > div.shop_data > div.shop_info > table > tbody > tr:nth-child(1) > td > div.pc_item_block > span';
  // ShopAddress
  export const targetShopAddress: string = '#gc > div.shop_container > div.shop_container__main > div.shop_data > div.shop_info > table > tbody > tr:nth-child(2) > td > div.pc_item_block > div > p.link_address > a';
  // BusinessTime
  export const targetShopBusinessTime: string = '#gc > div.shop_container > div.shop_container__main > div.shop_data > div.shop_info > table > tbody > tr:nth-child(4) > td';
  // ShopHoliday
  export const targetShopHoliday: string = '#gc > div.shop_container > div.shop_container__main > div.shop_data > div.shop_info > table > tbody > tr:nth-child(5) > td';
  // ShopSheet
  export const targetShopSheet: string = '#gc > div.shop_container > div.shop_container__main > div.shop_data > div.shop_info > table > tbody > tr:nth-child(7) > td';
}

/** columns */
export namespace myArrays {
  // columns
  export const columns: string[] = [
    'shopname', // shopname
    'genre', // genre
    'station', // station
    'budget', // budget
    'shopphone', // shopphone
    'address', // address
    'businesstime', // business time
    'holiday', // holiday
    'seat', // seat
  ];

  // columns
  export const urlcolumns: string[] = [
    'url', // url
  ];
}