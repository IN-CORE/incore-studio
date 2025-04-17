import React from "react";

import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/joy";

// const minHeight = 200;
// const maxHeight = 700;

interface DataTableProps {
    rows?: GridRowsProp;
    columns?: GridColDef[];
    loading: boolean;
}
const DataTable: React.FC<DataTableProps> = ({ rows = [], columns = [], loading }) => {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%", flexGrow: 1, height: "90%" }}>
            <DataGrid rows={rows} columns={columns} loading={loading} />
        </Box>
    );
};

export default DataTable;
