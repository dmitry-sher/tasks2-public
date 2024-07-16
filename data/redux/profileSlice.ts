import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ProfileState {
  name: string;
  photoUrl: string;
  email: string;
}

const initialState: ProfileState = {
  name: '',
  photoUrl: '',
  email: '',
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<ProfileState>) => {
      state.name = action.payload.name;
      state.photoUrl = action.payload.photoUrl;
      state.email = action.payload.email;
    },
    clearProfile: (state) => {
      state.name = '';
      state.photoUrl = '';
      state.email = '';
    },
  },
});

export const { setProfile, clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
