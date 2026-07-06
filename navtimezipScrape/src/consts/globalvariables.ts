/**
 * globalvariables.ts
 **
 * function：global variables
**/

/** const */
export namespace myConst {
  export const DEV_FLG: boolean = true;
  export const COMPANY_NAME = "ebisudo";
  export const APP_NAME = "navtimescrape";
  export const CSV_ENCODING: string = "SJIS";
  export const LOG_LEVEL: string = 'all';
}

/** selector */
export namespace mySelector {
  // addressinput selector
  export const navtimeInputSelector: string = "#keyword-form > input[type=search]";
  // send button selector
  export const navtimeSendButtonSelector: string = "#keyword-form > button";
  // address url selector
  export const navtimeUrlSelector: string = "#address-area > ul > li > a";
  // zipcode selector
  export const navtimeZipcodeSelector: string = "#postcode-area > div > div.postcode";
}

/** columns */
export namespace myColumns {
  // navtime columns
  export const navtimeColumns: string[] = ["address", "zipcode"];
}

