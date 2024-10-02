import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getHeaders } from "@app/utils";

const DFR3MAPPING_API_URL = `${window.API_SERVER}/dfr3/api/mappings`;

const initialState: DFR3MappingState = {
    dfr3mappings: [], // Initialize an empty array for dfr3mappings
    loading: false,
    error: null
};

export const getDFR3Mappings = createAsyncThunk("data/getDFR3Mappings", async (ids: string[]) => {
    // Use Promise.all to fetch each dataset in parallel
    const promises = ids.map(async (id) => {
        try {
            const response = await axios.get(`${DFR3MAPPING_API_URL}/${id}`, { headers: getHeaders() });
            return response.data;
        } catch (error) {
            return { id, status: "unavailable" };
        }
    });

    // Wait for all requests to complete (success or error)
    const dfr3mappings = await Promise.all(promises);
    return dfr3mappings;
});

const dfr3MappingSlice = createSlice({
    name: "dfr3",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getDFR3Mappings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDFR3Mappings.fulfilled, (state, action) => {
                state.loading = false;
                state.dfr3mappings = action.payload;
            })
            .addCase(getDFR3Mappings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to load dfr3mappings";
            });
    }
});

export default dfr3MappingSlice.reducer;
