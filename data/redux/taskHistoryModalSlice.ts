import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TaskHistoryModalState {
  isVisible: boolean;
  taskId: number | null;
}

const initialState: TaskHistoryModalState = {
  isVisible: false,
  taskId: null,
};

const taskHistoryModalSlice = createSlice({
  name: 'taskHistoryModal',
  initialState,
  reducers: {
    openTaskHistoryModal: (state, action: PayloadAction<number>) => {
      state.isVisible = true;
      state.taskId = action.payload;
    },
    closeTaskHistoryModal: (state) => {
      state.isVisible = false;
      state.taskId = null;
    },
  },
});

export const { openTaskHistoryModal, closeTaskHistoryModal } = taskHistoryModalSlice.actions;

export default taskHistoryModalSlice.reducer;
