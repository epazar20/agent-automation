import { configureStore } from '@reduxjs/toolkit';
import flowReducer from './slices/flowSlice';
import settingsReducer from './slices/settingsSlice';
import historyReducer from './slices/historySlice';
import customerReducer from './slices/customerSlice';

export const store = configureStore({
  reducer: {
    flow: flowReducer,
    settings: settingsReducer,
    history: historyReducer,
    customer: customerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 