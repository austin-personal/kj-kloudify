import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TerraInfoState {
  data: any | null; // data의 타입에 따라 수정해주세요.
}

const initialState: TerraInfoState = {
  data: null,
};

const dataSlice = createSlice({
  name: 'terraInfo',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<any>) => {
      state.data = action.payload;
    },
    clearData: (state) => {
      state.data = null;
    },
  },
});

export const { setData, clearData } = dataSlice.actions;
export default dataSlice.reducer;
