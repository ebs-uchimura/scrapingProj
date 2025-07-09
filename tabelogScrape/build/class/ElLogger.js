/**
 * ElLogger.ts
 *
 * name：ElLogger
 * function：Logging operation for electron
 * updated: 2025/05/17
 **/
'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//* Constants
const globalvariables_1 = require("../consts/globalvariables");
// define modules
const path = __importStar(require("path")); // path
const electron_1 = require("electron"); // electron
const electron_log_1 = __importDefault(require("electron-log")); // Logger
// Logger class
class ELLogger {
    // construnctor
    constructor(logname, level) {
        // debug
        this.debug = (message) => {
            electron_log_1.default.debug(message);
        };
        // inquire
        this.info = (message) => {
            electron_log_1.default.info(message);
        };
        // empty or not
        this.error = (e) => {
            if (e instanceof Error) {
                // error
                electron_log_1.default.error(process.pid, e.stack);
            }
        };
        // log dir path
        const dirpath = path.join(electron_1.app.getPath('home'), globalvariables_1.myConst.COMPANY_NAME, globalvariables_1.myConst.APP_NAME);
        // Logger config
        const prefix = getNowDate(0);
        // filename tmp
        electron_log_1.default.transports.file.fileName = `${logname}.log`;
        // filename tmp
        electron_log_1.default.transports.console.format =
            '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
        // set production
        electron_log_1.default.transports.console.level = level;
        // set production
        electron_log_1.default.transports.file.level = level;
        // filename now
        const curr = electron_log_1.default.transports.file.fileName;
        // file saving path
        electron_log_1.default.transports.file.resolvePathFn = () => `${dirpath}/${prefix}_${curr}`;
    }
}
// get now date
const getNowDate = (diff) => {
    // now
    const d = new Date();
    // combine date string
    const prefix = d.getFullYear() +
        ('00' + (d.getMonth() + 1)).slice(-2) +
        ('00' + (d.getDate() + diff)).slice(-2);
    return prefix;
};
// export module
exports.default = ELLogger;
