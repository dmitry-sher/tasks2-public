export const up = `
    CREATE TABLE IF NOT EXISTS task_history_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      action INTEGER NOT NULL,
      payload TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

export const down = `
    DROP TABLE task_history_log;
  `;
