// src/store/loadingSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Local storage에서 finishData 불러오기
const loadFinishData = () => {
  try {
    const data = localStorage.getItem('finishData');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Local storage에 finishData 저장하기
const saveFinishData = (data: string[]) => {
  try {
    localStorage.setItem('finishData', JSON.stringify(data));
  } catch {
    // 저장 실패 시 별도 처리하지 않음
  }
};

interface finishDataState {
  finishData:string[];

}

const initialState: finishDataState = {

  finishData: loadFinishData(),
};

const finishDataSlice = createSlice({
  name: "loading",
  initialState,
  reducers: {
    setFinishData: (state, action: PayloadAction<string[]>) => {
      state.finishData = action.payload;
      saveFinishData(action.payload);
    },
    addFinishData: (state, action: PayloadAction<string>) => {
      state.finishData.push(action.payload);
    },
    clearFinishData: (state) => {
      state.finishData = [];
    },
  },
});

export const { setFinishData, addFinishData, clearFinishData } = finishDataSlice.actions;
export default finishDataSlice.reducer;