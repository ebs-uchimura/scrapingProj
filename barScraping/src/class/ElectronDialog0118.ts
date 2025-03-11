/**
 * ElectronDialog.ts
 *
 * ElectronDialog
 * function：Dialog operation for electron
 * updated: 2025/01/18
 **/

'use strict';

/// import modules
import { dialog } from 'electron'; // electron

// ElectronDialog class
class Dialog {
    // construnctor
    constructor() {
    }

    /// show question
    showQuetion(title: string, message: string, detail: string): number {
        try {
            // quetion message option
            const options: Electron.MessageBoxSyncOptions = {
                type: 'question',
                title: title,
                message: message,
                detail: detail,
                buttons: ['yes', 'no'],
                cancelId: -1, // Esc
            }
            // selected number
            const selected: number = dialog.showMessageBoxSync(options);
            // return selected
            return selected;

        } catch (e: unknown) {
            // error
            if (e instanceof Error) {
                // error
                console.log(e.message);
            }
            return 99;
        }
    }

    /// show message
    showmessage(type: string, message: string) {
        try {
            // mode
            let tmpType: 'none' | 'info' | 'error' | 'question' | 'warning' | undefined;
            // title
            let tmpTitle: string | undefined;

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
            const options: Electron.MessageBoxOptions = {
                type: tmpType, // type
                message: tmpTitle, // title
                detail: message,  // description
            }
            // show dialog
            dialog.showMessageBox(options);

        } catch (e: unknown) {
            // error
            if (e instanceof Error) {
                // error
                console.log(e.message);
            }
        }
    }
}

// export module
export default Dialog;