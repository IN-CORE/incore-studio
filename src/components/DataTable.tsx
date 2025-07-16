import React from "react";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import { Box } from "@mui/joy";

interface DataTableProps {
    rows?: GridRowsProp;
    columns?: GridColDef[];
    loading: boolean;
    disablePagination?: boolean;
}

const DataTable: React.FC<DataTableProps> = ({ rows = [], columns = [], loading, disablePagination = false }) => {
    return (
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", overflow: "auto" }}>
            <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                hideFooterPagination={!disablePagination}
                pageSizeOptions={disablePagination ? [] : [10, 25, 50, 100]}
                initialState={
                    disablePagination ? undefined : { pagination: { paginationModel: { pageSize: 10, page: 0 } } }
                }
                sx={{
                    "height": "100%",
                    "width": "100%",
                    "backgroundColor": "#FFFFFF",
                    "& .MuiDataGrid-footerContainer": {
                        backgroundColor: "white"
                    }
                }}
            />
        </Box>
    );
};

export default DataTable;
