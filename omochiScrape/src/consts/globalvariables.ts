/**
 * globalvariables.ts
 **
 * function：global variables
 **/

/** const */
export namespace myConst {
  export const DEV_FLG: boolean = false;
  export const APP_NAME: string = "omochiScraper";
  export const COMPANY_NAME: string = 'Ebisudo';
  export const CSV_ENCODING: string = "SJIS";
  export const LOG_LEVEL: string = 'silly';
}

export namespace myWindows {
  export const WINDOW_WIDTH: number = 800;
  export const WINDOW_HEIGHT: number = 1000;
}

export namespace myProperties {
  export const WAIT_MILLSECOND: number = 100;
  export const WAIT_SECOND: number = 1000;
  export const PAGE_LIMIT: number = 1000;
}

/** selector */
export namespace mySelector {
  // phone link selector
  export const omochiLinkSelector: string = "a.external-article-widget-image";
  // phone link selector
  export const omochiSubLinkSelector: string = "external-article-widget a";
}