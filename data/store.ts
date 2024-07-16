import {configureStore} from '@reduxjs/toolkit';
import tasksReducer from './redux/tasksSlice';
import buttonsReducer from './redux/buttonSlice';
import doneReducer from './redux/doneSlice';
import profileReducer from './redux/profileSlice';
import taskHistoryModalReducer from './redux/taskHistoryModalSlice';

const store = configureStore({
  reducer: {
    profile: profileReducer,
    tasks: tasksReducer,
    button: buttonsReducer,
    done: doneReducer,
    taskHistoryModal: taskHistoryModalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
