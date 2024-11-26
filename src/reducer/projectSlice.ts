import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getHeaders } from "@app/utils";
import config from "@app/app.config";

const PROJECT_API_URL = config.projectApi;

const initialState: ProjectState = {
    projects: <Project[]>[],
    project: null,
    deletedProjectId: <string>"",
    projectDatasets: <Dataset[]>[],
    deletedDatasetIds: <string[]>[],
    projectHazards: <Hazard[]>[],
    deletedHazardIds: <string[]>[],
    projectDFR3Mappings: <DFR3Mapping[]>[],
    deletedDFR3MappingIds: <string[]>[],
    projectWorkflows: <Workflow[]>[],
    deletedWorkflowIds: <string[]>[],
    projectVisualizations: <Visualization[]>[],
    deletedVisualizationIds: <string[]>[],
    loading: false,
    error: null
};

export const getProjects = createAsyncThunk(
    "projects/getProjects",
    async ({
        name,
        creator,
        region,
        skip = 0,
        limit = 9
    }: {
        name?: string;
        creator?: string;
        region?: string;
        skip?: number;
        limit?: number;
    }) => {
        // Create a params object and filter out undefined or empty values
        const params: Record<string, string | number> = { skip, limit };

        if (name && name.trim() !== "") {
            params.name = name;
        }
        if (creator && creator.trim() !== "") {
            params.creator = creator;
        }
        if (region && region.trim() !== "") {
            params.region = region;
        }

        const response = await axios.get(PROJECT_API_URL, {
            headers: getHeaders(),
            params // Pass filtered params
        });

        return response.data;
    }
);

export const searchProjects = createAsyncThunk(
    "projects/searchProjects",
    async ({ text, skip = 0, limit = 9 }: { text?: string; skip?: number; limit?: number }) => {
        const params: Record<string, string | number | undefined> = { text, skip, limit };
        const response = await axios.get(`${PROJECT_API_URL}/search`, {
            headers: getHeaders(),
            params
        });
        return response.data;
    }
);

export const createProject = createAsyncThunk("projects/createProject", async ({ project }: { project: ProjectIn }) => {
    const response = await axios.post(`${PROJECT_API_URL}`, project, {
        headers: getHeaders()
    });
    return response.data;
});

export const searchProjectDatasets = createAsyncThunk(
    "projects/searchProjectDatasets",
    async ({
        text,
        projectId,
        skip = 0,
        limit = 9
    }: {
        text?: string;
        projectId: string;
        skip?: number;
        limit?: number;
    }) => {
        const params: Record<string, string | number | undefined> = { text, skip, limit };
        const response = await axios.get(`${PROJECT_API_URL}/${projectId}/datasets/search`, {
            headers: getHeaders(),
            params
        });
        return response.data;
    }
);

export const searchProjectHazards = createAsyncThunk(
    "projects/searchProjectHazards",
    async ({
        text,
        projectId,
        skip = 0,
        limit = 9
    }: {
        text?: string;
        projectId: string;
        skip?: number;
        limit?: number;
    }) => {
        const params: Record<string, string | number | undefined> = { text, skip, limit };
        const response = await axios.get(`${PROJECT_API_URL}/${projectId}/hazards/search`, {
            headers: getHeaders(),
            params
        });
        return response.data;
    }
);

export const searchProjectDFR3Mappings = createAsyncThunk(
    "projects/searchProjectDFR3Mappings",
    async ({
        text,
        projectId,
        skip = 0,
        limit = 9
    }: {
        text?: string;
        projectId: string;
        skip?: number;
        limit?: number;
    }) => {
        const params: Record<string, string | number | undefined> = { text, skip, limit };
        const response = await axios.get(`${PROJECT_API_URL}/${projectId}/dfr3mappings/search`, {
            headers: getHeaders(),
            params
        });
        return response.data;
    }
);

export const searchProjectWorkflows = createAsyncThunk(
    "projects/searchProjectWorkflows",
    async ({
        text,
        projectId,
        skip = 0,
        limit = 9
    }: {
        text?: string;
        projectId: string;
        skip?: number;
        limit?: number;
    }) => {
        const params: Record<string, string | number | undefined> = { text, skip, limit };
        const response = await axios.get(`${PROJECT_API_URL}/${projectId}/workflows/search`, {
            headers: getHeaders(),
            params
        });
        return response.data;
    }
);

export const searchProjectVisualizations = createAsyncThunk(
    "projects/searchProjectVisualizations",
    async ({
        text,
        projectId,
        skip = 0,
        limit = 9
    }: {
        text?: string;
        projectId: string;
        skip?: number;
        limit?: number;
    }) => {
        const params: Record<string, string | number | undefined> = { text, skip, limit };
        const response = await axios.get(`${PROJECT_API_URL}/${projectId}/visualizations/search`, {
            headers: getHeaders(),
            params
        });
        return response.data;
    }
);

export const getProject = createAsyncThunk("projects/getProject", async (projectId: string) => {
    const response = await axios.get(`${PROJECT_API_URL}/${projectId}`, { headers: getHeaders() });
    return response.data;
});

export const deleteProject = createAsyncThunk("projects/deleteProject", async (projectId: string) => {
    await axios.delete(`${PROJECT_API_URL}/${projectId}`, { headers: getHeaders() });
    return projectId;
});

export const getProjectDatasets = createAsyncThunk(
    "projects/getProjectDatasets",
    async ({ projectId, skip = 0, limit = 9 }: { projectId: string; skip?: number; limit?: number }) => {
        const params: Record<string, string | number> = { skip, limit };
        const response = await axios.get(`${PROJECT_API_URL}/${projectId}/datasets`, {
            headers: getHeaders(),
            params
        });
        return response.data;
    }
);

export const getProjectHazards = createAsyncThunk(
    "projects/getProjectHazards",
    async ({ projectId, skip = 0, limit = 9 }: { projectId: string; skip?: number; limit?: number }) => {
        const params: Record<string, string | number> = { skip, limit };
        const response = await axios.get(`${PROJECT_API_URL}/${projectId}/hazards`, {
            headers: getHeaders(),
            params
        });
        return response.data;
    }
);

export const getProjectDRF3Mappings = createAsyncThunk(
    "projects/getProjectDRF3Mappings",
    async ({ projectId, skip = 0, limit = 9 }: { projectId: string; skip?: number; limit?: number }) => {
        const params: Record<string, string | number> = { skip, limit };
        const response = await axios.get(`${PROJECT_API_URL}/${projectId}/dfr3mappings`, {
            headers: getHeaders(),
            params
        });
        return response.data;
    }
);

export const getProjectWorkflows = createAsyncThunk(
    "projects/getProjectWorkflows",
    async ({ projectId, skip = 0, limit = 9 }: { projectId: string; skip?: number; limit?: number }) => {
        const params: Record<string, string | number> = { skip, limit };
        const response = await axios.get(`${PROJECT_API_URL}/${projectId}/workflows`, {
            headers: getHeaders(),
            params
        });
        return response.data;
    }
);

export const getProjectVisualizations = createAsyncThunk(
    "projects/getProjectVisualizations",
    async ({ projectId, skip = 0, limit = 9 }: { projectId: string; skip?: number; limit?: number }) => {
        const params: Record<string, string | number> = { skip, limit };
        const response = await axios.get(`${PROJECT_API_URL}/${projectId}/visualizations`, {
            headers: getHeaders(),
            params
        });
        return response.data;
    }
);

export const deleteProjectDatasets = createAsyncThunk(
    "projects/deleteProjectDatasets",
    async ({ projectId, datasetIds }: { projectId: string; datasetIds: string[] }) => {
        // Make the delete request with headers and data
        await axios.delete(`${PROJECT_API_URL}/${projectId}/datasets`, {
            headers: getHeaders(),
            data: datasetIds
        });

        return datasetIds;
    }
);

export const deleteProjectHazards = createAsyncThunk(
    "projects/deleteProjectHazards",
    async ({ projectId, hazardIds }: { projectId: string; hazardIds: string[] }) => {
        // Make the delete request with headers and data
        await axios.delete(`${PROJECT_API_URL}/${projectId}/hazards`, {
            headers: getHeaders(),
            data: hazardIds
        });

        return hazardIds;
    }
);

export const deleteProjectWorkflows = createAsyncThunk(
    "projects/deleteProjectWorkflows",
    async ({ projectId, workflowIds }: { projectId: string; workflowIds: string[] }) => {
        // Make the delete request with headers and data
        await axios.delete(`${PROJECT_API_URL}/${projectId}/workflows`, {
            headers: getHeaders(),
            data: workflowIds
        });

        return workflowIds;
    }
);

export const deleteProjectDFR3Mappings = createAsyncThunk(
    "projects/deleteProjectDFR3Mappings",
    async ({ projectId, dfr3mappingIds }: { projectId: string; dfr3mappingIds: string[] }) => {
        // Make the delete request with headers and data
        await axios.delete(`${PROJECT_API_URL}/${projectId}/dfr3mappings`, {
            headers: getHeaders(),
            data: dfr3mappingIds
        });

        return dfr3mappingIds;
    }
);

export const deleteProjectVisualizations = createAsyncThunk(
    "projects/deleteProjectVisualizations",
    async ({ projectId, visualizationIds }: { projectId: string; visualizationIds: string[] }) => {
        // Make the delete request with headers and data
        await axios.delete(`${PROJECT_API_URL}/${projectId}/visualizations`, {
            headers: getHeaders(),
            data: visualizationIds
        });

        return visualizationIds;
    }
);

export const createProjectVisualization = createAsyncThunk(
    "projects/createProjectVisualization",
    async ({ projectId, visualizations }: { projectId: string; visualizations: VisualizationIn[] }) => {
        const response = await axios.post(`${PROJECT_API_URL}/${projectId}/visualizations`, visualizations, {
            headers: getHeaders()
        });
        return response.data;
    }
);

export const addLayerToVisualization = createAsyncThunk(
    "projects/addLayerToVisualization",
    async ({
        projectId,
        visualizationId,
        layers
    }: {
        projectId: string;
        visualizationId: string;
        layers: IncoreLayer[];
    }) => {
        const response = await axios.post(
            `${PROJECT_API_URL}/${projectId}/visualizations/${visualizationId}/layers`,
            layers,
            {
                headers: getHeaders()
            }
        );
        return response.data;
    }
);

const projectSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {
        // TODO define synchronous actions here if needed
    },
    extraReducers: (builder) => {
        builder
            // Handle GET_PROJECTS
            .addCase(getProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(getProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load projects";
            })
            // Handle SEARCH_PROJECTS
            .addCase(searchProjects.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(searchProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to search projects";
            })
            // Handle CREATE_PROJECT
            .addCase(createProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.loading = false;
                state.project = action.payload;
            })
            .addCase(createProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to create the project";
            })
            // Handle GET_PROJECT
            .addCase(getProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProject.fulfilled, (state, action) => {
                state.loading = false;
                state.project = action.payload;
            })
            .addCase(getProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load the project";
            })
            // Handle GET_PROJECT_DATASETS
            .addCase(getProjectDatasets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProjectDatasets.fulfilled, (state, action) => {
                state.loading = false;
                state.projectDatasets = action.payload;
            })
            .addCase(getProjectDatasets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load the project datasets";
            })
            // Handle SEARCH_PROJECT_DATASETS
            .addCase(searchProjectDatasets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchProjectDatasets.fulfilled, (state, action) => {
                state.loading = false;
                state.projectDatasets = action.payload;
            })
            .addCase(searchProjectDatasets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to search the project datasets";
            })
            .addCase(deleteProjectDatasets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProjectDatasets.fulfilled, (state, action) => {
                state.loading = false;
                state.deletedDatasetIds = action.payload;
            })
            .addCase(deleteProjectDatasets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to delete the project datasets";
            })
            // Handle GET_PROJECT_WORKFLOWS
            .addCase(getProjectWorkflows.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProjectWorkflows.fulfilled, (state, action) => {
                state.loading = false;
                state.projectWorkflows = action.payload;
            })
            .addCase(getProjectWorkflows.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load the project workflows";
            })
            .addCase(deleteProjectWorkflows.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProjectWorkflows.fulfilled, (state, action) => {
                state.loading = false;
                state.deletedWorkflowIds = action.payload;
            })
            .addCase(deleteProjectWorkflows.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to delete the project workflows";
            })
            // Handle SEARCH_PROJECT_WORKFLOWS
            .addCase(searchProjectWorkflows.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchProjectWorkflows.fulfilled, (state, action) => {
                state.loading = false;
                state.projectWorkflows = action.payload;
            })
            .addCase(searchProjectWorkflows.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to search the project workflows";
            })
            // Handle GET_PROJECT_HAZARDS
            .addCase(getProjectHazards.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProjectHazards.fulfilled, (state, action) => {
                state.loading = false;
                state.projectHazards = action.payload;
            })
            .addCase(getProjectHazards.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load the project hazards";
            })
            .addCase(deleteProjectHazards.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProjectHazards.fulfilled, (state, action) => {
                state.loading = false;
                state.deletedHazardIds = action.payload;
            })
            .addCase(deleteProjectHazards.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to delete the project hazards";
            })
            // Handle SEARCH_PROJECT_HAZARDS
            .addCase(searchProjectHazards.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchProjectHazards.fulfilled, (state, action) => {
                state.loading = false;
                state.projectHazards = action.payload;
            })
            .addCase(searchProjectHazards.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to search the project hazards";
            })
            // Handle GET_PROJECT_DFR3_MAPPINGS
            .addCase(getProjectDRF3Mappings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProjectDRF3Mappings.fulfilled, (state, action) => {
                state.loading = false;
                state.projectDFR3Mappings = action.payload;
            })
            .addCase(getProjectDRF3Mappings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load the project dfr3mappings";
            })
            .addCase(deleteProjectDFR3Mappings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProjectDFR3Mappings.fulfilled, (state, action) => {
                state.loading = false;
                state.deletedDFR3MappingIds = action.payload;
            })
            .addCase(deleteProjectDFR3Mappings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to delete the project DFR3 Mappings";
            })
            // Handle SEARCH_PROJECT_DFR3_MAPPINGS
            .addCase(searchProjectDFR3Mappings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchProjectDFR3Mappings.fulfilled, (state, action) => {
                state.loading = false;
                state.projectDFR3Mappings = action.payload;
            })
            .addCase(searchProjectDFR3Mappings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to search the project dfr3mappings";
            })
            // Handle GET_PROJECT_VISUALIZATIONS
            .addCase(getProjectVisualizations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProjectVisualizations.fulfilled, (state, action) => {
                state.loading = false;
                state.projectVisualizations = action.payload;
            })
            .addCase(getProjectVisualizations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to add layers the project visualizations";
            })
            .addCase(deleteProjectVisualizations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProjectVisualizations.fulfilled, (state, action) => {
                state.loading = false;
                state.deletedVisualizationIds = action.payload;
            })
            .addCase(deleteProjectVisualizations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to delete the project visualizations";
            })
            .addCase(createProjectVisualization.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createProjectVisualization.fulfilled, (state, action) => {
                state.loading = false;
                state.projectVisualizations = action.payload?.visualizations;
            })
            .addCase(createProjectVisualization.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to create the project visualizations";
            })
            .addCase(addLayerToVisualization.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addLayerToVisualization.fulfilled, (state, action) => {
                state.loading = false;
                state.projectVisualizations = action.payload?.visualizations;
            })
            .addCase(addLayerToVisualization.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to create the project visualizations";
            })
            // Handle SEARCH_PROJECT_VISUALIZATIONS
            .addCase(searchProjectVisualizations.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchProjectVisualizations.fulfilled, (state, action) => {
                state.loading = false;
                state.projectVisualizations = action.payload;
            })
            .addCase(searchProjectVisualizations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to search the project visualizations";
            })
            // Handle DELETE_PROJECT
            .addCase(deleteProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.loading = false;
                state.deletedProjectId = action.payload;
            })
            .addCase(deleteProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to delete the project";
            });
    }
});

export default projectSlice.reducer;
