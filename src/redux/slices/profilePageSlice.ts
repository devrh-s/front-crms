import { createSlice } from '@reduxjs/toolkit';

interface IProfilePage {
  name: string;
}

const initialState: IProfilePage = { name: '' };

export const profilePageSlice = createSlice({
  name: 'profilePage',
  initialState,
  reducers: {
    setProfilePageName: (state, action) => {
      state.name = action.payload;
    },
    clearProfilePage: () => initialState,
  },
});

export const { setProfilePageName, clearProfilePage } = profilePageSlice.actions;

export default profilePageSlice.reducer;
