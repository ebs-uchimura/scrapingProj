/**
 * ElCsv.ts
 *
 * name：ElCsv
 * function：CSV operation for electron
 * updated: 2025/04/14
 **/
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// define modules
const electron_1 = require("electron"); // electron
const promises_1 = require("node:fs/promises"); // file system
const sync_1 = require("csv-parse/sync"); // csv parser
const sync_2 = require("csv-stringify/sync"); // csv stringify
const iconv_lite_1 = __importDefault(require("iconv-lite")); // encoding
// CSV class
class CSV {
    // construnctor
    constructor(encoding, logger) {
        // getCsvData
        this.getCsvData = (filenames) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    CSV.logger.info('csv: getCsvData mode');
                    // filename exists
                    if (filenames.length) {
                        // read file
                        const data = yield (0, promises_1.readFile)(filenames[0]);
                        // encoding
                        const str = iconv_lite_1.default.decode(data, CSV.defaultencoding);
                        // csv parse
                        const tmpRecords = (0, sync_1.parse)(str, {
                            columns: false, // no column
                            from_line: 2, // ignore first line
                            skip_empty_lines: true // ignore empty cell
                        });
                        console.log(tmpRecords);
                        CSV.logger.info('csv: getCsvData finished');
                        // resolve
                        resolve({
                            record: tmpRecords, // dataa
                            filename: filenames[0] // filename
                        });
                    }
                    else {
                        // nofile, exit
                        reject();
                    }
                }
                catch (e) {
                    // error
                    console.log(e);
                    reject();
                }
            }));
        });
        // makeCsvData
        this.makeCsvData = (arr, columns, filename) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    CSV.logger.info('csv: makeCsvData mode');
                    // csvdata
                    const csvData = (0, sync_2.stringify)(arr, { header: true, columns: columns });
                    // write to csv file
                    yield (0, promises_1.writeFile)(filename, iconv_lite_1.default.encode(csvData, 'shift_jis'));
                    // complete
                    resolve();
                }
                catch (e) {
                    // error
                    console.log(e);
                    reject();
                }
            }));
        });
        // showCSVDialog
        this.showCSVDialog = (mainWindow) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    CSV.logger.info('csv: showCSVDialog mode');
                    // options
                    const dialogOptions = {
                        properties: ['openFile'], // file open
                        title: 'choose csv file', // header title
                        defaultPath: '.', // default path
                        filters: [
                            { name: 'csv(Shif-JIS)', extensions: ['csv'] } // filter
                        ]
                    };
                    // show file dialog
                    electron_1.dialog
                        .showOpenDialog(mainWindow, dialogOptions)
                        .then((result) => {
                        // file exists
                        if (result.filePaths.length > 0) {
                            // resolved
                            resolve(result.filePaths);
                            // no file
                        }
                        else {
                            // rejected
                            reject(result.canceled);
                        }
                    })
                        .catch((err) => {
                        // error
                        console.log(err);
                        // rejected
                        reject('error');
                    });
                }
                catch (e) {
                    // error
                    console.log(e);
                    // error type
                    if (e instanceof Error) {
                        reject('error');
                    }
                }
            }));
        });
        // DB config
        CSV.defaultencoding = encoding;
        // logger setting
        CSV.logger = logger;
        CSV.logger.info('csv: initialize mode');
    }
}
// export module
exports.default = CSV;
