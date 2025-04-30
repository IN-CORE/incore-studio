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
    error: null,
    success: null
};

export const getProjects = createAsyncThunk(
    "projects/getProjects",
    async ({
        skip = 0,
        limit = 9,
        filters = {},
        sortBy = "date",
        order = "desc"
    }: {
        skip?: number;
        limit?: number;
        filters?: Record<string, string | number>;
        sortBy?: string;
        order?: string;
    }) => {
        // Create a params object and filter out undefined or empty values
        const params: Record<string, string | number> = {
            skip,
            limit,
            ...Object.fromEntries(
                Object.entries(filters).filter(
                    ([, value]) => value !== undefined && value !== "" // Filter out empty and undefined values
                )
            )
        };

        // Add sorting parameters if provided
        if (sortBy) {
            params.sortBy = sortBy;
            params.order = order;
        }

        const response = await axios.get(PROJECT_API_URL, {
            headers: getHeaders(),
            params // Pass filtered params
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

export const getProject = createAsyncThunk("projects/getProject", async (projectId: string) => {
    const response = await axios.get(`${PROJECT_API_URL}/${projectId}`, { headers: getHeaders() });
    return response.data;
});

export const deleteProject = createAsyncThunk("projects/deleteProject", async (projectId: string) => {
    await axios.delete(`${PROJECT_API_URL}/${projectId}`, { headers: getHeaders() });
    return projectId;
});

export const editProject = createAsyncThunk(
    "projects/editProject",
    async ({
        projectId,
        name,
        description,
        region
    }: {
        projectId: string;
        name: string;
        description: string;
        region: string;
    }) => {
        const data = new URLSearchParams();
        data.append("name", name);
        data.append("description", description);
        data.append("region", region);

        const response = await axios.patch(`${PROJECT_API_URL}/${projectId}`, data, {
            headers: {
                ...getHeaders(), // includes User credentials, User groups
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        return response.data;
    }
);

export const getProjectDatasets = createAsyncThunk(
    "projects/getProjectDatasets",
    async ({
        projectId,
        skip = 0,
        limit = 9,
        filters = {},
        sortBy = "date",
        order = "desc"
    }: {
        projectId: string;
        skip?: number;
        limit?: number;
        filters?: Record<string, string | number>;
        sortBy?: string;
        order?: string;
    }) => {
        // Build query parameters dynamically and remove empty/undefined filters
        const params: Record<string, string | number> = {
            skip,
            limit,
            ...Object.fromEntries(
                Object.entries(filters).filter(
                    ([, value]) => value !== undefined && value !== "" // Filter out empty and undefined values
                )
            )
        };

        // Add sorting parameters if provided
        if (sortBy) {
            params.sortBy = sortBy;
            params.order = order;
        }

        const response = await axios.get(`${PROJECT_API_URL}/${projectId}/datasets`, {
            headers: getHeaders(),
            params
        });
        return response.data;
    }
);

export const getProjectHazards = createAsyncThunk(
    "projects/getProjectHazards",
    async ({
        projectId,
        skip = 0,
        limit = 9,
        filters = {},
        sortBy = "date",
        order = "desc"
    }: {
        projectId: string;
        skip?: number;
        limit?: number;
        filters?: Record<string, string | number>;
        sortBy?: string;
        order?: string;
    }) => {
        // Build query parameters dynamically and remove empty/undefined filters
        const params: Record<string, string | number> = {
            skip,
            limit,
            ...Object.fromEntries(
                Object.entries(filters).filter(
                    ([, value]) => value !== undefined && value !== "" // Filter out empty and undefined values
                )
            )
        };

        // Add sorting parameters if provided
        if (sortBy) {
            params.sortBy = sortBy;
            params.order = order;
        }

        const response = await axios.get(`${PROJECT_API_URL}/${projectId}/hazards`, {
            headers: getHeaders(),
            params
        });
        return response.data;
    }
);

export const getProjectDRF3Mappings = createAsyncThunk(
    "projects/getProjectDRF3Mappings",
    async ({
        projectId,
        skip = 0,
        limit = 9,
        filters = {},
        sortBy = "date",
        order = "desc"
    }: {
        projectId: string;
        skip?: number;
        limit?: number;
        filters?: Record<string, string | number>;
        sortBy?: string;
        order?: string;
    }) => {
        // Build query parameters dynamically and remove empty/undefined filters
        const params: Record<string, string | number> = {
            skip,
            limit,
            ...Object.fromEntries(
                Object.entries(filters).filter(
                    ([, value]) => value !== undefined && value !== "" // Filter out empty and undefined values
                )
            )
        };

        // Add sorting parameters if provided
        if (sortBy) {
            params.sortBy = sortBy;
            params.order = order;
        }

        const response = await axios.get(`${PROJECT_API_URL}/${projectId}/dfr3mappings`, {
            headers: getHeaders(),
            params
        });
        return response.data;
    }
);

export const getProjectWorkflows = createAsyncThunk(
    "projects/getProjectWorkflows",
    async ({
        projectId,
        skip = 0,
        limit = 9,
        filters = {},
        sortBy = "date",
        order = "desc"
    }: {
        projectId: string;
        skip?: number;
        limit?: number;
        filters?: Record<string, string | number>;
        sortBy?: string;
        order?: string;
    }) => {
        // Build query parameters dynamically and remove empty/undefined filters
        const params: Record<string, string | number> = {
            skip,
            limit,
            ...Object.fromEntries(
                Object.entries(filters).filter(
                    ([, value]) => value !== undefined && value !== "" // Filter out empty and undefined values
                )
            )
        };

        // Add sorting parameters if provided
        if (sortBy) {
            params.sortBy = sortBy;
            params.order = order;
        }

        const response = await axios.get(`${PROJECT_API_URL}/${projectId}/workflows`, {
            headers: getHeaders(),
            params
        });
        return response.data;
    }
);

export const getProjectVisualizations = createAsyncThunk(
    "projects/getProjectVisualizations",
    async ({
        projectId,
        skip = 0,
        limit = 9,
        filters = {},
        sortBy = "date",
        order = "desc"
    }: {
        projectId: string;
        skip?: number;
        limit?: number;
        filters?: Record<string, string | number>;
        sortBy?: string;
        order?: string;
    }) => {
        // Build query parameters dynamically and remove empty/undefined filters
        const params: Record<string, string | number> = {
            skip,
            limit,
            ...Object.fromEntries(
                Object.entries(filters).filter(
                    ([, value]) => value !== undefined && value !== "" // Filter out empty and undefined values
                )
            )
        };

        // Add sorting parameters if provided
        if (sortBy) {
            params.sortBy = sortBy;
            params.order = order;
        }

        const response = await axios.get(`${PROJECT_API_URL}/${projectId}/visualizations`, {
            headers: getHeaders(),
            params
        });
        return response.data;
    }
);

export const fetchInfiniteProjectVisualizations = async ({
    pageParam = 1,
    projectId
}: any): Promise<{ data: Visualization[]; nextPage: number }> => {
    const response = await axios.get(`${PROJECT_API_URL}/${projectId}/visualizations`, {
        headers: getHeaders(),
        params: {
            skip: (pageParam - 1) * 10,
            limit: 10
        }
    });
    return {
        data: response.data,
        nextPage: response.data.length === 10 ? pageParam + 1 : null // stop if no more data
    };
};

export const addDatasetToProject = createAsyncThunk(
    "projects/addDatasetToProject",
    async ({ projectId, datasets }: { projectId: string; datasets: Dataset[] }) => {
        const response = await axios.post(`${PROJECT_API_URL}/${projectId}/datasets`, datasets, {
            headers: getHeaders()
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

export const addHazardToProject = createAsyncThunk(
    "projects/addHazardToProject",
    async ({ projectId, hazards }: { projectId: string; hazards: Hazard[] }) => {
        const response = await axios.post(`${PROJECT_API_URL}/${projectId}/hazards`, hazards, {
            headers: getHeaders()
        });
        return response.data;
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

export const addWorkflowToProject = createAsyncThunk(
    "projects/addWorkflowToProject",
    async ({ projectId, workflows }: { projectId: string; workflows: any }) => {
        const response = await axios.post(`${PROJECT_API_URL}/${projectId}/workflows`, workflows, {
            headers: getHeaders()
        });
        return response.data;
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

export const addDFR3MappingToProject = createAsyncThunk(
    "projects/addDFR3MappingToProject",
    async ({ projectId, dfr3Mappings }: { projectId: string; dfr3Mappings: DFR3Mapping[] }) => {
        const response = await axios.post(`${PROJECT_API_URL}/${projectId}/dfr3mappings`, dfr3Mappings, {
            headers: getHeaders()
        });
        return response.data;
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

export const finalizeWorkflow = createAsyncThunk(
    "projects/finalizeWorkflow",
    async ({ projectId, workflowId }: { projectId: string; workflowId: string }) => {
        const response = await axios.post(`${PROJECT_API_URL}/${projectId}/workflows/${workflowId}/finalize`, null, {
            headers: getHeaders()
        });
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
                state.success = null;
            })
            .addCase(getProjects.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = action.payload;
            })
            .addCase(getProjects.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load projects";
            })
            // Handle CREATE_PROJECT
            .addCase(createProject.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.loading = false;
                state.project = action.payload;
                state.success = "Successfully created the project";
            })
            .addCase(createProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to create the project";
            })
            // Handle GET_PROJECT
            .addCase(getProject.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(getProject.fulfilled, (state, action) => {
                state.loading = false;
                state.projectDFR3Mappings = action.payload.dfr3Mappings;
                state.projectHazards = action.payload.hazards;
                state.projectDatasets = action.payload.datasets;
                state.projectWorkflows = action.payload.workflows;
                state.project = action.payload;
            })
            .addCase(getProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load the project";
            })
            // Edit project
            .addCase(editProject.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(editProject.fulfilled, (state, action) => {
                state.loading = false;
                state.projectDFR3Mappings = action.payload.dfr3Mappings;
                state.projectHazards = action.payload.hazards;
                state.projectDatasets = action.payload.datasets;
                state.projectWorkflows = action.payload.workflows;
                state.project = action.payload;
                state.success = "Successfully edited the project";

                // Update project list as well
                const updatedProjectIndex = state.projects.findIndex((p) => p.id === action.payload.id);
                if (updatedProjectIndex !== -1) {
                    state.projects[updatedProjectIndex] = {
                        ...state.projects[updatedProjectIndex],
                        ...action.payload
                    };
                }
            })
            .addCase(editProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to edit the project";
            })
            // Handle GET_PROJECT_DATASETS
            .addCase(getProjectDatasets.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(getProjectDatasets.fulfilled, (state, action) => {
                state.loading = false;
                state.projectDatasets = action.payload;
            })
            .addCase(getProjectDatasets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load the project datasets";
            })
            // Handle ADD_DATASET_TO_PROJECT
            .addCase(addDatasetToProject.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(addDatasetToProject.fulfilled, (state, action) => {
                state.loading = false;
                state.projectDatasets = action.payload?.datasets;
                if (state.project) {
                    state.project.datasets = action.payload?.datasets;
                }
                state.success = "Successfully added datasets to the project";
            })
            .addCase(addDatasetToProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to add datasets to the project";
            })
            // Handle DELETE_PROJECT_DATASETS
            .addCase(deleteProjectDatasets.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(deleteProjectDatasets.fulfilled, (state, action) => {
                state.loading = false;
                state.deletedDatasetIds = action.payload;
                state.success = "Successfully deleted the project datasets";
            })
            .addCase(deleteProjectDatasets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to delete the project datasets";
            })
            // Handle GET_PROJECT_WORKFLOWS
            .addCase(getProjectWorkflows.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(getProjectWorkflows.fulfilled, (state, action) => {
                state.loading = false;
                state.projectWorkflows = action.payload;
            })
            .addCase(getProjectWorkflows.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load the project workflows";
            })
            .addCase(addWorkflowToProject.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(addWorkflowToProject.fulfilled, (state, action) => {
                state.loading = false;
                state.projectWorkflows = action.payload?.workflows;
                if (state.project) {
                    state.project.workflows = action.payload?.workflows;
                }
                state.success = "Successfully added workflows to the project";
            })
            .addCase(addWorkflowToProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to add workflow to the project";
            })
            .addCase(deleteProjectWorkflows.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(deleteProjectWorkflows.fulfilled, (state, action) => {
                state.loading = false;
                state.deletedWorkflowIds = action.payload;
                state.success = "Successfully deleted the project workflows";
            })
            .addCase(deleteProjectWorkflows.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to delete the project workflows";
            })
            // Handle GET_PROJECT_HAZARDS
            .addCase(getProjectHazards.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(getProjectHazards.fulfilled, (state, action) => {
                state.loading = false;
                state.projectHazards = action.payload;
            })
            .addCase(getProjectHazards.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load the project hazards";
            })
            // Handle ADD_HAZARD_TO_PROJECT
            .addCase(addHazardToProject.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(addHazardToProject.fulfilled, (state, action) => {
                state.loading = false;
                state.projectHazards = action.payload?.hazards;
                if (state.project) {
                    state.project.hazards = action.payload?.hazards;
                }
                state.success = "Successfully added hazards to the project";
            })
            .addCase(addHazardToProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to add hazards to the project";
            })
            // Handle DELETE_PROJECT_HAZARDS
            .addCase(deleteProjectHazards.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(deleteProjectHazards.fulfilled, (state, action) => {
                state.loading = false;
                state.deletedHazardIds = action.payload;
                state.success = "Successfully deleted the project hazards";
            })
            .addCase(deleteProjectHazards.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to delete the project hazards";
            })
            // Handle GET_PROJECT_DFR3_MAPPINGS
            .addCase(getProjectDRF3Mappings.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(getProjectDRF3Mappings.fulfilled, (state, action) => {
                state.loading = false;
                state.projectDFR3Mappings = action.payload;
            })
            .addCase(getProjectDRF3Mappings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load the project dfr3mappings";
            })
            // Handle ADD_DFR3_MAPPING_TO_PROJECT
            .addCase(addDFR3MappingToProject.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(addDFR3MappingToProject.fulfilled, (state, action) => {
                state.loading = false;
                state.projectDFR3Mappings = action.payload?.dfr3Mappings;
                if (state.project) {
                    state.project.dfr3Mappings = action.payload?.dfr3Mappings;
                }
                state.success = "Successfully added dfr3mappings to the project";
            })
            .addCase(addDFR3MappingToProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to add dfr3mappings to the project";
            })
            // Handle DELETE_PROJECT_DFR3_MAPPINGS
            .addCase(deleteProjectDFR3Mappings.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(deleteProjectDFR3Mappings.fulfilled, (state, action) => {
                state.loading = false;
                state.deletedDFR3MappingIds = action.payload;
                state.success = "Successfully deleted the project DFR3 Mappings";
            })
            .addCase(deleteProjectDFR3Mappings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to delete the project DFR3 Mappings";
            })
            // Handle GET_PROJECT_VISUALIZATIONS
            .addCase(getProjectVisualizations.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
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
                state.success = null;
            })
            .addCase(deleteProjectVisualizations.fulfilled, (state, action) => {
                state.loading = false;
                state.deletedVisualizationIds = action.payload;
                state.success = "Successfully deleted the project visualizations";
            })
            .addCase(deleteProjectVisualizations.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to delete the project visualizations";
            })
            .addCase(createProjectVisualization.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(createProjectVisualization.fulfilled, (state, action) => {
                state.loading = false;
                state.projectVisualizations = action.payload?.visualizations;
                state.success = "Successfully created the project visualizations";
            })
            .addCase(createProjectVisualization.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to create the project visualizations";
            })
            .addCase(addLayerToVisualization.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(addLayerToVisualization.fulfilled, (state, action) => {
                state.loading = false;
                state.projectVisualizations = action.payload?.visualizations;
                if (state.project) {
                    state.project.visualizations = action.payload?.visualizations;
                }
                state.success = "Successfully added layers to the project visualizations";
            })
            .addCase(addLayerToVisualization.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to create the project visualizations";
            })
            // Handle DELETE_PROJECT
            .addCase(deleteProject.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.loading = false;
                state.deletedProjectId = action.payload;
                state.success = "Successfully deleted the project";
            })
            .addCase(deleteProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to delete the project";
            })
            .addCase(finalizeWorkflow.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = null;
            })
            .addCase(finalizeWorkflow.fulfilled, (state, action) => {
                state.loading = false;
                state.success = "Successfully finalized the workflow";
                state.projectWorkflows = action.payload.workflows;
            })
            .addCase(finalizeWorkflow.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to finalize the workflow";
            });
    }
});

export default projectSlice.reducer;
