"use strict";
/**
 * preload.ts
 **
 * function：ipc bridge
**/
Object.defineProperty(exports, "__esModule", { value: true });
// module
const electron_1 = require("electron"); // electron
// contextBridge
electron_1.contextBridge.exposeInMainWorld("api", {
    // send to ipcMain
    send: (channel, data) => {
        try {
            electron_1.ipcRenderer.send(channel, data);
        }
        catch (e) {
            console.log(e);
        }
    },
    // recieve from ipcMain
    on: (channel, func) => {
        try {
            electron_1.ipcRenderer.on(channel, (_, ...args) => func(...args));
        }
        catch (e) {
            console.log(e);
        }
    }
});
