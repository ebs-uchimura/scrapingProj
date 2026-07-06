/**
 * globalvariables.ts
 **
 * function：global variables
 **/

/** const */
export namespace myConst {
  export const DEV_FLG: boolean = true;
  export const APP_NAME: string = "hosrikuScraper";
  export const COMPANY_NAME: string = 'Ebisudo';
  export const CSV_ENCODING: string = "SJIS";
  export const HOSRIKU_BASE: string = "https://hosuriku.com/";
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
  // hosriku selector
  export const hosRikuUrlSelector: string = "#sp_wrapper > section.RecruitList_recruit_list__sq9d9 > ul.Recruit_recruit__LT5Iw > li:nth-child(1) > div > div > a";
  // hosriku hit selector
  export const hosRikuTotalSelector: string = "#sp_wrapper > section.RecruitList_recruit_list__sq9d9 > div > ul > li:nth-child(3)";
  // hosriku shopname selector
  export const hosRikuMainShopnameSelector: string = "#sp_wrapper > section > section > div.RecruitHead_recruit_head_name__RVHzV > div.Shop_shop_name__tTvpS > span:nth-child(1)";
  // hosriku businesstime selector
  export const hosRikuBusinesstimeSelector: string = "#shop_detail > div:nth-child(5) > dl:nth-child(1) > dd";
  // hosriku holiday selector
  export const hosRikuHolidaySelector: string = "#recruit_detail > div > dl:nth-child(6) > dd";
  // hosriku address selector
  export const hosRikuAddressSelector: string = "#shop_detail > div:nth-child(5) > dl:nth-child(3) > dd";
  // hosriku telephone selector
  export const hosRikuTelephoneSelector: string = "#web_entry > div > div.WebEntry_contact__ag5xo > ul > li:nth-child(3) > a > div.WebEntry_apply_box__yGOjc > div.WebEntry_apply_data__EDPTk";
}

export namespace pageSelector {
  export const shopurl = (num: number): string => {
    return `#sp_wrapper > section.RecruitList_recruit_list__sq9d9 > ul.Recruit_recruit__LT5Iw > li:nth-child(${num}) > div > div > a`;
  }
}


