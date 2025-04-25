import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  screen: 1,
  hamburger: false,
  themeColor: false,
  fontSize: 23,
  menu: null,
  highlights: [],
  // Add more state as needed
};

export const appStateSlice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    setScreen: (state, action) => {
      state.screen = action.payload;
    },
    toggleHamburger: (state) => {
      state.hamburger = !state.hamburger;
    },
    toggleThemeColor: (state) => {
      state.themeColor = !state.themeColor;
    },
    setFontSize: (state, action) => {
      state.fontSize = action.payload;
    },
    setMenu: (state, action) => {
      state.menu = action.payload;
    },
    setHighlights: (state, action) => {
      state.highlights = action.payload;
    },
  },
});

export const {
  setScreen,
  toggleHamburger,
  toggleThemeColor,
  setFontSize,
  setMenu,
  setHighlights,
} = appStateSlice.actions;

export default appStateSlice.reducer;
