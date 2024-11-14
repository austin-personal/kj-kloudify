import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // 로컬 스토리지 사용
import { combineReducers } from "redux"; // combineReducers 임포트
import loadingReducer from "./loadingSlice";
import finishDataReducer from "./finishDataSlice";
import btnReducer from "./btnSlice";
import dataReducer from "./dataSlice";

// loading 리듀서에 대한 persist 설정
const loadingPersistConfig = {
  key: "loading",
  storage,
  whitelist: ["isReviewReady"], // 'isReviewReady'만 persist
};

// loadingReducer에만 persist를 적용
const persistedLoadingReducer = persistReducer(loadingPersistConfig, loadingReducer);

// combineReducers로 리듀서를 합침
const rootReducer = combineReducers({
  terraInfo: dataReducer,
  loading: persistedLoadingReducer, // 'loading' 상태가 포함된 리듀서
  finishData: finishDataReducer,
  button: btnReducer,
});

// store 설정
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// persistStore 설정
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
