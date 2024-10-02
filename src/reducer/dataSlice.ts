import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getHeaders } from "@app/utils";

const DATA_API_URL = `${window.API_SERVER}/data/api/datasets`;

const initialState: DataState = {
    datasets: [], // Initialize an empty array for datasets
    loading: false,
    error: null
};

// Fetch multiple datasets by a list of IDs, handle errors with "unavailable" status
export const getDatasets = createAsyncThunk("data/getDatasets", async (ids: string[]) => {
    // Use Promise.all to fetch each dataset in parallel
    const promises = ids.map(async (id) => {
        try {
            const response = await axios.get(`${DATA_API_URL}/${id}`, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            return { id, status: "unavailable" };
        }
    });

    // Wait for all requests to complete (success or error)
    const datasets = await Promise.all(promises);
    return datasets;
});

const dataSlice = createSlice({
    name: "data",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getDatasets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDatasets.fulfilled, (state, action) => {
                state.loading = false;
                state.datasets = action.payload; // Store the fetched datasets (or "unavailable" statuses) in the state
            })
            .addCase(getDatasets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load datasets";
            });
    }
});

export default dataSlice.reducer;
