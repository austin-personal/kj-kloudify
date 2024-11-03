// src/store/loadingSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoadingState {
  isLoading: boolean;
  isReviewReady: boolean;
  hasSecret: boolean;
}

const initialState: LoadingState = {
  isLoading: false,
  isReviewReady: false,
  hasSecret: false, 
};

const loadingSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setReviewReady: (state, action: PayloadAction<boolean>) => {
        state.isReviewReady = action.payload;
    },
    setHasSecret: (state, action: PayloadAction<boolean>) => {
      state.hasSecret = action.payload; // hasSecret 설정 리듀서
    },
  },
});

export const { setLoading, setReviewReady, setHasSecret} = loadingSlice.actions;
export default loadingSlice.reducer;