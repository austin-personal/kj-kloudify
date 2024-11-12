import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // 로컬 스토리지 사용
import { combineReducers } from "redux"; // combineReducers 임포트
import loadingReducer from "./loadingSlice";
import finishDataReducer from "./finishDataSlice";
import btnReducer from "./btnSlice";
import dataReducer from "./dataSlice";

// combineReducers로 리듀서를 합침
const rootReducer = combineReducers({
  terraInfo: dataReducer,
  loading: loadingReducer, // 'loading' 상태가 포함된 리듀서
  finishData: finishDataReducer,
  button: btnReducer,
});

// persist 설정
const persistConfig = {
  key: "root",
  storage, // 로컬 스토리지 사용
  whitelist: ["loading.isReviewReady"], // 'loading' 리듀서만 persist
};

// persistReducer 적용
const persistedReducer = persistReducer(persistConfig, rootReducer);

// store 설정
const store = configureStore({
  reducer: persistedReducer, // persistedReducer를 사용
});

// persistStore 설정
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
