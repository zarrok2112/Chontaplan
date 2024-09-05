// store.js
import { configureStore } from '@reduxjs/toolkit';
import alertReducer from './reducerAlert/alertSlice';
import tokenReducer from './reducerToken/tokenSlice';

const store = configureStore({
  reducer: {
    alert: alertReducer, 
    token:tokenReducer,
  },
});

export default store;