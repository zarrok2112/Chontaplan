// store.js
import { configureStore } from '@reduxjs/toolkit';
import alertReducer from './reducerAlert/alertSlice';  // Importa el nuevo reducer de la alerta

const store = configureStore({
  reducer: {
    alert: alertReducer,      // Añade el reducer de la alerta
  },
});

export default store;