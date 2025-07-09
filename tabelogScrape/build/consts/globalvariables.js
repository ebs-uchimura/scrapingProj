"use strict";
/**
 * globalvariables.ts
 **
 * function：global variables
 **/
Object.defineProperty(exports, "__esModule", { value: true });
exports.myArrays = exports.mySelector = exports.myCategories = exports.myProperties = exports.myWindows = exports.myConst = void 0;
/** const */
var myConst;
(function (myConst) {
    myConst.COMPANY_NAME = "ebisudo";
    myConst.APP_NAME = "tabelogScraper";
    myConst.CSV_ENCODING = "SJIS";
    myConst.TABELOG_BASE = "https://tabelog.com/";
    myConst.LOG_LEVEL = 'all';
})(myConst || (exports.myConst = myConst = {}));
var myWindows;
(function (myWindows) {
    myWindows.WINDOW_WIDTH = 1200;
    myWindows.WINDOW_HEIGHT = 1000;
})(myWindows || (exports.myWindows = myWindows = {}));
var myProperties;
(function (myProperties) {
    myProperties.WAIT_SECOND = 1000;
    myProperties.PAGE_LIMIT = 1200;
})(myProperties || (exports.myProperties = myProperties = {}));
var myCategories;
(function (myCategories) {
    myCategories.GENRES = ['washoku', 'RC02', 'chinese', 'RC04', 'nabe', 'RC21', 'RC98', 'RC13', 'curry', 'ramen', 'cafe', 'sweets', 'pan', 'BC01', 'ZZ99'];
})(myCategories || (exports.myCategories = myCategories = {}));
/** selector */
var mySelector;
(function (mySelector) {
    // Tabelog selector
    mySelector.tabeLogUrlSelector = ".list-rst__rst-name-target";
    // Tabelog category selector
    mySelector.tabeLogCategoryUrlSelector = ".list-rst__rst-name-wrap > h3 > a";
    // Tabelog hit selector
    mySelector.tabeLogTotalSelector = "#container > div.rstlist-contents.clearfix > div.flexible-rstlst > div.flexible-rstlst-main > div.list-controll.clearfix > div > span:nth-child(4)";
    // Tabelog hit selector
    mySelector.tabeLogGenreTotalSelector = "#container > div.rstlist-contents.clearfix > div.flexible-rstlst > div > div.list-controll.clearfix > div:nth-child(2) > div > span:nth-child(4) > strong";
    // Tabelog genre selector
    mySelector.tabelLogGenreSelector = "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(2) > td > span";
    // Tabelog mainshopname selector
    mySelector.tabeLogMainShopnameSelector = "#rstdtl-head > div.rstdtl-header > section > div.rdheader-title-data > div.rdheader-rstname-wrap > div > h2 > span";
    // Tabelog mainshopname ruby selector
    mySelector.tabeLogMainShopnameRubySelector = "#rstdtl-head > div.rstdtl-header > section > div.rdheader-title-data > div.rdheader-rstname-wrap > div > span";
    // Tabelog station selector
    mySelector.tabeLogStationSelector = "#rstdtl-head > div.rstdtl-header > section > div.rdheader-info-data > div > div > div:nth-child(1) > dl.rdheader-subinfo__item.rdheader-subinfo__item--station > dd > div > div.linktree__parent > a > span";
    // Tabelog subshopname selector
    mySelector.tabeLogMainSubshopname = "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(1) > td > div > span";
    // Tabelog reserve telephone selector
    mySelector.tabeLogReservephoneSelector = "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(3) > td > p > strong";
    // Tabelog reservable selector
    mySelector.tabeLogReservableSelector = "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(4) > td > p";
    // Tabelog address1 selector
    mySelector.tabeLogAddress1Selector = "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(5) > td > p > span:nth-child(1)";
    // Tabelog address2 selector
    mySelector.tabeLogAddress2Selector = "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(5) > td > p > span:nth-child(2)";
    // Tabelog businesstime monday selector
    mySelector.tabeLogBusinesstimeMonSelector = "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(1) > ul > li";
    // Tabelog businesstime tuesday selector
    mySelector.tabeLogBusinesstimeTueSelector = "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(2) > ul > li";
    // Tabelog businesstime wednesday selector
    mySelector.tabeLogBusinesstimeWedSelector = "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(3) > ul > li";
    // Tabelog businesstime thursday selector
    mySelector.tabeLogBusinesstimeThuSelector = "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(4) > ul > li";
    // Tabelog businesstime friday selector
    mySelector.tabeLogBusinesstimeFriSelector = "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(5) > ul > li";
    // Tabelog businesstime saturday selector
    mySelector.tabeLogBusinesstimeSatSelector = "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(6) > ul > li";
    // Tabelog businesstime sunday selector
    mySelector.tabeLogBusinesstimeSunSelector = "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > ul > li:nth-child(7) > ul > li";
    // Tabelog businesstime holiday selector
    mySelector.tabeLogBusinesstimeHolSelector = "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(7) > td > div > ul > li";
    // Tabelog payment card selector
    mySelector.tabeLogPaymentCardSelector = "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(10) > td > div:nth-child(1) > p";
    // Tabelog payment electronic mony selector
    mySelector.tabeLogPaymentElSelector = "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(10) > td > div:nth-child(2) > p";
    // Tabelog payment code selector
    mySelector.tabeLogPaymentCodeSelector = "#rst-data-head > table:nth-child(2) > tbody > tr:nth-child(10) > td > div:nth-child(3) > p";
    // Tabelog sheet selector
    mySelector.tabeLogSheetSelector = "#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(1) > td > p";
    // Tabelog reserve limit selector
    mySelector.tabeLogReserveLimitSelector = "#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(2) > td > p";
    // Tabelog privateroom selector
    mySelector.tabeLogPrivateRoomSelector = "#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(3) > td > p";
    // Tabelog rental selector
    mySelector.tabeLogRentalSelector = "#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(4) > td > p:nth-child(1)";
    // Tabelog smoking selector
    mySelector.tabeLogSmokingSelector = "#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(5) > td";
    // Tabelog parking selector
    mySelector.tabeLogParkingSelector = "#rst-data-head > table:nth-child(4) > tbody > tr:nth-child(6) > td";
    // Tabelog alldrink selector
    mySelector.tabeLogAlldrinkSelector = "#rst-data-head > table:nth-child(6) > tbody > tr:nth-child(1) > td > p";
    // Tabelog homepage selector
    mySelector.tabeLogHomepageSelector = "#rst-data-head > table:nth-child(9) > tbody > tr:nth-child(5) > td > p > a > span";
    // Tabelog telephone selector
    mySelector.tabeLogTelephoneSelector = "#rst-data-head > table:nth-child(9) > tbody > tr:nth-child(6) > td > p > strong";
    // Tabelog telephone2 selector
    mySelector.tabeLogTelephone2Selector = "#rst-data-head > table:nth-child(9) > tbody > tr:nth-child(5) > td > p > strong";
})(mySelector || (exports.mySelector = mySelector = {}));
/** columns */
var myArrays;
(function (myArrays) {
    myArrays.columns = [
        "shopname", // shopname
        "shopnameruby", // shopname ruby
        "station", // station
        "shopname2", // shopname2
        "genre", // genre
        "telephone", // telephone
        "reservable", // reservable
        "address1", // address1
        "address2", // address2
        "monday", // monday
        "tuesday", // tuesday
        "wednesday", // wednesday
        "thursday", // thursday
        "friday", // friday
        "saturday", // saturday
        "sunday", // sunday
        "holiday", // holiday
        "creditcard", // creditcard
        "electronicmoney", // electronic money
        "codepayment", // code payment
        "seat", // seat
        "capacity", // capacity
        "privateroom", // privateroom
        "vip", // vip
        "smoking", // smoking
        "parking", // parking
        "alldrink", // alldrink
        "homepage", // homepage
        "shopphone", // shopphone
        "shopphone2", // shopphone2
    ];
    // columns
    myArrays.urls = [
        "url1", // url1
        "url2", // url2
        "url3", // url3
        "url4", // url4
        "url5", // url5
        "url6", // url6
        "url7", // url7
        "url8", // url8
        "url9", // url9
        "url10", // url10
        "url11", // url11
        "url12", // url12
        "url13", // url13
        "url14", // url14
        "url15", // url15
        "url16", // url16
        "url17", // url17
        "url18", // url18
        "url19", // url19
        "url20", // url20
    ];
    // categories
    myArrays.categories = [
        'sushi', 'japanese', 'seafood', 'RC0105', 'tempura', 'RC0125', 'RC0106', 'RC0107', 'RC0121', 'RC0104', 'RC0123', 'RC0124', 'RC0109', 'RC0111', 'RC0108', 'RC0199', 'RC0209', 'RC0201', 'french', 'italian', 'spain', 'RC0219', 'RC0220', 'RC0301', 'RC0305', 'RC0306', 'RC0307', 'gyouza', 'RC0309', 'RC0310', 'RC0303', 'RC0499', 'korea', 'RC0402', 'RC0403', 'RC0404', 'RC0411', 'RC0412', 'RC1201', 'RC1203', 'RC1205', 'yakiniku', 'horumon', 'RC1302', 'RC1408', 'motsu', 'RC1404', 'RC1401', 'RC1406', 'RC1402', 'izakaya', 'RC2102', 'RC2105', 'RC2103', 'RC2104', 'RC9801', 'RC9802', 'RC9803', 'RC9804', 'RC9805', 'RC9806', 'RC9807', 'RC9808', 'RC9809', 'viking', 'RC9811', 'RC9812', 'MC0101', 'MC0130', 'MC0131', 'MC0132', 'MC0133', 'MC0134', 'MC0135', 'SC1001', 'kissaten', 'SC1003', 'SC1004', 'SC1005', 'SC1006', 'SC1007', 'SC1008', 'tapioca', 'SC0210', 'SC0201', 'cake', 'SC0213', 'SC0214', 'SC0215', 'SC0216', 'SC0217', 'SC0218', 'SC0219', 'SC0202', 'SC0221', 'SC0222', 'SC0223', 'SC0224', 'SC0225', 'SC0226', 'SC0203', 'SC0228', 'SC0229', 'SC0230', 'SC0101', 'SC0102', 'SC0103', 'BC0101', 'BC0102', 'BC0103', 'BC0104', 'BC0105', 'BC0106', 'BC0107', 'ryokan', 'YC0102', 'ZZ9999'
    ];
})(myArrays || (exports.myArrays = myArrays = {}));
