import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers/rootSlice";

export const store = configureStore({
  reducer: {
    root: rootReducer,
  },
});
