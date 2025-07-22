/**
 * globalvariables.ts
 **
 * function：global variables
 **/

/** const */
export namespace myConst {
  export const DEV_FLG: boolean = false;
  export const PAGE_COUNT: number = 10;
  export const APP_NAME: string = 'pepperScraper';
  export const COMPANY_NAME: string = 'Ebisudo';
  export const CSV_ENCODING: string = 'SJIS';
  export const PEPPER_BASE: string = 'https://andbar.net/map/?prefecture=';
  export const LOG_LEVEL: string = 'all';
}

export namespace myWindows {
  export const WINDOW_WIDTH: number = 1200;
  export const WINDOW_HEIGHT: number = 1000;
}

export namespace myColumn {
  export const columns: { [key: string]: string } = {
    url: 'url', // url
    shopname: 'shopname', // shopname
    budget: 'budget', // budget
    telephone: 'telephone', // telephone
    address: 'address', // address
    system: 'system', // system
    businesstime1: 'businesstime1', // businesstime1
    businesstime2: 'businesstime2', // businesstime2
    businesstime3: 'businesstime3', // businesstime3
    businesstime4: 'businesstime4', // businesstime4
    businesstime5: 'businesstime5', // businesstime5
    businesstime6: 'businesstime6', // businesstime6
    businesstime7: 'businesstime7', // businesstime7
    businesstime8: 'businesstime8', // businesstime8
    info2: 'info2', // info2
    info3: 'info3', // info3
    info4: 'info4', // info4
    info5: 'info5', // info5
    info6: 'info6', // info6
    info7: 'info7', // info7
    info8: 'info8', // info8
    info9: 'info9', // info9
    info10: 'info10', // info10
    info11: 'info11', // info11
    info12: 'info12', // info12
    info13: 'info13', // info13
    info14: 'info14', // info14
  };
  export const urlColumns: { [key: string]: string } = {
    url: 'URL', // url
  }
}

/** selector */
export namespace mySelector {
  // see more
  export const AndBarSeemoreSelector: string =
    '#root > div:nth-child(2) > div > section > div.css-1q8fput > div.css-9hqybf > div.css-11yd8q > nav > div > p > i';
  export const AndBarSeemoreNextSelector: string =
    '#root > div:nth-child(2) > div > section > div.css-1q8fput > div.css-9hqybf > div.css-11yd8q > nav > div > p:nth-child(3)';
  // total
  export const AndBarTotalSelector: string =
    '#root > div:nth-child(2) > div > section > div.css-lr6r9q > p > span';
  // test
  export const AndBarTestSelector: string = '#root > div.css-sbhcw1 > section.css-3m41uf > div.css-a5gbi7 > div.css-mlbouc';
}

/** columns */
export namespace myArrays {
  export const columns: string[] = [
    '電話番号', // 電話
    '店名1', // 店名1
    'エリア', // エリア
    '店名2', // 店名2
    'ジャンル', // ジャンル
    '住所', // 住所
    'アクセス', // アクセス
    '営業時間', // 営業時間
  ];
}
