import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isActive: false, // 초기 상태는 false로 설정
};

const btnSlice = createSlice({
    name: 'button',
    initialState,
    reducers: {
        activate: (state) => {
            state.isActive = true;
        },
        deactivate: (state) => {
            state.isActive = false;
        },
        toggle: (state) => {
            state.isActive = !state.isActive;
        },
    },
});

export const { activate, deactivate, toggle } = btnSlice.actions;
export default btnSlice.reducer;
