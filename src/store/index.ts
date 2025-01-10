import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import projectSlice from "@app/reducer/projectSlice";
import workflowSlice from "@app/reducer/workflowSlice";
import executionSlice from "@app/reducer/executionSlice";

// Combine multiple reducers
const rootReducer = combineReducers({
    project: projectSlice,
    workflow: workflowSlice,
    execution: executionSlice
});

// Create and export the store
const store = configureStore({
    reducer: rootReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
