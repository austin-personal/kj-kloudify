// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import loadingReducer from "./loadingSlice";

const store = configureStore({
  reducer: {
    loading: loadingReducer,
  },
});

// RootState와 AppDispatch 타입을 export
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
