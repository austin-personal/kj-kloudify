// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import loadingReducer from "./loadingSlice";
import finishDataReducer from "./finishDataSlice";
import btnReducer from './btnSlice';

const store = configureStore({
  reducer: {
    loading: loadingReducer,
    finishData: finishDataReducer,
    button: btnReducer,
  },
});

// RootState와 AppDispatch 타입을 export
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
