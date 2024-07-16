import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {addDays, setHours, setMinutes, setSeconds, formatISO} from 'date-fns';
import {Task} from '../entities/tasks';
import {
  getTasks,
  insertTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  insertTaskHistoryLog,
} from '../database';
import {ButtonState} from './buttonSlice';
import {postTaskToCalendar} from '../calendar/api';
import {TaskHistoryAction} from '../entities/taskHistoryLog';

// Define the initial state using the Task type
interface TasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
};

// Async thunks for database operations
interface FetchTasksParams {
  buttonState: ButtonState;
  showDone?: boolean;
}

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({buttonState, showDone}: FetchTasksParams) => {
    const tasks = await getTasks(buttonState, showDone);
    return tasks;
  },
);

export const addTask = createAsyncThunk('tasks/addTask', async (task: Task) => {
  const newTask = await insertTask(task);
  insertTaskHistoryLog(newTask.id, TaskHistoryAction.CreationByUser, newTask);

  await postTaskToCalendar(newTask);

  return newTask;
});

export const editTask = createAsyncThunk(
  'tasks/editTask',
  async (task: Task) => {
    await updateTask(task);
    return task;
  },
);

export const prepareTaskForTomorrow = (task: Task) => {
  const originalTask = {...task};
  const tomorrow = addDays(new Date(), 1);
  const showAfter = setSeconds(setMinutes(setHours(tomorrow, 6), 0), 0);

  const updatedTask = {
    ...task,
    showAfter: formatISO(showAfter),
  };
  if (task.dueDate) {
    updatedTask.dueDate = formatISO(addDays(task.dueDate, 1));
  }
  return {originalTask, updatedTask};
};

export const prepareTaskForYesterday = (task: Task) => {
  const originalTask = {...task};

  const updatedTask = {
    ...task,
  };
  delete updatedTask.showAfter;
  if (task.dueDate) {
    updatedTask.dueDate = formatISO(addDays(task.dueDate, -1));
  }
  return {originalTask, updatedTask};
};

export const removeTask = createAsyncThunk(
  'tasks/removeTask',
  async (id: number) => {
    await deleteTask(id);
    return id;
  },
);

export const setStatus = createAsyncThunk(
  'tasks/setStatus',
  async ({taskId, status}: {taskId: number; status: boolean}) => {
    await updateTaskStatus(taskId, status);
    return {taskId, status};
  },
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchTasks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action: PayloadAction<Task[]>) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      .addCase(addTask.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(addTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add task';
      })
      // .addCase(moveTaskToTomorrow.pending, state => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(
      //   moveTaskToTomorrow.fulfilled,
      //   (state, action: PayloadAction<Task>) => {
      //     state.loading = false;
      //     const index = state.tasks.findIndex(
      //       task => task.id === action.payload.id,
      //     );
      //     if (index !== -1) {
      //       state.tasks[index] = action.payload;
      //     }
      //   },
      // )
      // .addCase(moveTaskToTomorrow.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.error.message || 'Failed to add task';
      // })
      .addCase(editTask.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        const index = state.tasks.findIndex(
          task => task.id === action.payload.id,
        );
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(editTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update task';
      })
      .addCase(
        setStatus.fulfilled,
        (state, action: PayloadAction<{taskId: number; status: boolean}>) => {
          const {taskId, status} = action.payload;
          const taskIndex = state.tasks.findIndex(task => task.id === taskId);
          if (taskIndex !== -1) {
            state.tasks[taskIndex].status = status ? 1 : 0;
          }
        },
      )
      .addCase(removeTask.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeTask.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
      })
      .addCase(removeTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete task';
      });
  },
});

export default tasksSlice.reducer;
