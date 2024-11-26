import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getHeaders } from "@app/utils";
import config from "@app/app.config";

const DATAWOLF_API_URL = config.datawolfApi;

const initialExecutionReactFlowState = {
    nodes: [],
    edges: []
};

const initialState: ExecutionState = {
    executionReactFlowState: initialExecutionReactFlowState,
    currentExecution: null,
    loading: false,
    error: null
};

export const getExecutionById = createAsyncThunk("execution/getExecutionById", async (executionId: string) => {
    const response = await axios.get(`${DATAWOLF_API_URL}/executions/${executionId}`, { headers: getHeaders() });
    return response.data;
});

const executionSlice = createSlice({
    name: "execution",
    initialState,
    reducers: {
        resetExecutionState: (state) => {
            state.currentExecution = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getExecutionById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getExecutionById.fulfilled, (state, action) => {
                if (action.payload === "") {
                    state.currentExecution = null;
                    state.loading = false;
                    state.error = "Execution not found";
                    return;
                }
                state.currentExecution = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(getExecutionById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to get execution";
            });
    }
});

export const { resetExecutionState } = executionSlice.actions;

export default executionSlice.reducer;
