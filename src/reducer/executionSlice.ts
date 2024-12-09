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
    error: null,
    sidePanelData: {
        open: false,
        executionParametersAndInputsChecked: {},
        currentAnalysis: {
            name: "",
            id: "",
            inputDatasets: [],
            inputParameters: [],
            outputDatasets: []
        }
    },
    createExecution: {
        deleted: false,
        title: "",
        description: "",
        workflowId: "",
        creatorId: "",
        parameters: {},
        datasets: {}
    }
};

export const getExecutionById = createAsyncThunk("execution/getExecutionById", async (executionId: string) => {
    const response = await axios.get(`${DATAWOLF_API_URL}/executions/${executionId}`, { headers: getHeaders() });
    return response.data;
});

const executionSlice = createSlice({
    name: "execution",
    initialState,
    reducers: {
        setCurrentExecution: (state, action) => {
            if (action.payload === "") {
                state.currentExecution = null;
                state.loading = false;
                state.error = "Execution not found";
                return;
            }
            state.currentExecution = action.payload;
            state.loading = false;
            state.error = null;
        },
        resetExecutionState: (state) => {
            state.currentExecution = null;
            state.executionReactFlowState = initialExecutionReactFlowState;
            state.sidePanelData = {
                open: false,
                executionParametersAndInputsChecked: {},
                currentAnalysis: {
                    name: "",
                    id: "",
                    inputDatasets: [],
                    inputParameters: [],
                    outputDatasets: []
                }
            };
            state.loading = false;
            state.error = null;
        },
        toggleSidePanel: (state) => {
            state.sidePanelData.open = !state.sidePanelData.open;
        },
        setExecutionSidePanelCheckStatus: (state, action) => {
            let checkedData: { [key: string]: boolean } = {};
            action.payload.forEach((item: string) => {
                checkedData[item] = false;
            });
            state.sidePanelData.executionParametersAndInputsChecked = checkedData;
        },
        updateExecutionSidePanelCheckStatus: (state, action) => {
            state.sidePanelData.executionParametersAndInputsChecked[action.payload] = true;
        },
        setExecutionSidePanelData: (state, action) => {
            state.sidePanelData = {
                ...state.sidePanelData,
                ...action.payload
            };
        },
        clearSidePanelData: (state) => {
            state.sidePanelData = {
                open: false,
                executionParametersAndInputsChecked: {},
                currentAnalysis: {
                    name: "",
                    id: "",
                    inputDatasets: [],
                    inputParameters: [],
                    outputDatasets: []
                }
            };
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

export const {
    resetExecutionState,
    setCurrentExecution,
    toggleSidePanel,
    setExecutionSidePanelCheckStatus,
    updateExecutionSidePanelCheckStatus,
    setExecutionSidePanelData,
    clearSidePanelData
} = executionSlice.actions;

export default executionSlice.reducer;
