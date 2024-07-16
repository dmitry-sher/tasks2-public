import SQLite from 'react-native-sqlite-storage';

const database_name = 'Tasks.db';
const database_version = '1.0';
const database_displayname = 'SQLite Tasks Database';
const database_size = 200000;

export let db: SQLite.SQLiteDatabase;

export const openDatabase = async () => {
  return new Promise<SQLite.SQLiteDatabase>((resolve, reject) => {
    db = SQLite.openDatabase(
      database_name,
      database_version,
      database_displayname,
      // @ts-ignore
      database_size,
      () => {
        console.log('Database opened');
        resolve(db);
      },
      // @ts-ignore
      error => {
        console.error('Error: ' + error);
        reject(error);
      },
    );
  });
};

export const query = async <T>(query: string, params: any[]) => {
  return new Promise<T[]>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        query,
        params,
        (_, {rows}) => {
          const ret: T[] = [];
          for (let i = 0; i < rows.length; i++) {
            ret.push(rows.item(i));
          }
          resolve(ret);
        },
        (_, error) => {
          console.error(`[query] ERR ${error.toString()}`);
          reject(error);
        },
      );
    });
  });
};

export const insertQuery = async <T>(query: string, params: any[]) => {
  return new Promise<number>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        query,
        params,
        (_, result) => {
          resolve(result.insertId);
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};

export const cleanDB = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`,
        [],
        (_, {rows}) => {
          const tables: string[] = [];
          for (let i = 0; i < rows.length; i++) {
            tables.push(rows.item(i).name);
          }

          tables.forEach(table => {
            tx.executeSql(`DROP TABLE IF EXISTS ${table}`);
          });

          resolve();
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};
