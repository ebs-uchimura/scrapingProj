/**
 * ElectronCsv.ts
 *
 * name：CSV
 * function：CSV operation for electron
 * updated: 2025/1/19
 **/

// define modules
import { dialog } from 'electron'; // electron
import { promises } from "fs"; // file system
import { parse } from 'csv-parse/sync'; // csv parser
import { stringify } from 'csv-stringify/sync'; // csv 
import iconv from 'iconv-lite'; // encoding
import { FileFilter } from 'electron/main'; // file filter
import Encoding from "encoding-japanese"; // encoding

// file system definition
const { readFile, writeFile } = promises;
const CHOOSE_FILE: string = "select CSV file"; // file dialog

// csv dialog option
interface csvDialog {
  properties: any; // file open
  title: string; // header title
  defaultPath: string; // default path
  filters: FileFilter[]; // filter
}

// CSV class
class CSV {
  static defaultencoding: string; // defaultencoding

  // construnctor
  constructor(encoding: string) {
    console.log('csv: initialize mode');
    // DB config
    CSV.defaultencoding = encoding;
  }

  // getCsvData
  getCsvData = async (filenames: string): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        // filename exists
        if (filenames.length) {
          // read file
          const data: any = await readFile(filenames[0]);
          // char encoding not correct
          if (Encoding.detect(data) == CSV.defaultencoding) {
            console.log(`${Encoding.detect(data)}`);
            throw new Error(`data is not ${CSV.defaultencoding}`);
          }
          // encoding
          const str: string = iconv.decode(data, CSV.defaultencoding);
          // csv parse
          const tmpRecords: any = parse(str, {
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

        } else {
          // rejected
          throw new Error('error');
        }

      } catch (e: unknown) {
        // error type
        if (e instanceof Error) {
          // error
          console.log(e.message);
        }
        reject();
      }
    });
  }

  // CSV
  getCsvDataDialog = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      try {
        console.log("func: getCsvData mode");
        // file select dialog
        dialog
          .showOpenDialog({
            properties: ["openFile"], // file
            title: CHOOSE_FILE, // select file
            defaultPath: ".", // path
            filters: [
              { name: "csv(Shif-JIS)", extensions: ["csv"] }, // csv
            ],
          })
          .then(async (result: any) => {
            // file path
            const filenames: string[] = result.filePaths;

            // file exists
            if (filenames.length) {
              // read csv file
              const csvdata = await readFile(filenames[0]);
              // decode
              const str: string = iconv.decode(csvdata, CSV.defaultencoding);
              // csv parse
              const tmpRecords: any = parse(str, {
                columns: false, // no column
                from_line: 2, // ignore start line
                skip_empty_lines: true, // ignore blank
              });
              // return value
              resolve({
                record: tmpRecords, // data
                filename: filenames[0], // file name
              });
            } else {
              // throw error
              throw new Error(result.canceled);
            }
          })
          .catch((err: unknown) => {
            // error
            if (err instanceof Error) {
              // show error message
              console.log(err.message);
            }
            // rejected
            throw new Error('error');
          });

      } catch (e: unknown) {
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
  makeCsvData = async (arr: any[], columns: { [key: string]: any }, filename: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('func: makeCsvData mode');
        // csvdata
        const csvData: any = stringify(arr, { header: true, columns: columns });
        // write to csv file
        await writeFile(filename, iconv.encode(csvData, CSV.defaultencoding));
        // complete
        resolve();

      } catch (e: unknown) {
        // error type
        if (e instanceof Error) {
          // error
          console.log(e.message);
        }
        reject();
      }
    });
  }

  // showCSVDialog
  showCSVDialog = async (mainWindow: any): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        // options
        const dialogOptions: csvDialog = {
          properties: ['openFile'], // file open
          title: 'choose csv file', // header title
          defaultPath: '.', // default path
          filters: [
            { name: 'csv(Shif-JIS)', extensions: ['csv'] } // filter
          ],
        }
        // show file dialog
        dialog.showOpenDialog(mainWindow, dialogOptions).then((result: any) => {

          // file exists
          if (result.filePaths.length > 0) {
            // resolved
            resolve(result.filePaths);

            // no file
          } else {
            // rejected
            throw new Error(result.canceled);
          }

        }).catch((e: unknown) => {
          // error type
          if (e instanceof Error) {
            // error
            console.log(e.message);
          }
          // rejected
          throw new Error('error');
        });

      } catch (e: unknown) {
        // error type
        if (e instanceof Error) {
          // error
          console.log(e.message);
        }
        reject('error');
      }
    });
  }
}

// export module
export default CSV;