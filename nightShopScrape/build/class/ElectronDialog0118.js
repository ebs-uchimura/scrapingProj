/**
 * ElectronDialog.ts
 *
 * ElectronDialog
 * function：Dialog operation for electron
 * updated: 2025/01/18
 **/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/// import modules
const electron_1 = require("electron"); // electron
// ElectronDialog class
class Dialog {
    // construnctor
    constructor() {
    }
    /// show question
    showQuetion(title, message, detail) {
        try {
            // quetion message option
            const options = {
                type: 'question',
                title: title,
                message: message,
                detail: detail,
                buttons: ['はい', 'いいえ'],
                cancelId: -1, // Esc
            };
            // selected number
            const selected = electron_1.dialog.showMessageBoxSync(options);
            // return selected
            return selected;
        }
        catch (e) {
            // error
            if (e instanceof Error) {
                // error
                console.log(e.message);
            }
            return 99;
        }
    }
    /// show message
    showmessage(type, message) {
        try {
            // mode
            let tmpType;
            // title
            let tmpTitle;
            // url
            switch (type) {
                // info mode
                case 'info':
                    tmpType = 'info';
                    tmpTitle = '情報';
                    break;
                // error mode
                case 'error':
                    tmpType = 'error';
                    tmpTitle = 'エラー';
                    break;
                // warning mode
                case 'warning':
                    tmpType = 'warning';
                    tmpTitle = '警告';
                    break;
                // others
                default:
                    tmpType = 'none';
                    tmpTitle = '';
            }
            // options
            const options = {
                type: tmpType, // type
                message: tmpTitle, // title
                detail: message, // description
            };
            // show dialog
            electron_1.dialog.showMessageBox(options);
        }
        catch (e) {
            // error
            if (e instanceof Error) {
                // error
                console.log(e.message);
            }
        }
    }
}
// export module
exports.default = Dialog;
