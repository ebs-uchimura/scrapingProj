/**
 * MySqlJoin.ts
 *
 * name：SQL
 * function：SQL with Join operation
 * updated: 2025/06/12
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
Object.defineProperty(exports, "__esModule", { value: true });
// define modules
const mysql = __importStar(require("mysql2")); // mysql
// SQL class
class SQL {
    // construnctor
    constructor(host, user, pass, port, db, logger, key) {
        // inquire
        this.doInquiry = (sql, inserts) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, _) => __awaiter(this, void 0, void 0, function* () {
                try {
                    // make query
                    const qry = mysql.format(sql, inserts);
                    // connect ot mysql
                    const promisePool = SQL.pool.promise();
                    // query name
                    const [rows, _] = yield promisePool.query(qry);
                    // empty
                    if (SQL.isEmpty(rows)) {
                        // return error
                        resolve('empty');
                    }
                    else {
                        // result object
                        resolve(rows);
                    }
                }
                catch (e) {
                    // error
                    SQL.logger.error(e);
                    resolve('error');
                }
            }));
        });
        // count db
        this.countDB = (args) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                try {
                    SQL.logger.trace('db: countDB mode');
                    // total
                    let total;
                    // query string
                    let queryString;
                    // array
                    let placeholder;
                    // table
                    const table = args.table;
                    // columns
                    const columns = args.columns;
                    // values
                    const values = args.values;
                    // span (optional)
                    const spanval = (_a = args.spanval) !== null && _a !== void 0 ? _a : null;
                    // spancol (optional)
                    const spancol = (_b = args.spancol) !== null && _b !== void 0 ? _b : null;
                    // spandirection (optional)
                    const spandirection = (_c = args.spandirection) !== null && _c !== void 0 ? _c : null;
                    // spanunit (optional)
                    const spanunit = (_d = args.spanunit) !== null && _d !== void 0 ? _d : null;
                    // col length
                    const colLen = columns.length;
                    // value length
                    const valLen = values.length;
                    // query
                    queryString = 'SELECT COUNT(*) FROM ??';
                    // placeholder
                    placeholder = [table];
                    // if column not null
                    if (colLen > 0 && valLen > 0) {
                        // add where phrase
                        queryString += ' WHERE';
                        // loop for array
                        for (let i = 0; i < colLen; i++) {
                            // add in phrase
                            queryString += ' ?? IN (?)';
                            // push column
                            placeholder.push(columns[i]);
                            // push value
                            placeholder.push(values[i]);
                            // other than last one
                            if (i < colLen - 1) {
                                // add 'and' phrase
                                queryString += ' AND';
                            }
                        }
                    }
                    // if column not null
                    if (spanval && spancol && spanunit && spandirection) {
                        // flg
                        if (spandirection == 'after') {
                            // query
                            queryString += ` AND ?? > date(current_timestamp - interval ? ${spanunit})`;
                        }
                        else if (spandirection == 'before') {
                            // query
                            queryString += ` AND ?? < date(current_timestamp - interval ? ${spanunit})`;
                        }
                        // push span column
                        placeholder.push(spancol);
                        // push span limit
                        placeholder.push(spanval);
                    }
                    // do query
                    yield this.doInquiry(queryString, placeholder)
                        .then((result) => {
                        // result exists
                        if (result == 'error' || result == 'empty') {
                            // initialize total
                            total = 0;
                        }
                        else {
                            // set total
                            total = result[0]['COUNT(*)'];
                        }
                        SQL.logger.trace(`countDB: total is ${total}`);
                        // return total
                        resolve(total);
                    })
                        .catch((err) => {
                        // error type
                        SQL.logger.error(err);
                        resolve(0);
                    });
                }
                catch (e) {
                    // error
                    SQL.logger.error(e);
                    resolve(0);
                }
            }));
        });
        // count join db
        this.countJoinDB = (args) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                try {
                    SQL.logger.trace('db: countjoinDB mode');
                    // total
                    let total;
                    // query string
                    let queryString;
                    // array
                    let placeholder;
                    // table
                    const table = args.table;
                    // columns
                    const columns = args.columns;
                    // values
                    const values = args.values;
                    // jointable
                    const jointable = args.jointable;
                    // joincolumns
                    const joincolumns = args.joincolumns;
                    // joinvalues
                    const joinvalues = args.joinvalues;
                    // joinid1
                    const joinid1 = args.joinid1;
                    // joinid2
                    const joinid2 = args.joinid2;
                    // spantable (optional)
                    const spantable = (_a = args.spantable) !== null && _a !== void 0 ? _a : null;
                    // span (optional)
                    const spanval = (_b = args.spanval) !== null && _b !== void 0 ? _b : null;
                    // spandirection (optional)
                    const spandirection = (_c = args.spandirection) !== null && _c !== void 0 ? _c : null;
                    // spanunit (optional)
                    const spanunit = (_d = args.spanunit) !== null && _d !== void 0 ? _d : null;
                    // col length
                    const colLen = columns.length;
                    // value length
                    const valLen = values.length;
                    // query
                    queryString =
                        'SELECT COUNT(??.id) FROM ?? INNER JOIN ?? ON ??.?? = ??.??';
                    // placeholder
                    placeholder = [
                        table,
                        table,
                        jointable,
                        table,
                        joinid1,
                        jointable,
                        joinid2,
                    ];
                    // if column not null
                    if (colLen > 0 && valLen > 0) {
                        // add where phrase
                        queryString += ' WHERE';
                        // loop for array
                        for (let i = 0; i < colLen; i++) {
                            // add in phrase
                            queryString += ' ??.?? IN (?)';
                            // push table
                            placeholder.push(table);
                            // push column
                            placeholder.push(columns[i]);
                            // push value
                            placeholder.push(values[i]);
                            // other than last one
                            if (i < colLen) {
                                // add and phrase
                                queryString += ' AND';
                            }
                        }
                        // if joincolumn not null
                        if (joincolumns.length > 0) {
                            // loop for array
                            for (let j = 0; j < joincolumns.length; j++) {
                                // add in phrase
                                queryString += ' ??.?? IN (?)';
                                // push table
                                placeholder.push(jointable);
                                // push column
                                placeholder.push(joincolumns[j]);
                                // push value
                                placeholder.push(joinvalues[j]);
                                // other than last one
                                if (j < joincolumns.length - 1) {
                                    // add and phrase
                                    queryString += ' AND';
                                }
                            }
                        }
                    }
                    // if column not null
                    if (spantable && spanval && spanunit && spandirection) {
                        // flg
                        if (spandirection == 'after') {
                            // query
                            queryString += ` AND ${spantable}.?? > date(current_timestamp - interval ? ${spanunit})`;
                        }
                        else if (spandirection == 'before') {
                            // query
                            queryString += ` AND ${spantable}.?? < date(current_timestamp - interval ? ${spanunit})`;
                        }
                        // push span column
                        placeholder.push('created_at');
                        // push span limit
                        placeholder.push(spanval);
                    }
                    // do query
                    yield this.doInquiry(queryString, placeholder)
                        .then((result) => {
                        // result exists
                        if (result == 'error' || result == 'empty') {
                            // initialize total
                            total = 0;
                        }
                        else {
                            // set total
                            total = result[0]['COUNT(`' + table + '`.id)'];
                        }
                        SQL.logger.trace(`countjoinDB: total is ${total}`);
                        // return total
                        resolve(total);
                    })
                        .catch((err) => {
                        // error
                        SQL.logger.error(err);
                        resolve(0);
                    });
                }
                catch (e) {
                    // error
                    SQL.logger.error(e);
                    resolve(0);
                }
            }));
        });
        // select db
        this.selectDB = (args) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h;
                try {
                    SQL.logger.trace('db: selectDB mode');
                    // query string
                    let queryString;
                    // array
                    let placeholder;
                    // table
                    const table = args.table;
                    // columns
                    const columns = args.columns;
                    // values
                    const values = args.values;
                    // fields (optional)
                    const fields = (_a = args.fields) !== null && _a !== void 0 ? _a : null;
                    // span (optional)
                    const spanval = (_b = args.spanval) !== null && _b !== void 0 ? _b : null;
                    // spandirection (optional)
                    const spandirection = (_c = args.spandirection) !== null && _c !== void 0 ? _c : null;
                    // spanunit (optional)
                    const spanunit = (_d = args.spanunit) !== null && _d !== void 0 ? _d : null;
                    // reverse (optional)
                    const reverse = (_e = args.reverse) !== null && _e !== void 0 ? _e : false;
                    // order (optional)
                    const order = (_f = args.order) !== null && _f !== void 0 ? _f : null;
                    // limit (optional)
                    const limit = (_g = args.limit) !== null && _g !== void 0 ? _g : null;
                    // order (optional)
                    const offset = (_h = args.offset) !== null && _h !== void 0 ? _h : null;
                    // col length
                    const colLen = columns.length;
                    // value length
                    const valLen = values.length;
                    // if fields exists
                    if (fields) {
                        // query
                        queryString = 'SELECT ?? FROM ??';
                        // placeholder
                        placeholder = [fields, table];
                    }
                    else {
                        // query
                        queryString = 'SELECT * FROM ??';
                        // placeholder
                        placeholder = [table];
                    }
                    // if column not null
                    if (colLen > 0 && valLen > 0) {
                        // add where phrase
                        queryString += ' WHERE';
                        // loop for array
                        for (let i = 0; i < colLen; i++) {
                            // add in phrase
                            queryString += ' ?? IN (?)';
                            // push column
                            placeholder.push(columns[i]);
                            // push value
                            placeholder.push(values[i]);
                            // other than last one
                            if (i < colLen - 1) {
                                // add 'and' phrase
                                queryString += ' AND';
                            }
                        }
                    }
                    // if column not null
                    if (spanval && spandirection) {
                        // flg
                        if (spandirection == 'after') {
                            // query
                            queryString += ` AND ?? > date(current_timestamp - interval ? ${spanunit})`;
                        }
                        else if (spandirection == 'before') {
                            // query
                            queryString += ` AND ?? < date(current_timestamp - interval ? ${spanunit})`;
                        }
                        // push span column
                        placeholder.push('created_at');
                        // push span limit
                        placeholder.push(spanval);
                    }
                    // query
                    queryString += ' ORDER BY ??';
                    // if reverse
                    if (reverse) {
                        // query
                        queryString += ' ASC';
                    }
                    else {
                        // query
                        queryString += ' DESC';
                    }
                    // if order exists
                    if (order) {
                        // push order key
                        placeholder.push(order);
                    }
                    else {
                        // push default id
                        placeholder.push('id');
                    }
                    // if limit exists
                    if (limit) {
                        // query
                        queryString += ' LIMIT ?';
                        // push limit
                        placeholder.push(limit);
                    }
                    // if offset exists
                    if (offset) {
                        // query
                        queryString += ' OFFSET ?';
                        // push offset
                        placeholder.push(offset);
                    }
                    // do query
                    yield this.doInquiry(queryString, placeholder)
                        .then((result) => {
                        // result exists
                        if (result == 'error' || result == 'empty') {
                            SQL.logger.trace(`selectDB: ${result}`);
                        }
                        else {
                            SQL.logger.trace('selectDB: success');
                        }
                        // do query
                        resolve(result);
                    })
                        .catch((err) => {
                        // error
                        SQL.logger.error(err);
                        resolve('error');
                    });
                }
                catch (e) {
                    // error
                    SQL.logger.error(e);
                    resolve('error');
                }
            }));
        });
        // select db with join
        this.selectJoinDB = (args) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                try {
                    SQL.logger.trace('db: selectjoinDB mode');
                    // query string
                    let queryString;
                    // placeholder
                    let placeholder;
                    // table
                    const table = args.table;
                    // columns
                    const columns = args.columns;
                    // values
                    const values = args.values;
                    // originalid
                    const originid = args.originid;
                    // jointable
                    const jointable = args.jointable;
                    // joincolumns
                    const joincolumns = args.joincolumns;
                    // joinvalues
                    const joinvalues = args.joinvalues;
                    // joinid
                    const joinid = args.joinid;
                    // limit (optional)
                    const limit = (_a = args.limit) !== null && _a !== void 0 ? _a : null;
                    // order (optional)
                    const offset = (_b = args.offset) !== null && _b !== void 0 ? _b : null;
                    // spantable (optional)
                    const spantable = (_c = args.spantable) !== null && _c !== void 0 ? _c : null;
                    // span (optional)
                    const spanval = (_d = args.spanval) !== null && _d !== void 0 ? _d : null;
                    // spandirection (optional)
                    const spandirection = (_e = args.spandirection) !== null && _e !== void 0 ? _e : null;
                    // spanunit (optional)
                    const spanunit = (_f = args.spanunit) !== null && _f !== void 0 ? _f : null;
                    // order (optional)
                    const order = (_g = args.order) !== null && _g !== void 0 ? _g : null;
                    // ordertable (optional)
                    const ordertable = (_h = args.ordertable) !== null && _h !== void 0 ? _h : null;
                    // reverse (optional)
                    const reverse = (_j = args.reverse) !== null && _j !== void 0 ? _j : false;
                    // fields (optional)
                    const fields = (_k = args.fields) !== null && _k !== void 0 ? _k : null;
                    // col length
                    const colLen = columns.length;
                    // joincol length
                    const joincolLen = joincolumns.length;
                    // if fields exists
                    if (fields) {
                        // query
                        queryString = 'SELECT ?? FROM ?? INNER JOIN ?? ON ??.?? = ??.??';
                        // placeholder
                        placeholder = [
                            fields,
                            table,
                            jointable,
                            table,
                            originid,
                            jointable,
                            joinid,
                        ];
                    }
                    else {
                        // query
                        queryString = 'SELECT * FROM ?? INNER JOIN ?? ON ??.?? = ??.??';
                        // placeholder
                        placeholder = [table, jointable, table, originid, jointable, joinid];
                    }
                    // if column not null
                    if (colLen > 0) {
                        // add where phrase
                        queryString += ' WHERE';
                        // loop for array
                        for (let i = 0; i < colLen; i++) {
                            // add in phrase
                            queryString += ' ??.?? IN (?)';
                            // push table
                            placeholder.push(table);
                            // push column
                            placeholder.push(columns[i]);
                            // push value
                            placeholder.push(values[i]);
                            // other than last one
                            if (i < colLen) {
                                // add and phrase
                                queryString += ' AND';
                            }
                        }
                        // if joincolumn not null
                        if (joincolLen > 0) {
                            // loop for array
                            for (let j = 0; j < joincolLen; j++) {
                                // add in phrase
                                queryString += ' ??.?? IN (?)';
                                // push table
                                placeholder.push(jointable);
                                // push column
                                placeholder.push(joincolumns[j]);
                                // push value
                                placeholder.push(joinvalues[j]);
                                // other than last one
                                if (j < joincolLen - 1) {
                                    // add and phrase
                                    queryString += ' AND';
                                }
                            }
                        }
                        // if column not null
                        if (spanval && spantable && spanunit && spandirection) {
                            // flg
                            if (spandirection == 'after') {
                                // query
                                queryString += ` AND ${spantable}.?? > date(current_timestamp - interval ? ${spanunit})`;
                            }
                            else if (spandirection == 'before') {
                                // query
                                queryString += ` AND ${spantable}.?? < date(current_timestamp - interval ? ${spanunit})`;
                            }
                            // push span column
                            placeholder.push('created_at');
                            // push span limit
                            placeholder.push(spanval);
                        }
                        // if order exists
                        if (order) {
                            // query
                            queryString += ' ORDER BY ??.??';
                            // if reverse
                            if (reverse) {
                                // query
                                queryString += ' ASC';
                            }
                            else {
                                // query
                                queryString += ' DESC';
                            }
                            // if order exists
                            if (ordertable) {
                                // push ordertable
                                placeholder.push(ordertable);
                            }
                            else {
                                // push maintable
                                placeholder.push(table);
                            }
                            // if order exists
                            placeholder.push(order);
                        }
                        // if limit exists
                        if (limit) {
                            // query
                            queryString += ' LIMIT ?';
                            // push limit
                            placeholder.push(limit);
                        }
                        // if offset exists
                        if (offset) {
                            // query
                            queryString += ' OFFSET ?';
                            // push offset
                            placeholder.push(offset);
                        }
                        // do query
                        yield this.doInquiry(queryString, placeholder)
                            .then((result) => {
                            // result exists
                            if (result == 'error' || result == 'empty') {
                                SQL.logger.trace(`selectJoinDB: ${result}`);
                            }
                            else {
                                SQL.logger.trace('selectJoinDB: success');
                            }
                            // do query
                            resolve(result);
                        })
                            .catch((err) => {
                            // error
                            SQL.logger.error(err);
                            resolve('error');
                        });
                    }
                }
                catch (e) {
                    // error
                    SQL.logger.error(e);
                    resolve('error');
                }
            }));
        });
        // select db with double join
        this.selectDoubleJoinDB = (args) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
                try {
                    SQL.logger.trace('db: selectjoinDB mode');
                    // query string
                    let queryString;
                    // placeholder
                    let placeholder;
                    // table
                    const table = args.table;
                    // columns
                    const columns = args.columns;
                    // values
                    const values = args.values;
                    // originid1
                    const originid1 = args.originid1;
                    // originid2
                    const originid2 = args.originid2;
                    // jointable1
                    const jointable1 = args.jointable1;
                    // jointable2
                    const jointable2 = args.jointable2;
                    // joincolumns1
                    const joincolumns1 = args.joincolumns1;
                    // joincolumns2
                    const joincolumns2 = args.joincolumns2;
                    // joinvalues1
                    const joinvalues1 = args.joinvalues1;
                    // joinvalues2
                    const joinvalues2 = args.joinvalues2;
                    // joinid1
                    const joinid1 = args.joinid1;
                    // joinid2
                    const joinid2 = args.joinid2;
                    // limit (optional)
                    const limit = (_a = args.limit) !== null && _a !== void 0 ? _a : null;
                    // order (optional)
                    const offset = (_b = args.offset) !== null && _b !== void 0 ? _b : null;
                    // spantable (optional)
                    const spantable = (_c = args.spantable) !== null && _c !== void 0 ? _c : null;
                    // span (optional)
                    const spanval = (_d = args.spanval) !== null && _d !== void 0 ? _d : null;
                    // spandirection (optional)
                    const spandirection = (_e = args.spandirection) !== null && _e !== void 0 ? _e : null;
                    // spanunit (optional)
                    const spanunit = (_f = args.spanunit) !== null && _f !== void 0 ? _f : null;
                    // order (optional)
                    const order = (_g = args.order) !== null && _g !== void 0 ? _g : null;
                    // ordertable (optional)
                    const ordertable = (_h = args.ordertable) !== null && _h !== void 0 ? _h : null;
                    // reverse (optional)
                    const reverse = (_j = args.reverse) !== null && _j !== void 0 ? _j : false;
                    // fields (optional)
                    const fields = (_k = args.fields) !== null && _k !== void 0 ? _k : null;
                    // col length
                    const colLen = columns.length;
                    // joincol1 length
                    const joincol1Len = joincolumns1.length;
                    // joincol2 length
                    const joincol2Len = joincolumns2.length;
                    // if fields exists
                    if (fields) {
                        // query
                        queryString = 'SELECT ?? FROM ?? INNER JOIN ?? ON ??.?? = ??.?? RIGHT JOIN ?? ON ??.?? = ??.??';
                        // placeholder
                        placeholder = [
                            fields,
                            table,
                            jointable1,
                            table,
                            originid1,
                            jointable1,
                            joinid1,
                            jointable2,
                            table,
                            originid2,
                            jointable2,
                            joinid2,
                        ];
                    }
                    else {
                        // query
                        queryString = 'SELECT * FROM ?? INNER JOIN ?? ON ??.?? = ??.?? RIGHT JOIN ?? ON ??.?? = ??.??';
                        // placeholder
                        placeholder = [
                            table,
                            jointable1,
                            table,
                            originid1,
                            jointable1,
                            joinid1,
                            jointable2,
                            table,
                            originid2,
                            jointable2,
                            joinid2,
                        ];
                    }
                    // if column not null
                    if (colLen > 0) {
                        // add where phrase
                        queryString += ' WHERE';
                        // loop for array
                        for (let i = 0; i < colLen; i++) {
                            // add in phrase
                            queryString += ' ??.?? IN (?)';
                            // push table
                            placeholder.push(table);
                            // push column
                            placeholder.push(columns[i]);
                            // push value
                            placeholder.push(values[i]);
                            // other than last one
                            if (i < colLen) {
                                // add and phrase
                                queryString += ' AND';
                            }
                        }
                        // if joincolumn1 not null
                        if (joincol1Len > 0) {
                            // loop for array
                            for (let j = 0; j < joincol1Len; j++) {
                                // add in phrase
                                queryString += ' ??.?? IN (?)';
                                // push table
                                placeholder.push(jointable1);
                                // push column
                                placeholder.push(joincolumns1[j]);
                                // push value
                                placeholder.push(joinvalues1[j]);
                                // other than last one
                                if (j < joincol1Len - 1) {
                                    // add and phrase
                                    queryString += ' AND';
                                }
                            }
                        }
                        // if joincolumn2 not null
                        if (joincol2Len > 0) {
                            // add and phrase
                            queryString += ' AND';
                            // loop for array
                            for (let j = 0; j < joincol2Len; j++) {
                                // add in phrase
                                queryString += ' ??.?? IN (?)';
                                // push table
                                placeholder.push(jointable2);
                                // push column
                                placeholder.push(joincolumns2[j]);
                                // push value
                                placeholder.push(joinvalues2[j]);
                                // other than last one
                                if (j < joincol2Len - 1) {
                                    // add and phrase
                                    queryString += ' AND';
                                }
                            }
                        }
                        // if column not null
                        if (spanval && spantable && spanunit && spandirection) {
                            // flg
                            if (spandirection == 'after') {
                                // query
                                queryString += ` AND ${spantable}.?? > date(current_timestamp - interval ? ${spanunit})`;
                            }
                            else if (spandirection == 'before') {
                                // query
                                queryString += ` AND ${spantable}.?? < date(current_timestamp - interval ? ${spanunit})`;
                            }
                            // push span column
                            placeholder.push('created_at');
                            // push span limit
                            placeholder.push(spanval);
                        }
                        // if order exists
                        if (order) {
                            // query
                            queryString += ' ORDER BY ??.??';
                            // if reverse
                            if (reverse) {
                                // query
                                queryString += ' ASC';
                            }
                            else {
                                // query
                                queryString += ' DESC';
                            }
                            // if order exists
                            if (ordertable) {
                                // push ordertable
                                placeholder.push(ordertable);
                            }
                            else {
                                // push maintable
                                placeholder.push(table);
                            }
                            // if order exists
                            placeholder.push(order);
                        }
                        // if limit exists
                        if (limit) {
                            // query
                            queryString += ' LIMIT ?';
                            // push limit
                            placeholder.push(limit);
                        }
                        // if offset exists
                        if (offset) {
                            // query
                            queryString += ' OFFSET ?';
                            // push offset
                            placeholder.push(offset);
                        }
                        // do query
                        yield this.doInquiry(queryString, placeholder)
                            .then((result) => {
                            // result exists
                            if (result == 'error' || result == 'empty') {
                                SQL.logger.trace(`selectJoinDB: ${result}`);
                            }
                            else {
                                SQL.logger.trace('selectJoinDB: success');
                            }
                            // do query
                            resolve(result);
                        })
                            .catch((err) => {
                            // error
                            SQL.logger.error(err);
                            resolve('error');
                        });
                    }
                }
                catch (e) {
                    // error
                    SQL.logger.error(e);
                    resolve('error');
                }
            }));
        });
        // update
        this.updateDB = (args) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve1) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c;
                try {
                    SQL.logger.trace('db: updateDB mode');
                    // not
                    let tmpQuery = '';
                    // placeholder array
                    let placeholder = [];
                    // tmp placeholder array
                    let tmpPlaceholder = [];
                    // table
                    const table = args.table;
                    // select columns
                    const selcol = args.selcol;
                    // select values
                    const selval = args.selval;
                    // set column
                    const setcol = args.setcol;
                    // set value
                    const setval = args.setval;
                    // span value (optional)
                    const spanval = (_a = args.spanval) !== null && _a !== void 0 ? _a : null;
                    // span direction (optional)
                    const spandirection = (_b = args.spandirection) !== null && _b !== void 0 ? _b : null;
                    // spanunit (optional)
                    const spanunit = (_c = args.spanunit) !== null && _c !== void 0 ? _c : null;
                    // selcol length
                    const selcolLen = selcol.length;
                    // setcol length
                    const setcolLen = setcol.length;
                    // promise
                    const promises = [];
                    // query string
                    let queryString = 'UPDATE ?? SET ?? = ? WHERE';
                    // set all conditions
                    for (let i = 0; i < selcolLen; i++) {
                        // initialize
                        tmpQuery = '';
                        // not
                        if (selcol[i].includes('*')) {
                            // query
                            queryString += '?? <> ?';
                            // replace asterisk
                            tmpQuery = selcol[i].replace('*', '');
                        }
                        else {
                            queryString += '?? = ?';
                            tmpQuery = selcol[i];
                        }
                        // push column
                        tmpPlaceholder.push(tmpQuery);
                        // push value
                        tmpPlaceholder.push(selval[i]);
                        // other than last one
                        if (i < selcolLen - 1) {
                            // add 'and' phrase
                            queryString += ' AND ';
                        }
                    }
                    // set all values and execute
                    for (let j = 0; j < setcolLen; j++) {
                        // placeholder
                        placeholder = [table];
                        // add promise
                        promises.push(new Promise((resolve2, _) => __awaiter(this, void 0, void 0, function* () {
                            // push column
                            placeholder.push(setcol[j]);
                            // push value
                            placeholder.push(setval[j]);
                            // add conditions
                            placeholder.push(...tmpPlaceholder);
                            // add span
                            if (spanval && spanunit && spandirection) {
                                // flg
                                if (spandirection == 'after') {
                                    // query
                                    queryString += ` AND ?? > date(current_timestamp - interval ? ${spanunit})`;
                                }
                                else if (spandirection == 'before') {
                                    // query
                                    queryString += ` AND ?? < date(current_timestamp - interval ? ${spanunit})`;
                                }
                                placeholder.push('created_at');
                                placeholder.push(spanval);
                            }
                            // do query
                            yield this.doInquiry(queryString, placeholder)
                                .then((result) => {
                                // result exists
                                if (result == 'error' || result == 'empty') {
                                    SQL.logger.trace(`updateDB: ${result}`);
                                }
                                else {
                                    SQL.logger.trace('updateDB: success');
                                }
                                // do query
                                resolve2(result);
                            })
                                .catch((err) => {
                                // error
                                SQL.logger.error(err);
                                resolve2('error');
                            });
                        })));
                    }
                    // complete
                    Promise.all(promises).then((results) => {
                        resolve1(results);
                    });
                }
                catch (e) {
                    // error
                    SQL.logger.error(e);
                    resolve1('error');
                }
            }));
        });
        // update
        this.updateJoinDB = (args) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve1) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                try {
                    SQL.logger.trace('db: updateJoinDB mode');
                    // placeholder array
                    let placeholder = [];
                    // tmp placeholder array
                    let tmpPlaceholder = [];
                    // table
                    const table = args.table;
                    // select columns
                    const selcol = args.selcol;
                    // select values
                    const selval = args.selval;
                    // set column
                    const setcol = args.setcol;
                    // set value
                    const setval = args.setval;
                    // spantable (optional)
                    const spantable = (_a = args.spantable) !== null && _a !== void 0 ? _a : null;
                    // span value (optional)
                    const spanval = (_b = args.spanval) !== null && _b !== void 0 ? _b : null;
                    // span direction (optional)
                    const spandirection = (_c = args.spandirection) !== null && _c !== void 0 ? _c : null;
                    // spanunit (optional)
                    const spanunit = (_d = args.spanunit) !== null && _d !== void 0 ? _d : null;
                    // selcol length
                    const selcolLen = selcol.length;
                    // setcol length
                    const setcolLen = setcol.length;
                    // promise
                    const promises = [];
                    // query string
                    let queryString = 'UPDATE ?? SET ?? = ? WHERE ?? = ?';
                    // set all conditions
                    for (let i = 0; i < selcolLen; i++) {
                        // push column
                        tmpPlaceholder.push(selcol[i]);
                        // push value
                        tmpPlaceholder.push(selval[i]);
                        // other than last one
                        if (i < selcolLen - 1) {
                            // add 'and' phrase
                            queryString += ' AND ?? = ?';
                        }
                    }
                    // set all values and execute
                    for (let j = 0; j < setcolLen; j++) {
                        // placeholder
                        placeholder = [table];
                        // add promise
                        promises.push(new Promise((resolve2) => __awaiter(this, void 0, void 0, function* () {
                            // push column
                            placeholder.push(setcol[j]);
                            // push value
                            placeholder.push(setval[j]);
                            // add conditions
                            placeholder.push(...tmpPlaceholder);
                            // add span
                            if (spantable && spanval && spanunit && spandirection) {
                                if (spandirection == 'after') {
                                    // query
                                    queryString += ` AND ${spantable}.?? > date(current_timestamp - interval ? ${spanunit})`;
                                }
                                else if (spandirection == 'before') {
                                    // query
                                    queryString += ` AND ${spantable}.?? < date(current_timestamp - interval ? ${spanunit})`;
                                }
                                placeholder.push('created_at');
                                placeholder.push(spanval);
                            }
                            // do query
                            yield this.doInquiry(queryString, placeholder)
                                .then((result) => {
                                // result exists
                                if (result == 'error' || result == 'empty') {
                                    SQL.logger.trace(`updateJoinDB: ${result}`);
                                }
                                else {
                                    SQL.logger.trace('updateJoinDB: success');
                                }
                                resolve2(result);
                            })
                                .catch((err) => {
                                // error
                                SQL.logger.error(err);
                                resolve2('error');
                            });
                        })));
                    }
                    // complete
                    Promise.all(promises).then((results) => {
                        resolve1(results);
                    });
                }
                catch (e) {
                    // error
                    SQL.logger.error(e);
                    resolve1('error');
                }
            }));
        });
        // insert
        this.insertDB = (args) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                try {
                    SQL.logger.trace('db: insertDB mode');
                    // table
                    const table = args.table;
                    // columns
                    const columns = args.columns;
                    // values
                    const values = args.values;
                    // query string
                    const queryString = 'INSERT INTO ??(??) VALUES (?)';
                    // placeholder
                    const placeholder = [table, columns, values];
                    // do query
                    yield this.doInquiry(queryString, placeholder)
                        .then((result) => {
                        // result exists
                        if (result == 'error' || result == 'empty') {
                            resolve(result);
                            SQL.logger.trace(`insertDB: ${result}`);
                        }
                        else {
                            resolve(result.insertId);
                            SQL.logger.trace('insertDB: success');
                        }
                    })
                        .catch((err) => {
                        // error
                        SQL.logger.error(err);
                        resolve('error');
                    });
                }
                catch (e) {
                    // error
                    SQL.logger.error(e);
                    resolve('error');
                }
            }));
        });
        // insert
        this.insertNoDupDB = (args) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                try {
                    SQL.logger.trace('db: insertNoDupDB mode');
                    // query string
                    let queryString;
                    // placeholder array
                    let placeholder = [];
                    // table
                    const table = args.table;
                    // columns
                    const columns = args.columns;
                    // values
                    const values = args.values;
                    // select columns
                    const selcol = args.selcol;
                    // select columns
                    const selval = args.selval;
                    // selcol length
                    const selcolLen = args.selcol.length;
                    // query string
                    queryString = 'INSERT INTO ??(??) SELECT (?) WHERE NOT EXISTS (SELECT * FROM ?? WHERE ?? = ?';
                    // placeholder
                    placeholder = [table, columns, values, table];
                    // loop for conditions
                    for (let i = 0; i < selcolLen; i++) {
                        // push column
                        placeholder.push(selcol[i]);
                        // push value
                        placeholder.push(selval[i]);
                        // other than last one
                        if (i < selcolLen - 1) {
                            // add 'and' phrase
                            queryString += ' AND ?? = ?';
                        }
                    }
                    // do query
                    yield this.doInquiry(queryString, placeholder).then((result) => {
                        // result exists
                        if (result == 'error' || result == 'empty') {
                            resolve(result);
                            SQL.logger.trace(`insertNoDupDB: ${result}`);
                        }
                        else {
                            resolve(result.insertId);
                            SQL.logger.trace('insertNoDupDB: success');
                        }
                    }).catch((err) => {
                        // error
                        SQL.logger.error(err);
                        resolve('error');
                    });
                }
                catch (e) {
                    // error
                    SQL.logger.error(e);
                    resolve('error');
                }
            }));
        });
        // loggeer instance
        SQL.logger = logger;
        // DB config
        SQL.pool = mysql.createPool({
            host: host, // host
            user: user, // username
            password: pass, // password
            database: db, // db name
            port: port, // port number
            waitForConnections: true, // wait for conn
            idleTimeout: 1000000, // timeout(ms)
            insecureAuth: false, // allow insecure
        });
        // encrypted key
        SQL.encryptkey = key;
    }
    // empty or not
    static isEmpty(obj) {
        // check whether blank
        return !Object.keys(obj).length;
    }
}
// export module
exports.default = SQL;
