// doneSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface DoneState {
  showDone: boolean;
}

const initialState: DoneState = {
  showDone: false,
};

const doneSlice = createSlice({
  name: 'done',
  initialState,
  reducers: {
    toggleShowDone(state) {
      state.showDone = !state.showDone;
    },
    setShowDone(state, action: PayloadAction<boolean>) {
      state.showDone = action.payload;
    },
  },
});

export const {toggleShowDone, setShowDone} = doneSlice.actions;
export default doneSlice.reducer;
