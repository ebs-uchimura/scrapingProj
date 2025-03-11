"use strict";
/**
 * ElectronCsv.ts
 *
 * name：CSV
 * function：CSV operation for electron
 * updated: 2025/1/19
 **/
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
const fs_1 = require("fs"); // file system
const sync_1 = require("csv-parse/sync"); // csv parser
const sync_2 = require("csv-stringify/sync"); // csv 
const iconv_lite_1 = __importDefault(require("iconv-lite")); // encoding
const encoding_japanese_1 = __importDefault(require("encoding-japanese")); // encoding
// file system definition
const { readFile, writeFile } = fs_1.promises;
const CHOOSE_FILE = "読み込むCSV選択してください。"; // file dialog
// CSV class
class CSV {
    // construnctor
    constructor(encoding) {
        // getCsvData
        this.getCsvData = (filenames) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    // filename exists
                    if (filenames.length) {
                        // read file
                        const data = yield readFile(filenames[0]);
                        // char encoding not correct
                        if (encoding_japanese_1.default.detect(data) == CSV.defaultencoding) {
                            console.log(`${encoding_japanese_1.default.detect(data)}`);
                            throw new Error(`data is not ${CSV.defaultencoding}`);
                        }
                        // encoding
                        const str = iconv_lite_1.default.decode(data, CSV.defaultencoding);
                        // csv parse
                        const tmpRecords = (0, sync_1.parse)(str, {
                            columns: false, // no column
                            from_line: 2, // ignore first line
                            skip_empty_lines: true, // ignore empty cell
                        });
                        console.log(`you got csv named ${data}`);
                        // resolve
                        resolve({
                            record: tmpRecords, // dataa
                            filename: filenames[0], // filename
                        });
                    }
                    else {
                        // rejected
                        throw new Error('error');
                    }
                }
                catch (e) {
                    // error type
                    if (e instanceof Error) {
                        // error
                        console.log(e.message);
                    }
                    reject();
                }
            }));
        });
        // CSV
        this.getCsvDataDialog = () => {
            return new Promise((resolve, reject) => {
                try {
                    console.log("func: getCsvData mode");
                    // file select dialog
                    electron_1.dialog
                        .showOpenDialog({
                        properties: ["openFile"], // file
                        title: CHOOSE_FILE, // select file
                        defaultPath: ".", // path
                        filters: [
                            { name: "csv(Shif-JIS)", extensions: ["csv"] }, // csv
                        ],
                    })
                        .then((result) => __awaiter(this, void 0, void 0, function* () {
                        // file path
                        const filenames = result.filePaths;
                        // file exists
                        if (filenames.length) {
                            // read csv file
                            const csvdata = yield readFile(filenames[0]);
                            // decode
                            const str = iconv_lite_1.default.decode(csvdata, CSV.defaultencoding);
                            // csv parse
                            const tmpRecords = (0, sync_1.parse)(str, {
                                columns: false, // no column
                                from_line: 2, // ignore start line
                                skip_empty_lines: true, // ignore blank
                            });
                            // return value
                            resolve({
                                record: tmpRecords, // data
                                filename: filenames[0], // file name
                            });
                        }
                        else {
                            // throw error
                            throw new Error(result.canceled);
                        }
                    }))
                        .catch((err) => {
                        // error
                        if (err instanceof Error) {
                            // show error message
                            console.log(err.message);
                        }
                        // rejected
                        throw new Error('error');
                    });
                }
                catch (e) {
                    // error
                    if (e instanceof Error) {
                        // show error message
                        console.log(e.message);
                    }
                    reject();
                }
            });
        };
        // makeCsvData
        this.makeCsvData = (arr, columns, filename) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    console.log('func: makeCsvData mode');
                    // csvdata
                    const csvData = (0, sync_2.stringify)(arr, { header: true, columns: columns });
                    // write to csv file
                    yield writeFile(filename, iconv_lite_1.default.encode(csvData, CSV.defaultencoding));
                    // complete
                    resolve();
                }
                catch (e) {
                    // error type
                    if (e instanceof Error) {
                        // error
                        console.log(e.message);
                    }
                    reject();
                }
            }));
        });
        // showCSVDialog
        this.showCSVDialog = (mainWindow) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    // options
                    const dialogOptions = {
                        properties: ['openFile'], // file open
                        title: 'choose csv file', // header title
                        defaultPath: '.', // default path
                        filters: [
                            { name: 'csv(Shif-JIS)', extensions: ['csv'] } // filter
                        ],
                    };
                    // show file dialog
                    electron_1.dialog.showOpenDialog(mainWindow, dialogOptions).then((result) => {
                        // file exists
                        if (result.filePaths.length > 0) {
                            // resolved
                            resolve(result.filePaths);
                            // no file
                        }
                        else {
                            // rejected
                            throw new Error(result.canceled);
                        }
                    }).catch((e) => {
                        // error type
                        if (e instanceof Error) {
                            // error
                            console.log(e.message);
                        }
                        // rejected
                        throw new Error('error');
                    });
                }
                catch (e) {
                    // error type
                    if (e instanceof Error) {
                        // error
                        console.log(e.message);
                    }
                    reject('error');
                }
            }));
        });
        console.log('csv: initialize mode');
        // DB config
        CSV.defaultencoding = encoding;
    }
}
// export module
exports.default = CSV;
