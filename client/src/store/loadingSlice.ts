// src/store/loadingSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface LoadingState {
  isLoading: boolean;
  isReviewReady: boolean;
}

const initialState: LoadingState = {
  isLoading: false,
  isReviewReady: false,
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
  },
});

export const { setLoading, setReviewReady } = loadingSlice.actions;
export default loadingSlice.reducer;