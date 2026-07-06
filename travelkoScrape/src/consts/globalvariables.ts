/**
 * globalvariables.ts
 **
 * function：global variables
 **/

/** const */
export namespace myConst {
  export const DEV_FLG: boolean = false;
  export const APP_NAME: string = "travelkoScraper";
  export const COMPANY_NAME: string = 'Ebisudo';
  export const CSV_ENCODING: string = "SJIS";
  export const TRAVELKO_BASE: string = "https://www.tour.ne.jp/j_hotel/list/";
  export const PAGE_NUMBER: number = 30;
  export const TOTAL_PAGES: number = 339;
  export const LOG_LEVEL: string = 'silly';
}

export namespace myWindows {
  export const WINDOW_WIDTH: number = 1200;
  export const WINDOW_HEIGHT: number = 1000;
}

export namespace myProperties {
  export const WAIT_MILLSECOND: number = 100;
  export const WAIT_SECOND: number = 1000;
}

/** selector */
export namespace urlSelector {
  // Travelko url selector
  export const travelkoDataUrlSelector: string = "section.search-result-item> div.search-result-item-header > div.search-result-item-header-inner > div.search-result-item-header-col > h2 > a";
}

export namespace hotelSelector {
  // Travelko hotelname selector
  export const travelkoHotelNameSelector: string = "#Area_hotel_name";
  // Travelko address selector
  export const travelkoHotelAddressSelector: string = "#Area_hotel_map_box > ul > li:nth-child(1) > div:nth-child(2)";
  // Travelko homepage selector
  export const travelkoHotelHomepageSelector: string = "#Area_hotel_map_box > ul > li:nth-child(3) > div:nth-child(2) > a";
  // Travelko telephone selector
  export const travelkoHotelTelephoneSelector: string = "#Area_hotel_map_box > ul > li:nth-child(2) > div:nth-child(2) > b";
}

/** columns */
export namespace myArrays {
  // url columns
  export const urlcolumns: string[] = [
    "url", // official url
  ];
  // hotel columns
  export const hotelcolumns: string[] = [
    "url", // official url
    "hotelname", // official hotelname
    "address", // official address
    "homepage", // official homepage
    "telephone", // official telephone
  ];
}

