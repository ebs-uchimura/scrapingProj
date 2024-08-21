/**
 * Csv.ts
 *
 * name：CSV
 * function：CSV operation for electron
 * updated: 2024/05/06
 **/

// define modules
import { parse } from 'csv-parse/sync'; // csv parser
import { promises } from "fs"; // file system
import iconv from 'iconv-lite'; // encoding
import { stringify } from 'csv-stringify/sync'; // csv stringify

// file system definition
const { readFile, writeFile } = promises;
// file dialog
const CHOOSE_FILE: string = 'read CSV file';

// CSV class
class CSV {
  static dialog: Electron.Dialog; // dialog
  static defaultencoding: string; // defaultencoding

  // construnctor
  constructor(dialog: Electron.Dialog, encoding: string) {
    console.log('csv: initialize mode');
    // electron dialog
    CSV.dialog = dialog;
    // DB config
    CSV.defaultencoding = encoding;
  }

  // getCsvData
  getCsvData = async (): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        // file select dialog
        CSV.dialog.showOpenDialog({
          properties: ['openFile'], // file
          title: CHOOSE_FILE, // dialog title
          defaultPath: '.', // root path
          filters: [
            { name: 'csv(Shif-JIS)', extensions: ['csv'] }, // csv only
          ],

        }).then(async (result) => {
          // file path
          const filenames: string[] = result.filePaths;
          // csv file name
          console.log(`you got csv named ${filenames[0]}.`);

          // filename exists
          if (filenames.length) {
            // read file
            const data: any = await readFile(filenames[0]);
            // encoding
            const str: string = iconv.decode(data, CSV.defaultencoding);
            // csv parse
            const tmpRecords: string[][] = parse(str, {
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
            // nofile, exit
            reject(result.canceled);
          }
        });

      } catch (e: unknown) {
        // error
        console.log(e);
        // error type
        if (e instanceof Error) {
          reject();
        }
      }
    });
  }

  // makeCsvData
  makeCsvData = async (arr: any[], filename: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log('func: makeCsvData mode');
        // csvdata
        const csvData: any = stringify(arr, { header: true });
        // write to csv file
        await writeFile(filename, iconv.encode(csvData, 'shift_jis'));
        // complete
        resolve();

      } catch (e: unknown) {
        // error
       console.log(e);
        // error type
        if (e instanceof Error) {
          reject();
        }
      }
    });
  }
}

// export module
export default CSV;