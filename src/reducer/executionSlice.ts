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
    executionParametersAndInputsChecked: {},
    sidePanelData: {
        open: false,
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

export const createNewExecution = createAsyncThunk("execution/createExecution", async (execution: ExecutionCreate) => {
    const response = await axios.post(`${DATAWOLF_API_URL}/executions`, execution, { headers: getHeaders() });
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
            state.executionParametersAndInputsChecked = {};
            state.sidePanelData = {
                open: false,
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
            state.executionParametersAndInputsChecked = checkedData;
        },
        updateExecutionSidePanelCheckStatus: (state, action) => {
            state.executionParametersAndInputsChecked[action.payload] = true;
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
                currentAnalysis: {
                    name: "",
                    id: "",
                    inputDatasets: [],
                    inputParameters: [],
                    outputDatasets: []
                }
            };
        },
        setCreateExecutionTemplate: (state, action) => {
            state.createExecution = action.payload;
        },
        updateCreateExecutionTemplateDatasetAndParams: (state, action) => {
            state.createExecution.datasets = {
                ...state.createExecution.datasets,
                ...action.payload.datasets
            };
            state.createExecution.parameters = {
                ...state.createExecution.parameters,
                ...action.payload.parameters
            };
        },
        updateCreateExecutionTemplate: (state, action) => {
            state.createExecution = {
                ...state.createExecution,
                ...action.payload
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
    clearSidePanelData,
    setCreateExecutionTemplate,
    updateCreateExecutionTemplateDatasetAndParams,
    updateCreateExecutionTemplate
} = executionSlice.actions;

export default executionSlice.reducer;
