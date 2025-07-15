import React from "react";
import axios from "axios";

import { Box, Stack, Input, IconButton, Snackbar, Tooltip } from "@mui/joy";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import config from "@app/app.config";
import { getHeaders } from "@app/utils";
import DatasetPreviewModal from "@app/components/DatasetPreviewModal";

interface OutputFileDisplayProps {
    datasetId: string;
}

const OutputFileDisplay: React.FC<OutputFileDisplayProps> = ({ datasetId }) => {
    const [copied, setCopied] = React.useState(false);
    const [dataset, setDataset] = React.useState<Dataset | null>(null);
    const [snackbarOpen, setSnackbarOpen] = React.useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState<string>("");
    const [snackbarColor, setSnackbarColor] = React.useState<"success" | "danger" | "warning" | "neutral">("neutral");
    const [openTableDataModal, setOpenTableDataModal] = React.useState(false); // State to control the visibility of the table data modal

    React.useEffect(() => {
        if (datasetId !== "" && datasetId !== "N/A" && datasetId !== "ERROR" && datasetId !== "Not present") {
            const fetchDataset = async () => {
                try {
                    const response = await axios.get<Dataset>(`${config.dataService}/${datasetId}`, {
                        headers: getHeaders()
                    });
                    if (response.status === 200) {
                        setDataset(response.data);
                    }
                } catch (error) {
                    console.error("Error fetching dataset", error);
                }
            };

            fetchDataset();
        }
    }, []);

    return (
        <Box>
            <Stack direction="row" spacing={1}>
                <Input
                    fullWidth
                    value={
                        dataset === null
                            ? datasetId
                            : dataset.fileDescriptors !== undefined && dataset.fileDescriptors.length > 0
                              ? dataset.fileDescriptors[0].filename
                              : datasetId
                    }
                    variant="outlined"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.preventDefault()}
                    // sx={{
                    //     "&.Mui-disabled": {
                    //         color: "#1E293B"
                    //     }
                    // }}
                />
                {dataset && (dataset.format === "table" || dataset.format === "json") && (
                    <Tooltip title="View Table" placement="bottom">
                        <IconButton
                            variant="soft"
                            color="neutral"
                            aria-label="View Table"
                            onClick={() => {
                                setOpenTableDataModal(true);
                            }}
                        >
                            <VisibilityRoundedIcon />
                        </IconButton>
                    </Tooltip>
                )}
                <Tooltip title={copied ? "Copied!" : "Copy ID to Clipboard"} placement="bottom">
                    <IconButton
                        variant="soft"
                        color={copied ? "success" : "neutral"}
                        onClick={() => {
                            navigator.clipboard.writeText(datasetId).then(() => {
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
                            });
                        }}
                    >
                        <ContentCopyRoundedIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
            {dataset && (
                <DatasetPreviewModal
                    open={openTableDataModal}
                    onClose={() => setOpenTableDataModal(false)}
                    dataset={dataset}
                />
            )}
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                open={snackbarOpen}
                onClose={() => {
                    setSnackbarOpen(false);
                    setSnackbarMessage("");
                    setSnackbarColor("neutral");
                }}
                variant="outlined"
                color={snackbarColor}
                autoHideDuration={2000}
            >
                {snackbarMessage}
            </Snackbar>
        </Box>
    );
};

export default OutputFileDisplay;
