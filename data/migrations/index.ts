import * as Migration001 from './001_tasks';
import * as Migration002 from './002_tasks_history';

export const migrations = [
  {id: '001_create_tasks_table', up: Migration001.up, down: Migration001.down},
  {id: '002_tasks_history', up: Migration002.up, down: Migration002.down},
];
