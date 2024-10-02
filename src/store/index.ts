import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import dataSlice from "@app/reducer/dataSlice";
import projectSlice from "@app/reducer/projectSlice";
import dfr3MappingSlice from "@app/reducer/dfr3MappingSlice";

// Combine multiple reducers
const rootReducer = combineReducers({
    project: projectSlice,
    data: dataSlice,
    dfr3: dfr3MappingSlice
});

// Create and export the store
const store = configureStore({
    reducer: rootReducer
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

export default store;
