import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getHeaders } from "@app/utils";

// API URLs for different hazard types
const HAZARD_EQ_API_URL = `${window.API_SERVER}/hazard/api/earthquakes`;
const HAZARD_TSUNAMI_API_URL = `${window.API_SERVER}/hazard/api/tsunamis`;
const HAZARD_TORNADO_API_URL = `${window.API_SERVER}/hazard/api/tornadoes`;
const HAZARD_HURRICANE_API_URL = `${window.API_SERVER}/hazard/api/hurricanes`;
const HAZARD_FLOOD_API_URL = `${window.API_SERVER}/hazard/api/floods`;

// Define the initial state
interface HazardState {
    hazard: any | null; // Can be more specific if you have a hazard type interface
    loading: boolean;
    error: string | null;
}

const initialState: HazardState = {
    hazard: null,
    loading: false,
    error: null
};

// Function to determine the correct URL based on hazard type
const getHazardApiUrl = (hazardType: string): string => {
    switch (hazardType) {
        case "earthquake":
            return HAZARD_EQ_API_URL;
        case "tsunami":
            return HAZARD_TSUNAMI_API_URL;
        case "tornado":
            return HAZARD_TORNADO_API_URL;
        case "hurricane":
            return HAZARD_HURRICANE_API_URL;
        case "flood":
            return HAZARD_FLOOD_API_URL;
        default:
            throw new Error(`Unsupported hazard type: ${hazardType}`);
    }
};

// Async thunk to fetch hazard data based on type and ID
export const getHazard = createAsyncThunk(
    "hazard/getHazard",
    async ({ hazardType, id }: { hazardType: string; id: string }) => {
        const apiUrl = getHazardApiUrl(hazardType);
        const response = await axios.get(`${apiUrl}/${id}`, {
            headers: getHeaders()
        });
        return response.data;
    }
);

// Define the hazard slice
const hazardSlice = createSlice({
    name: "hazard",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getHazard.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getHazard.fulfilled, (state, action) => {
                state.loading = false;
                state.hazard = action.payload;
            })
            .addCase(getHazard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load hazard data";
            });
    }
});

export default hazardSlice.reducer;
