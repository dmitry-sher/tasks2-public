import SQLite from 'react-native-sqlite-storage';

import {cleanDB, db, insertQuery, query} from './database';
import {migrations} from './migrations';

export const regenerateDB = async () => {
  await cleanDB();
  await applyMigrations();
};

export const applyMigrations = async () => {
  try {
    await createMigrationsTable();
    const appliedMigrations = await getAppliedMigrations();

    for (const migration of migrations) {
      if (!appliedMigrations.includes(migration.id)) {
        console.log(`applying migration ${migration.id}`);
        await applyMigration(migration);
      }
    }

    console.log('All migrations applied');
  } catch (error) {
    console.error('Error applying migrations:', error);
  }
};

const createMigrationsTable = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS migrations (
          id TEXT PRIMARY KEY,
          appliedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        [],
        () => {
          resolve();
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};

const getAppliedMigrations = async (): Promise<string[]> => {
  return new Promise<string[]>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT id FROM migrations',
        [],
        (_, {rows}) => {
          const appliedMigrations: string[] = [];
          for (let i = 0; i < rows.length; i++) {
            appliedMigrations.push(rows.item(i).id);
          }
          resolve(appliedMigrations);
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};

const applyMigration = async (migration: {id: string; up: string}) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        migration.up,
        [],
        () => {
          tx.executeSql(
            'INSERT INTO migrations (id) VALUES (?)',
            [migration.id],
            () => {
              resolve();
            },
            (_, error) => {
              reject(error);
            },
          );
        },
        (_, error) => {
          reject(error);
        },
      );
    });
  });
};
