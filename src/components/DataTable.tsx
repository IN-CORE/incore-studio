import React from "react";

import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/joy";

const minHeight = 200;
const maxHeight = 400;

interface DataTableProps {
    rows?: GridRowsProp;
    columns?: GridColDef[];
    loading: boolean;
}
const DataTable: React.FC<DataTableProps> = ({ rows = [], columns = [], loading }) => {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%", minHeight, maxHeight }}>
            <DataGrid rows={rows} columns={columns} loading={loading} />
        </Box>
    );
};

export default DataTable;
