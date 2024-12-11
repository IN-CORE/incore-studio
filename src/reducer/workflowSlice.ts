import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getHeaders } from "@app/utils";
import config from "@app/app.config";
import { addNewAnalysisNodesAndEdgesWorkflow } from "@app/components/Workflow/workflowUtils";

const DATAWOLF_API_URL = config.datawolfApi;
// const DATAWOLF_API_URL = `http://localhost:8888/datawolf`;

const initialReactFlowWorkflow = {
    nodes: [],
    edges: []
};

const initialState: WorkflowState = {
    reactFlowWorkflow: initialReactFlowWorkflow,
    datawolfUser: null,
    datawolfWorkflowID: null,
    currentWorkflow: null,
    createdWorkflowLoading: false,
    createdWorkflowError: null,
    workflowInvalid: false,
    workflowLoading: false,
    workflowError: null,
    saveWorkflowError: null,
    saveWorkflowLoading: false,
    saveWorkflowSuccess: false,
    datawolfTools: [],
    dependencyGraph: null,
    sidePanelData: {
        open: false,
        type: "",
        currentAnalysis: {
            name: "",
            id: ""
        }
    },
    hoveredAnalysis: null,
    executions: [],
    loading: false,
    error: null
};

export const getDatawolfUser = createAsyncThunk(
    "workflow/getDatawolfUser",
    async ({ email }: { email: string | undefined }) => {
        if (!email) {
            throw new Error("No email provided");
        }
        const params: Record<string, string | undefined> = { email };

        if (email && email.trim() !== "") {
            params.email = email;
        }

        // const response = await axios.get(`${DATAWOLF_API_URL}/persons`, {
        //     // headers: getHeaders(), // only needed when datawolf is behind incore-auth
        //     params
        // });
        const response = await axios.get(`${DATAWOLF_API_URL}/persons`, {
            headers: getHeaders(), // only needed when datawolf is behind incore-auth
            params
        });

        return response.data;
    }
);

export const createNewWorkflow = createAsyncThunk(
    "workflow/createNewWorkflow",
    async ({
        title,
        description,
        creator
    }: {
        title: string;
        description: string;
        creator:
            | DatawolfCreator
            | { email: string | undefined; firstName: string | undefined; lastName: string | undefined };
    }) => {
        const response = await axios.post(
            `${DATAWOLF_API_URL}/workflows`,
            {
                title: title,
                description: description,
                creator: creator,
                contributors: [],
                steps: []
            },
            { headers: getHeaders() }
        );

        return response.data;
    }
);

export const getWorkflow = createAsyncThunk(
    "workflow/getWorkflow",
    async ({ workflowID, isExecution = false }: { workflowID: string | undefined; isExecution?: boolean }) => {
        if (!workflowID) {
            throw new Error("No workflow ID provided");
        }
        const response = await axios.get(`${DATAWOLF_API_URL}/workflows/${workflowID}`, { headers: getHeaders() });
        // const response = await axios.get(`${DATAWOLF_API_URL}/workflows/${workflowID}`);

        return { data: response.data, isExecution };
    }
);

export const saveWorkflow = createAsyncThunk(
    "workflow/saveWorkflow",
    async ({ workflowID, workflow }: { workflowID: string; workflow: DatawolfWorkflowFile }) => {
        // const response = await axios.put(`${DATAWOLF_API_URL}/workflows/${workflowID}`, workflow);
        const response = await axios.put(`${DATAWOLF_API_URL}/workflows/${workflowID}`, workflow, {
            headers: getHeaders()
        });

        return response.data;
    }
);

export const getWorkflowTools = createAsyncThunk("workflow/getWorkflowTools", async () => {
    // const response = await axios.get(`${DATAWOLF_API_URL}/workflowtools`);
    const response = await axios.get(`${DATAWOLF_API_URL}/workflowtools`, { headers: getHeaders() });

    return response.data;
});

export const getExecutionsByWorkflowID = createAsyncThunk(
    "workflow/getExecutionsByWorkflowID",
    async ({ workflowID }: { workflowID: string }) => {
        const response = await axios.get(`${DATAWOLF_API_URL}/workflows/${workflowID}/executions`, {
            headers: getHeaders()
        });

        return response.data;
    }
);

export const getDependencyGraph = createAsyncThunk("workflow/getDependencyGraph", async () => {
    const response = await axios.get("/config/dependencyGraph.json");

    return response.data;
});

const workflowSlice = createSlice({
    name: "workflow",
    initialState,
    reducers: {
        setWorkflow: (state, action) => {
            state.reactFlowWorkflow = action.payload;
        },
        clearWorkflowState: (state) => {
            state.reactFlowWorkflow = initialReactFlowWorkflow;
            state.datawolfWorkflowID = null;
            state.currentWorkflow = null;
        },
        setSidePanelData: (state, action) => {
            state.sidePanelData = action.payload;
        },
        clearSidePanelData: (state) => {
            state.sidePanelData = {
                open: false,
                type: "",
                currentAnalysis: {
                    name: "",
                    id: ""
                }
            };
        },
        setHoveredAnalysis: (state, action) => {
            state.hoveredAnalysis = action.payload;
        },
        clearHoveredAnalysis: (state) => {
            state.hoveredAnalysis = null;
        },
        raiseWorkflowError: (state, action) => {
            state.workflowError = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getDatawolfUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDatawolfUser.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.length !== 0) {
                    state.datawolfUser = action.payload[0];
                }
            })
            .addCase(getDatawolfUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch user from datawolf";
            })
            .addCase(createNewWorkflow.pending, (state) => {
                state.createdWorkflowLoading = true;
                state.createdWorkflowError = null;
            })
            .addCase(createNewWorkflow.fulfilled, (state, action) => {
                state.createdWorkflowLoading = false;
                let parsedWorkflow = addNewAnalysisNodesAndEdgesWorkflow(action.payload, state.dependencyGraph);
                if (parsedWorkflow.valid) {
                    state.currentWorkflow = action.payload;
                    state.reactFlowWorkflow = parsedWorkflow.workflow;
                    state.datawolfWorkflowID = action.payload.id;
                    state.workflowInvalid = false;
                } else {
                    state.workflowInvalid = true;
                    state.currentWorkflow = action.payload;
                    state.createdWorkflowError = parsedWorkflow.reason;
                }
            })
            .addCase(createNewWorkflow.rejected, (state, action) => {
                state.createdWorkflowLoading = false;
                state.createdWorkflowError = action.error.message || "Failed to create new workflow";
            })
            .addCase(getWorkflow.pending, (state) => {
                state.workflowLoading = true;
                state.workflowError = null;
            })
            .addCase(getWorkflow.fulfilled, (state, action) => {
                state.workflowLoading = false;
                if (action.payload.data !== "") {
                    let parsedWorkflow = addNewAnalysisNodesAndEdgesWorkflow(
                        action.payload.data,
                        state.dependencyGraph,
                        action.payload.isExecution
                    );
                    if (parsedWorkflow.valid) {
                        state.currentWorkflow = action.payload.data;
                        state.reactFlowWorkflow = parsedWorkflow.workflow;
                        state.datawolfWorkflowID = action.payload.data.id;
                        state.workflowInvalid = false;
                    } else {
                        state.workflowInvalid = true;
                        state.currentWorkflow = action.payload.data;
                        state.workflowError = parsedWorkflow.reason;
                    }
                } else {
                    state.workflowInvalid = true;
                    state.workflowError = "Workflow not found with the provided ID";
                }
            })
            .addCase(getWorkflow.rejected, (state, action) => {
                state.workflowLoading = false;
                state.workflowError = action.error.message || "Failed to fetch workflow";
            })
            .addCase(saveWorkflow.pending, (state) => {
                state.saveWorkflowLoading = true;
                state.saveWorkflowError = null;
            })
            .addCase(saveWorkflow.fulfilled, (state, action) => {
                state.saveWorkflowLoading = false;
                state.saveWorkflowSuccess = true;
                state.currentWorkflow = action.payload;
            })
            .addCase(saveWorkflow.rejected, (state, action) => {
                state.saveWorkflowLoading = false;
                state.saveWorkflowSuccess = false;
                state.saveWorkflowError = action.error.message || "Failed to save workflow";
            })
            .addCase(getWorkflowTools.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getWorkflowTools.fulfilled, (state, action) => {
                state.loading = false;
                state.datawolfTools = action.payload;
            })
            .addCase(getWorkflowTools.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch workflow tools";
            })
            .addCase(getDependencyGraph.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDependencyGraph.fulfilled, (state, action) => {
                state.loading = false;
                state.dependencyGraph = action.payload;
            })
            .addCase(getDependencyGraph.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch dependency graph";
            })
            .addCase(getExecutionsByWorkflowID.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getExecutionsByWorkflowID.fulfilled, (state, action) => {
                state.loading = false;
                state.executions = action.payload;
            })
            .addCase(getExecutionsByWorkflowID.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch executions";
            });
    }
});

export const {
    setWorkflow,
    clearWorkflowState,
    setSidePanelData,
    clearSidePanelData,
    setHoveredAnalysis,
    clearHoveredAnalysis,
    raiseWorkflowError
} = workflowSlice.actions;

export default workflowSlice.reducer;
