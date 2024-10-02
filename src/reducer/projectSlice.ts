import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getHeaders } from "@app/utils";

const PROJECT_API_URL = `${window.API_SERVER}/project/api/projects`;

const initialState: ProjectState = {
    projects: <Project[]>[],
    project: null,
    projectDatasets: <ProjectElement[]>[],
    projectHazards: <ProjectElement[]>[],
    projectDFR3Mappings: <ProjectElement[]>[],
    projectWorkflows: <ProjectElement[]>[],
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

export const getProject = createAsyncThunk("projects/getProject", async (id: string) => {
    const response = await axios.get(`${PROJECT_API_URL}/${id}`, { headers: getHeaders() });
    return response.data;
});

export const deleteProject = createAsyncThunk("projects/deleteProject", async (id: string) => {
    await axios.delete(`${PROJECT_API_URL}/${id}`, { headers: getHeaders() });
    return id;
});

export const getProjectDatasets = createAsyncThunk("projects/getProjectDatasets", async (id: string) => {
    const response = await axios.get(`${PROJECT_API_URL}/${id}/datasets`, { headers: getHeaders() });
    return response.data;
});

export const getProjectHazards = createAsyncThunk("projects/getProjectHazards", async (id: string) => {
    const response = await axios.get(`${PROJECT_API_URL}/${id}/hazards`, { headers: getHeaders() });
    return response.data;
});

export const getProjectDRF3Mappings = createAsyncThunk("projects/getProjectDRF3Mappings", async (id: string) => {
    const response = await axios.get(`${PROJECT_API_URL}/${id}/dfr3mappings`, { headers: getHeaders() });
    return response.data;
});

export const getProjectWorkflows = createAsyncThunk("projects/getProjectWorkflows", async (id: string) => {
    const response = await axios.get(`${PROJECT_API_URL}/${id}/workflows`, { headers: getHeaders() });
    return response.data;
});

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
                state.error = action.error.message || "Failed to load the project datasets";
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
                state.error = action.error.message || "Failed to load the project datasets";
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
                state.error = action.error.message || "Failed to load the project datasets";
            })
            // Handle DELETE_PROJECT
            .addCase(deleteProject.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.loading = false;
                state.projects = state.projects.filter((project) => project.id !== action.payload); // Remove project from list
            })
            .addCase(deleteProject.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to delete the project";
            });
    }
});

export default projectSlice.reducer;
