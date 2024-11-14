import { configureStore } from '@reduxjs/toolkit';
import alertReducer from './reducerAlert/alertSlice';
import tokenReducer from './reducerToken/tokenSlice';
import sessionReducer from './reducerSession/sessionSlice';

const store = configureStore({
  reducer: {
    alert: alertReducer, 
    token:tokenReducer,
    session:sessionReducer,
  },
});

export default store;