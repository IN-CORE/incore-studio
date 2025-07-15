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
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", overflow: "auto" }}>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10, page: 0 } }
                }}
                pagination
                sx={{
                    "height": "100%",
                    "width": "100%",
                    "backgroundColor": "#F8F9FA",
                    "& .MuiDataGrid-footerContainer": {
                        backgroundColor: "white"
                    }
                }}
            />
        </Box>
    );
};

export default DataTable;
