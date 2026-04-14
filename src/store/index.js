import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import communityReducer from './slices/communitySlice';
import chatReducer from './slices/chatSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth:      authReducer,
    community: communityReducer,
    chat:      chatReducer,
    ui:        uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
