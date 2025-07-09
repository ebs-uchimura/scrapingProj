/**
 * ElDialog.ts
 *
 * name：ElDialog
 * function：Dialog operation for electron
 * updated: 2025/04/14
 **/
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/// import modules
const electron_1 = require("electron"); // electron
// select image
const CHOOSE_IMG_FILE = '画像を選択してください';
// ElectronDialog class
class Dialog {
    // construnctor
    constructor(logger) {
        // logger setting
        Dialog.logger = logger;
        Dialog.logger.info('dialog: initialize mode');
    }
    /// show question
    // show yes/no
    showQuetion(title, message, detail) {
        try {
            Dialog.logger.info('dialog: showQuetion started.');
            // quetion message option
            const options = {
                type: 'question',
                title: title,
                message: message,
                detail: detail,
                buttons: ['yes', 'no'],
                cancelId: -1 // Esc
            };
            // selected number
            const selected = electron_1.dialog.showMessageBoxSync(options);
            Dialog.logger.info('dialog: showQuetion finished.');
            // return selected
            return selected;
        }
        catch (e) {
            // error
            console.log(e);
            return 99;
        }
    }
    // show image
    showImage(properties) {
        try {
            Dialog.logger.info('dialog: showImage started.');
            // quetion message option
            const options = {
                properties: properties, // file
                title: CHOOSE_IMG_FILE, // file selection
                defaultPath: '.', // root path
                filters: [
                    { name: 'jpg|png', extensions: ['jpg', 'jpeg', 'png'] } // jpg|png
                ]
            };
            // result
            const result = electron_1.dialog.showOpenDialog(options);
            Dialog.logger.info('dialog: showImage finished.');
            // return selected
            return result;
        }
        catch (e) {
            // error
            console.log(e);
            return 99;
        }
    }
    // show message
    showmessage(type, message) {
        try {
            Dialog.logger.info('dialog: showmessage started.');
            // mode
            let tmpType;
            // title
            let tmpTitle;
            // url
            switch (type) {
                // info mode
                case 'info':
                    tmpType = 'info';
                    tmpTitle = 'info';
                    break;
                // error mode
                case 'error':
                    tmpType = 'error';
                    tmpTitle = 'error';
                    break;
                // warning mode
                case 'warning':
                    tmpType = 'warning';
                    tmpTitle = 'warning';
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
                detail: message // description
            };
            // show dialog
            electron_1.dialog.showMessageBox(options);
            Dialog.logger.info('dialog: showmessage finished.');
        }
        catch (e) {
            console.log(e);
        }
    }
}
// export module
exports.default = Dialog;
