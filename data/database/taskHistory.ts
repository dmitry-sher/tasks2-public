import {TaskHistoryAction, TaskHistoryLog} from '../entities/taskHistoryLog';
import {insertQuery, query} from './db';

export const insertTaskHistoryLog = async (
  taskId: number,
  action: TaskHistoryAction,
  payload: any,
): Promise<void> => {
  const payloadString = JSON.stringify(payload);
  await insertQuery(
    `INSERT INTO task_history_log (task_id, action, payload) VALUES (?, ?, ?)`,
    [taskId, action, payloadString],
  );
};

export const getTaskHistoryLogs = async (
  taskId: number,
  action?: TaskHistoryAction,
): Promise<TaskHistoryLog[]> => {
  const parts = ['SELECT * FROM task_history_log WHERE task_id = ?'];
  const params: any[] = [taskId];

  if (action) {
    parts.push('AND action = ?');
    params.push(action);
  }

  parts.push('ORDER BY createdAt DESC');

  const sql = parts.join(' ');
  return await query(sql, params);
};
