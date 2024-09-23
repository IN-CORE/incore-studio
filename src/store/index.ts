import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import projectSlice from "../reducer/projectSlice";

// Combine multiple reducers
const rootReducer = combineReducers({
    project: projectSlice
});

// Create and export the store
const store = configureStore({
    reducer: rootReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
