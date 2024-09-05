import { createSlice } from '@reduxjs/toolkit';

const tokenSlice = createSlice({
  name: 'token',
  initialState: {
    value: ''
  },
  reducers: {
    getToken: (state, action) => {
      state.value = action.payload.value;
    }
  },
});

// Exportar las acciones generadas automáticamente
export const { getToken } = tokenSlice.actions;

// Exportar el reducer
export default tokenSlice.reducer;