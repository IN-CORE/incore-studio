import React from "react";
import axios from "axios";

import { Modal, ModalDialog, ModalClose, Box, Typography } from "@mui/joy";
import { GridRowsProp, GridColDef } from "@mui/x-data-grid";

import DataTable from "./DataTable";
import config from "@app/app.config";
import { getHeaders } from "@app/utils";

interface TableDataModalProps {
    open: boolean;
    onClose: () => void;
    dataset?: Dataset | null;
}

const parseCSV = (csvText: string): { rows: GridRowsProp; columns: GridColDef[] } => {
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim());

    const columns: GridColDef[] = headers.map((header, index) => ({
        field: `col${index + 1}`,
        headerName: header,
        flex: 1
    }));

    const rows: GridRowsProp = lines.slice(1).map((line, rowIndex) => {
        const values = line.split(",").map((v) => v.trim());

        const row: Record<string, any> = { id: rowIndex + 1 };
        values.forEach((val, i) => {
            row[`col${i + 1}`] = val;
        });

        return row;
    });
    console.log("Parsed CSV data:", { rows, columns });
    return { rows, columns };
};

const TableDataModal: React.FC<TableDataModalProps> = ({ open, onClose, dataset }) => {
    if (!dataset) {
        return null;
    }
    const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    };

    const [tableData, setTableData] = React.useState<{ rows: GridRowsProp; columns: GridColDef[] }>({
        rows: [],
        columns: []
    });
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const getDataset = async (datasetId: string, fileId: string) => {
            const response = await axios.get(`${config.datawolfApi}/datasets/${datasetId}/${fileId}/file`, {
                headers: getHeaders()
            });
            return response.data;
        };

        if (dataset && dataset?.format === "table") {
            console.log("Dataset:", dataset);
            const datasetId = dataset?.id;
            if (dataset.fileDescriptors && dataset.fileDescriptors.length > 0) {
                const fileId = dataset.fileDescriptors[0].id;
                setLoading(true);
                getDataset(datasetId, fileId)
                    .then((data) => {
                        const { rows, columns } = parseCSV(data);
                        setTableData({ rows, columns });
                        setLoading(false);
                    })
                    .catch((error) => {
                        console.error("Error fetching dataset:", error);
                    });
                setLoading(false);
            }
        }

        return () => {
            setTableData({ rows: [], columns: [] });
            setLoading(false);
        };
    }, [dataset]);
    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog size="lg" sx={{ backgroundColor: "#fff" }}>
                <Box sx={{ padding: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography level="h4" fontWeight="bold">
                            {dataset?.title}
                        </Typography>
                        <ModalClose />
                    </Box>
                    <Typography level="body-sm">{dataset?.description}</Typography>
                    <Typography level="body-sm">
                        {new Intl.DateTimeFormat("en-US", options).format(new Date(dataset?.date))}
                    </Typography>
                </Box>
                {dataset?.format !== "table" ? (
                    <Typography level="body-md" sx={{ padding: 2 }}>
                        {dataset?.format} is not supported for table view.
                    </Typography>
                ) : (
                    <DataTable rows={tableData.rows} columns={tableData.columns} loading={loading} />
                )}
            </ModalDialog>
        </Modal>
    );
};
export default TableDataModal;
