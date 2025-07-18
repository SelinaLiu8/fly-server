import { configureStore } from '@reduxjs/toolkit';
import appStateReducer from '../features/appState/appStateSlicer';


export const store = configureStore({
  reducer: {
    appState: appStateReducer,
  },
});
