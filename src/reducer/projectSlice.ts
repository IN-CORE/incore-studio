import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getHeaders } from "@app/utils";

const PROJECT_API_URL = `${window.API_SERVER}/project/api/projects`;

const initialState: ProjectState = {
    projects: <Project[]>[],
    project: null,
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
        limit = 15
    }: {
        name?: string;
        creator?: string;
        region?: string;
        skip?: number;
        limit?: number;
    }) => {
        const response = await axios.get(PROJECT_API_URL, {
            headers: getHeaders(),
            params: { name, creator, region, skip, limit } // Send all params, undefined values will be ignored
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
