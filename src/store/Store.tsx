import { configureStore } from "@reduxjs/toolkit";
import { stacksApi } from "./userSlice";

export const store = configureStore({
  reducer: {
    [stacksApi.reducerPath]: stacksApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(stacksApi.middleware),
});
