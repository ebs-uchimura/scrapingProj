/**
 * globalvariables.ts
 **
 * function：global variables
 **/

/** const */
export namespace myConst {
  export const DEV_FLG: boolean = false;
  export const APP_NAME: string = "tabelogScraper-omochi";
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
  // Tabelog introduction header selector
  export const tabeLogMainIntroductionHeadSelector: string = "#column-main > div.pr-comment-wrap > h3";
  // Tabelog introduction selector
  export const tabeLogMainIntroductionSelector: string = "#column-main > div.pr-comment-wrap > div";
  // Tabelog mainshopname selector
  export const tabeLogMainShopnameSelector: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(1) > td";
  // Tabelog detail selector1
  export const tabelLogDetailSelector1: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(2) > td";
  // Tabelog detail selector2
  export const tabelLogDetailSelector2: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(3) > td";
  // Tabelog detail selector3
  export const tabelLogDetailSelector3: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(4) > td";
  // Tabelog detail selector4
  export const tabelLogDetailSelector4: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(5) > td";
  // Tabelog detail selector5
  export const tabelLogDetailSelector5: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(6) > td";
  // Tabelog detail selector6
  export const tabelLogDetailSelector6: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td";
  // Tabelog detail selector7
  export const tabelLogDetailSelector7: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(8) > td";
  // Tabelog detail selector8
  export const tabelLogDetailSelector8: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(9) > td";
  // Tabelog detail selector9
  export const tabelLogDetailSelector9: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(10) > td";
  // Tabelog detail selector10
  export const tabelLogDetailSelector10: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(11) > td";
  // Tabelog detail selector11
  export const tabelLogDetailSelector11: string =
    "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(12) > td";
  // Tabelog seat selector
  export const tabeLogSeatSelector: string =
    "#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(1) > td > p:nth-child(1)";
  // Tabelog menu selector1
  export const tabeLogMenu1Selector: string =
    "#rst-data-head > table:nth-child(6) > tbody > tr:nth-child(1) > td";
  // Tabelog menu selector2
  export const tabeLogMenu2Selector: string =
    "#rst-data-head > table:nth-child(6) > tbody > tr:nth-child(2) > td";
  // Tabelog menu selector3
  export const tabeLogMenu3Selector: string =
    "#rst-data-head > table:nth-child(6) > tbody > tr:nth-child(3) > td";
  // Tabelog official account selector1
  export const tabeLogOfficialAccount1Selector: string =
    "#rst-data-head > table:nth-child(9) > tbody > tr:nth-child(4) > td";
  // Tabelog official account selector2
  export const tabeLogOfficialAccount2Selector: string =
    "#rst-data-head > table:nth-child(9) > tbody > tr:nth-child(5) > td";
}

/** columns */
export namespace myArrays {
  export const columns: string[] = [
    "url", // url
    "introductionHead", // introduction head
    "introduction", // introduction
    "shopname", // shopname
    "detail1", // detail1
    "detail2", // detail2
    "detail3", // detail3
    "detail4", // detail4
    "detail5", // detail5
    "detail6", // detail6
    "detail7", // detail7
    "detail8", // detail8
    "detail9", // detail9
    "detail10", // detail10
    "detail11", // detail11
    "seat", // seats
    "menu1", // menu1
    "menu2", // menu2
    "menu3", // menu3
    "official1", // officialAccount1
    "official2", // officialAccount2
  ];
}

