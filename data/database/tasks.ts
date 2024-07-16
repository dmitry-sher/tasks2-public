import {formatISO, startOfToday, startOfTomorrow} from 'date-fns';
import {Task} from '../entities/tasks';
import {ButtonState} from '../redux/buttonSlice';
import {insertQuery, query} from './db';

export const insertTask = async (task: Task): Promise<Task> => {
  const insertId = await insertQuery(
    `INSERT INTO tasks (title, description, showAfter, length, dueDate, status, google_event_id)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      task.title,
      task.description,
      task.showAfter,
      task.length,
      task.dueDate,
      task.status,
      task.google_event_id,
    ],
  );
  const insertedTask = {
    ...task,
    id: insertId,
  };
  return insertedTask;
};

export const updateTask = async (task: Task) => {
  await query(
    `UPDATE tasks SET title = ?, description = ?, showAfter = ?, length = ?, dueDate = ?, status = ? WHERE id = ?`,
    [
      task.title,
      task.description,
      task.showAfter,
      task.length,
      task.dueDate,
      task.status,
      task.id,
    ],
  );
};

export const setTaskGoogleId = async (taskId: number, googleId: string) => {
  await query(`UPDATE tasks SET google_event_id = ? WHERE id = ?`, [
    googleId,
    taskId,
  ]);
};

export const deleteTask = async (id: number) => {
  await query('DELETE FROM tasks WHERE id = ?', [id]);
};

export const getTasks = async (
  buttonState: ButtonState,
  showDone = false,
): Promise<Task[]> => {
  const parts = ['SELECT * FROM tasks'];
  const params: any[] = [];

  const where = [];

  const todayStart = startOfToday();
  const tomorrowStart = startOfTomorrow();
  if (buttonState === ButtonState.Today) {
    where.push(`(showAfter IS NULL OR showAfter <= CURRENT_TIMESTAMP)`);
    where.push(`(dueDate IS NULL OR dueDate BETWEEN ? AND ?)`);
    params.push(formatISO(todayStart));
    params.push(formatISO(tomorrowStart));
  } else if (buttonState === ButtonState.Tomorrow) {
    const dayAfterTomorrowStart = startOfTomorrow();
    dayAfterTomorrowStart.setDate(dayAfterTomorrowStart.getDate() + 1);
    where.push(`(
(dueDate IS NULL AND showAfter BETWEEN ? AND ?)
OR
(dueDate BETWEEN ? AND ?)
)`);
    // where.push(`(dueDate IS NULL OR dueDate BETWEEN ? AND ?)`);
    params.push(formatISO(tomorrowStart));
    params.push(formatISO(dayAfterTomorrowStart));
    params.push(formatISO(tomorrowStart));
    params.push(formatISO(dayAfterTomorrowStart));
  }

  if (!showDone) {
    where.push(`(status = 0)`);
  }

  if (where.length) {
    parts.push(' WHERE ');
    parts.push(where.join(' AND '));
  }

  parts.push(
    `ORDER BY 
      CASE 
        WHEN showAfter IS NOT NULL THEN updatedAt 
        ELSE NULL 
      END DESC,
      CASE 
        WHEN showAfter IS NULL AND dueDate IS NULL THEN updatedAt 
        ELSE NULL 
      END DESC,
      CASE 
        WHEN dueDate IS NOT NULL THEN dueDate 
        ELSE NULL 
      END ASC`,
  );

  const sql = parts.join(' ');
  return await query<Task>(sql, params);
};

export const updateTaskStatus = async (taskId: number, status: boolean) => {
  await query('UPDATE tasks SET status = ? WHERE id = ?', [
    status ? 1 : 0,
    taskId,
  ]);
};

export const getTasksByGoogleEventIds = async (
  eventIds: string[],
): Promise<Task[]> => {
  const placeholders = eventIds.map(() => '?').join(',');
  const sql = `SELECT * FROM tasks WHERE google_event_id IN (${placeholders})`;
  return await query<Task>(sql, eventIds);
};
