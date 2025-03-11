/**
 * Logger.ts
 *
 * name：Logger
 * function：Logging operation
 * updated: 2024/09/28
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
Object.defineProperty(exports, "__esModule", { value: true });
// define modules
const log4js = __importStar(require("log4js")); // Logger
const path = __importStar(require("path")); // path
// Logger class
class Logger {
    // construnctor
    constructor(dirpath) {
        // logger init
        this.initialize = (level) => {
            Logger.logger.level = level;
        };
        // log info
        this.info = (message) => {
            Logger.logger.info(message);
        };
        // log error
        this.error = (e) => {
            // error
            if (e instanceof Error) {
                // error
                Logger.logger.error(e.message);
            }
        };
        // log debug info
        this.debug = (message) => {
            Logger.logger.debug(message);
        };
        // log trace info
        this.trace = (message) => {
            Logger.logger.trace(message);
        };
        // shutdown logger
        this.exit = () => {
            log4js.shutdown((err) => {
                if (err)
                    throw err;
                process.exit(0);
            });
        };
        // logger dir path
        Logger.loggerDir = dirpath;
        // Logger config
        const prefix = `${(new Date().toJSON().slice(0, 10))}.log`;
        // logger config
        log4js.configure({
            appenders: {
                app: { type: 'dateFile', filename: path.join(Logger.loggerDir, prefix) },
                out: { type: 'stdout' },
            },
            categories: {
                default: { appenders: ['out', 'app'], level: 'all' }
            }
        });
        // logger instance
        Logger.logger = log4js.getLogger(); // logger instance
    }
}
// export module
exports.default = Logger;
