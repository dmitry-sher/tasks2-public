import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export enum ButtonState {
  Today = 'Today',
  Tomorrow = 'Tomorrow',
  All = 'All',
}

interface ButtonStateType {
  activeButton: ButtonState;
}

const initialState: ButtonStateType = {
  activeButton: ButtonState.Today,
};

const buttonSlice = createSlice({
  name: 'button',
  initialState,
  reducers: {
    setActiveButton(state, action: PayloadAction<ButtonState>) {
      state.activeButton = action.payload;
    },
  },
});

export const {setActiveButton} = buttonSlice.actions;
export default buttonSlice.reducer;
