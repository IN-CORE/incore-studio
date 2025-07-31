import React from "react";

import { Box } from "@mui/joy";
import { GridColDef } from "@mui/x-data-grid";
import DataTable from "@app/components/Preview/DataTable";

const getRole = (
    workflowMetadata: { workflowId: string; executionId: string; role: string }[] | null,
    workflowId: string,
    executionId: string
): string => {
    if (!workflowMetadata) {
        return "N/A";
    }
    const metadata = workflowMetadata.find(
        (item) => item.workflowId === workflowId && item.executionId === executionId
    );
    return metadata ? metadata.role : "N/A";
};

const TableDatasetView: React.FC<{
    datasets: Dataset[];
    loading: boolean;
    workflowId: string;
    executionId: string;
    actionColumn: GridColDef;
}> = ({ datasets, loading, workflowId, executionId, actionColumn }) => {
    return (
        <Box sx={{ width: "100%", overflow: "auto" }}>
            <DataTable
                columns={[
                    { field: "title", flex: 1, type: "string", renderHeader: () => <strong>Title</strong> },
                    {
                        field: "description",
                        flex: 1,
                        type: "string",
                        renderHeader: () => <strong>Description</strong>
                    },
                    {
                        field: "date",
                        flex: 1,
                        type: "dateTime",
                        renderHeader: () => <strong>Created Date</strong>
                    },
                    { field: "type", type: "string", renderHeader: () => <strong>Role</strong> },
                    { field: "format", type: "string", renderHeader: () => <strong>Format</strong> },
                    actionColumn // Action column for additional actions like delete or preview
                ]}
                rows={datasets.map((dataset) => ({
                    id: dataset.id,
                    title: dataset.title,
                    description: dataset.description,
                    date: new Date(dataset.date),
                    type: getRole(dataset.workflowMetadata ?? null, workflowId, executionId),
                    format: dataset.format
                }))}
                loading={loading}
                disablePagination
            />
        </Box>
    );
};

export default TableDatasetView;
