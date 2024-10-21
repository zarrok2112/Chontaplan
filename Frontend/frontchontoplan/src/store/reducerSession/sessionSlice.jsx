import { createSlice } from '@reduxjs/toolkit';

const sessionSlice = createSlice({
  name: 'session',
  initialState: {
    isActiveUser: false,
    infoUser:''
  },
  reducers: {
    isActive: (state, action) => {
      state.isActive = action.payload.isActive;
      state.infoUser = action.payload.infoUser;
    },
    noActive: (state) => {
        state.isActive = false;
        state.infoUser = '';
    }
  },
});

// Exportar las acciones generadas automáticamente
export const { isActive,noActive } = sessionSlice.actions;

// Exportar el reducer
export default sessionSlice.reducer;