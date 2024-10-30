import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
// import { getHeaders } from "@app/utils";
import { addNewAnalysisNodesAndEdgesWorkflow } from "@app/components/Workflow/workflowUtils";

// const DATAWOLF_API_URL = `${window.API_SERVER}/datawolf`;
const DATAWOLF_API_URL = `http://localhost:8888/datawolf`;

const initialReactFlowWorkflow = {
    nodes: [],
    edges: []
};

const initialState: WorkflowState = {
    reactFlowWorkflow: initialReactFlowWorkflow,
    datawolfUser: null,
    datawolfUserLoading: false,
    datawolfUserError: null,
    datawolfWorkflowID: null,
    currentWorkflow: null,
    createdWorkflowLoading: false,
    createdWorkflowError: null,
    workflowLoading: false,
    workflowError: null,
    saveWorkflowError: null,
    saveWorkflowLoading: false,
    saveWorkflowSuccess: false,
    datawolfTools: [],
    datawolfToolLoading: false,
    datawolfToolError: null,
    dependencyGraph: null,
    dependencyGraphLoading: false,
    dependencyGraphError: null
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

        const response = await axios.get(`${DATAWOLF_API_URL}/persons`, {
            // headers: getHeaders(), // only needed when datawolf is behind incore-auth
            params
        });

        return response.data[0];
    }
);

export const createNewWorkflow = createAsyncThunk(
    "workflow/createNewWorkflow",
    async ({ title, description, creator }: { title: string; description: string; creator: DatawolfCreator }) => {
        const response = await axios.post(`${DATAWOLF_API_URL}/workflows`, {
            title: title,
            description: description,
            creator: creator,
            contributors: [],
            steps: []
        });

        return response.data;
    }
);

export const getWorkflow = createAsyncThunk(
    "workflow/getWorkflow",
    async ({ workflowID }: { workflowID: string | undefined }) => {
        if (!workflowID) {
            throw new Error("No workflow ID provided");
        }
        const response = await axios.get(`${DATAWOLF_API_URL}/workflows/${workflowID}`);

        return response.data;
    }
);

export const saveWorkflow = createAsyncThunk(
    "workflow/saveWorkflow",
    async ({ workflowID, workflow }: { workflowID: string; workflow: DatawolfWorkflowFile }) => {
        const response = await axios.put(`${DATAWOLF_API_URL}/workflows/${workflowID}`, workflow);

        return response.data;
    }
);

export const getWorkflowTools = createAsyncThunk("workflow/getWorkflowTools", async () => {
    const response = await axios.get(`${DATAWOLF_API_URL}/workflowtools`);

    return response.data;
});

export const getDependencyGraph = createAsyncThunk("workflow/getDependencyGraph", async () => {
    const response = await axios.get("dependencyGraph.json");

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
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getDatawolfUser.pending, (state) => {
                state.datawolfUserLoading = true;
                state.datawolfUserError = null;
            })
            .addCase(getDatawolfUser.fulfilled, (state, action) => {
                state.datawolfUserLoading = false;
                state.datawolfUser = action.payload;
            })
            .addCase(getDatawolfUser.rejected, (state, action) => {
                state.datawolfUserLoading = false;
                state.datawolfUserError = action.error.message || "Failed to fetch user from datawolf";
            })
            .addCase(createNewWorkflow.pending, (state) => {
                state.createdWorkflowLoading = true;
                state.createdWorkflowError = null;
            })
            .addCase(createNewWorkflow.fulfilled, (state, action) => {
                state.createdWorkflowLoading = false;
                state.currentWorkflow = action.payload;
                state.reactFlowWorkflow = addNewAnalysisNodesAndEdgesWorkflow(action.payload, state.dependencyGraph);
                state.datawolfWorkflowID = action.payload.id;
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
                state.currentWorkflow = action.payload;
                state.reactFlowWorkflow = addNewAnalysisNodesAndEdgesWorkflow(action.payload, state.dependencyGraph);
                state.datawolfWorkflowID = action.payload.id;
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
                state.datawolfToolLoading = true;
                state.datawolfToolError = null;
            })
            .addCase(getWorkflowTools.fulfilled, (state, action) => {
                state.datawolfToolLoading = false;
                state.datawolfTools = action.payload;
            })
            .addCase(getWorkflowTools.rejected, (state, action) => {
                state.datawolfToolLoading = false;
                state.datawolfToolError = action.error.message || "Failed to fetch workflow tools";
            })
            .addCase(getDependencyGraph.pending, (state) => {
                state.dependencyGraphLoading = true;
                state.dependencyGraphError = null;
            })
            .addCase(getDependencyGraph.fulfilled, (state, action) => {
                state.dependencyGraphLoading = false;
                state.dependencyGraph = action.payload;
            })
            .addCase(getDependencyGraph.rejected, (state, action) => {
                state.dependencyGraphLoading = false;
                state.dependencyGraphError = action.error.message || "Failed to fetch dependency graph";
            });
    }
});

export const { setWorkflow, clearWorkflowState } = workflowSlice.actions;

export default workflowSlice.reducer;
