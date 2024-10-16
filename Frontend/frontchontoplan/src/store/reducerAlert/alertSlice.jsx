import { createSlice } from '@reduxjs/toolkit';

const alertSlice = createSlice({
  name: 'alert',
  initialState: {
    isActive: false,   // Estado de la alerta (visible o no)
    type: 'info',      // Tipo de alerta ('success', 'error', 'warning', 'info')
    message: '',       // Mensaje de la alerta
  },
  reducers: {
    showAlert: (state, action) => {
      state.isActive = true;
      state.type = action.payload.type;
      state.message = action.payload.message;
    },
    hideAlert: (state) => {
      state.isActive = false;
      state.type = 'info';
      state.message = '';
    },
  },
});

// Exportar las acciones generadas automáticamente
export const { showAlert, hideAlert } = alertSlice.actions;

// Exportar el reducer
export default alertSlice.reducer;