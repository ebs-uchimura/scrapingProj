/**
 * mysqlModule.ts
 *
 * module：MYSQL用
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
exports.insertData = exports.updateData = exports.selectDoubleJoinAsset = exports.selectJoinAsset = exports.selectAsset = exports.countAssets = void 0;
// 名前空間 
const globalvariables_1 = require("../consts/globalvariables");
/// 初期設定
// モジュール
const path = __importStar(require("node:path")); // パス用
const dotenv_1 = require("dotenv"); // 環境情報
const ElLogger_1 = __importDefault(require("../class/ElLogger")); // ログ用
const ElMySqlJoin0612_1 = __importDefault(require("../class/ElMySqlJoin0612")); // sql用
// 環境変数
(0, dotenv_1.config)({ path: path.join(__dirname, '../.env') });
// ロガー
const logger = new ElLogger_1.default(globalvariables_1.myConst.COMPANY_NAME, globalvariables_1.myConst.APP_NAME, 'all');
// DB設定
const myDB = new ElMySqlJoin0612_1.default(process.env.SQL_HOST, // ホスト名
process.env.SQL_ADMINUSER, // ユーザ名
process.env.SQL_ADMINPASS, // ユーザパスワード
Number(process.env.SQL_PORT), // ポートNO
process.env.SQL_KEYDBNAME, // DB名
logger);
/* count */
// アセット数カウント
const countAssets = (table, columns, data) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            logger.debug('mysql: countAssets mode');
            // 対象データ
            const assetCountArgs = {
                table: table, // テーブル
                columns: columns, // カラム
                values: data, // 値
            };
            // 対象データ取得
            const targetUserCount = yield myDB.countDB(assetCountArgs);
            // ユーザ数
            resolve(targetUserCount);
            logger.debug('mysql: countAssets end');
        }
        catch (e) {
            logger.error(e);
            // error
            reject(e);
        }
    }));
});
exports.countAssets = countAssets;
/* select */
// アセット選択
const selectAsset = (table, columns, values, limit, order, fields, reverse, spanflg) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            logger.debug('mysql: selectAsset mode');
            // 対象データ
            let assetSelectArgs = {
                table: table, // テーブル
                columns: columns, // カラム
                values: values, // 値
                limit: limit, // 上限
                order: order, // 順番
                reverse: reverse,
                fields: fields, // 選択カラム
            };
            // 範囲指定
            if (spanflg) {
                assetSelectArgs.spanval = 1;
                assetSelectArgs.spancol = 'created_at';
                assetSelectArgs.spandirection = 'after';
                assetSelectArgs.spanunit = 'hour';
            }
            // 対象データ取得
            const targetAssetData = yield myDB.selectDB(assetSelectArgs);
            // 結果
            if (targetAssetData == 'error') {
                // DBエラー
                throw new Error('mysql: selectAsset error');
            }
            else if (targetAssetData == 'empty') {
                // ヒットなし
                resolve([]);
                logger.debug('mysql: selectAsset empty');
            }
            else {
                // 結果
                resolve(targetAssetData);
                logger.debug('mysql: selectAsset end');
            }
        }
        catch (e) {
            logger.error(e);
            // error
            reject(e);
        }
    }));
});
exports.selectAsset = selectAsset;
// アセット連結選択
const selectJoinAsset = (table, jointable, columns, values, joincolumns, joinvalues, limit, order, ordertable, fields, reverse) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            logger.debug('mysql: selectJoinAsset mode');
            // 対象データ
            const selectJoinAssetObj = {
                table: table, // テーブル
                columns: columns, // カラム
                values: values, // 値
                originid: `${jointable}_id`, // 元テーブルID
                jointable: jointable, // 連結テーブル
                joincolumns: joincolumns, // 連結カラム
                joinvalues: joinvalues, // 値
                joinid: 'id', // 連結ID
                limit: limit, // 上限
                order: order, // 順番
                ordertable: ordertable, // 順番テーブル
                reverse: reverse,
                fields: fields, // 対象カラム
            };
            // 該当ユーザ抽出
            const selectedJoinAssetData = yield myDB.selectJoinDB(selectJoinAssetObj);
            // 結果
            if (selectedJoinAssetData == 'error') {
                // DBエラー
                throw new Error('mysql: selectJoinAsset error');
            }
            else if (selectedJoinAssetData == 'empty') {
                // ヒットなし
                resolve([]);
                logger.debug('mysql: selectJoinAsset empty');
            }
            else {
                // 成功
                resolve(selectedJoinAssetData);
                logger.debug('mysql: selectJoinAsset end');
            }
        }
        catch (e) {
            logger.error(e);
            // error
            reject(e);
        }
    }));
});
exports.selectJoinAsset = selectJoinAsset;
// アセット選択
const selectDoubleJoinAsset = (table, jointable1, jointable2, columns, values, joincolumns1, joinvalues1, joincolumns2, joinvalues2, fields, reverse) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            logger.debug('mysql: selectDoubleJoinAsset mode');
            // 対象データ
            const selectJoinAssetObj = {
                table: table, // テーブル
                columns: columns, // カラム
                values: values, // 値
                originid1: `${jointable1}_id`,
                originid2: `${jointable2}_id`,
                jointable1: jointable1, // 連結テーブル1
                jointable2: jointable2, // 連結テーブル2
                joincolumns1: joincolumns1, // 連結カラム1
                joincolumns2: joincolumns2, // 連結カラム2
                joinvalues1: joinvalues1, // 連結値1
                joinvalues2: joinvalues2, // 連結値2
                joinid1: `id`, // 連結ID1
                joinid2: 'id', // 連結ID2
                reverse: reverse,
                fields: fields, // 対象カラム
            };
            // 該当ユーザ抽出
            const selectedJoinAssetData = yield myDB.selectDoubleJoinDB(selectJoinAssetObj);
            // 結果
            if (selectedJoinAssetData == 'error') {
                // DBエラー
                throw new Error('mysql: selectDoubleJoinAsset error');
            }
            else if (selectedJoinAssetData == 'empty') {
                // ヒットなし
                resolve([]);
                logger.debug('mysql: selectDoubleJoinAsset empty');
            }
            else {
                // 成功
                resolve(selectedJoinAssetData);
                logger.debug('mysql: selectDoubleJoinAsset end');
            }
        }
        catch (e) {
            logger.error(e);
            // error
            reject(e);
        }
    }));
});
exports.selectDoubleJoinAsset = selectDoubleJoinAsset;
/* update */
// アセット更新
const updateData = (table, selColumns, selData, setColumns, setData) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            logger.debug('mysql: updateData mode');
            // 対象データ
            const updateAssetArgs = {
                table: table, // テーブル
                setcol: setColumns, // 準備完了
                setval: setData, // 待機状態
                selcol: selColumns, // 対象
                selval: selData, // 対象値
            };
            // 更新処理
            const updateUserResult = yield myDB.updateDB(updateAssetArgs);
            // 結果
            if (updateUserResult == 'error') {
                // エラー
                throw new Error('mysql: updateData error');
            }
            else if (updateUserResult == 'empty') {
                // 対象なし
                logger.debug('mysql: updateData empty');
            }
            // 成功
            resolve(updateUserResult);
            logger.debug('mysql: updateData end');
        }
        catch (e) {
            logger.error(e);
            // error
            reject();
        }
    }));
});
exports.updateData = updateData;
/* insert */
// アセット更新
const insertData = (table, columns, data) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            logger.debug('mysql: insertData mode');
            // 対象データ
            const insertDataArgs = {
                table: table, // テーブル
                columns: columns, // カラム
                values: data, // 値
            };
            // インサートID
            const insertedTokenId = yield myDB.insertDB(insertDataArgs);
            // 結果
            if (insertedTokenId == 'error' || insertedTokenId == 'empty') {
                // エラー
                throw new Error('mysql: insert error');
            }
            // 成功
            resolve(insertedTokenId);
            logger.debug('mysql: insertData end');
        }
        catch (e) {
            logger.error(e);
            // error
            reject();
        }
    }));
});
exports.insertData = insertData;
