/**
 * ELMkdir.ts
 *
 * name：ELMkdir
 * function：Mkdir operation for electron
 * updated: 2025/03/01
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
Object.defineProperty(exports, "__esModule", { value: true });
// define modules
const fs_1 = require("fs"); // file system
// file system definition
const { mkdir } = fs_1.promises;
// Mkdir class
class Mkdir {
    // construnctor
    constructor(logger) {
        // mkDir
        this.mkDir = (dir) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, _) => __awaiter(this, void 0, void 0, function* () {
                try {
                    Mkdir.logger.debug('mkdir: mkdir started.');
                    // not exists
                    if (!(0, fs_1.existsSync)(dir)) {
                        // make dir
                        yield mkdir(dir);
                        Mkdir.logger.debug('mkdir: mkdir completed.');
                    }
                    else {
                        Mkdir.logger.debug('already exists.');
                    }
                    resolve();
                }
                catch (err) {
                    // error
                    Mkdir.logger.error(err);
                    resolve();
                }
            }));
        });
        // mkDirAll
        this.mkDirAll = (dirs) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve1, _) => __awaiter(this, void 0, void 0, function* () {
                try {
                    Mkdir.logger.debug('mkdir: all mkdir started.');
                    // make all dir
                    Promise.all(dirs.map((dir) => __awaiter(this, void 0, void 0, function* () {
                        return new Promise((resolve2, _) => __awaiter(this, void 0, void 0, function* () {
                            try {
                                // not exists
                                if (!(0, fs_1.existsSync)(dir)) {
                                    // make dir
                                    yield mkdir(dir);
                                    resolve2();
                                }
                                else {
                                    // error
                                    throw Error('already exists.');
                                }
                            }
                            catch (err) {
                                // error
                                resolve2();
                            }
                        }));
                    }))).then(() => resolve1());
                    Mkdir.logger.debug('mkdir: mkDirAll started.');
                    // make dir
                }
                catch (e) {
                    // error
                    Mkdir.logger(e);
                    resolve1();
                }
            }));
        });
        // logger setting
        Mkdir.logger = logger;
        Mkdir.logger.debug('mkdir: mkdir initialized.');
    }
}
// export module
exports.default = Mkdir;
