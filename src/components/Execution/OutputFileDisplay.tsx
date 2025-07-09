import React from "react";
import axios from "axios";

import { Box, Stack, IconButton, Tooltip, Sheet, Typography } from "@mui/joy";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";

import config from "@app/app.config";
import { getHeaders } from "@app/utils";
import TableDataModal from "@app/components/TableDataModal";

interface OutputFileDisplayProps {
    datasetId: string;
}

const OutputFileDisplay: React.FC<OutputFileDisplayProps> = ({ datasetId }) => {
    const [copied, setCopied] = React.useState(false);
    const [dataset, setDataset] = React.useState<Dataset | null>(null);

    const [openTableDataModal, setOpenTableDataModal] = React.useState(false); // State to control the visibility of the table data modal

    const downloadFile = async (datasetId: string) => {
        if (datasetId !== "") {
            try {
                const api = `${config.dataService}/${datasetId}/blob`;
                const response = await axios.get(api, { headers: getHeaders(), responseType: "blob" });
                // Create a URL for the Blob
                const url = window.URL.createObjectURL(new Blob([response.data]));

                // Create a temporary anchor element to download the file
                const a = document.createElement("a");
                a.href = url;
                a.download = `${datasetId}.zip`; // Name of the downloaded file
                document.body.appendChild(a);
                a.click();

                // Clean up the URL object
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (error) {
                console.error("Error downloading the file:", error);
            }
        }
    };

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
            <Stack direction="row" spacing={1} sx={{ width: "100%", alignItems: "center" }}>
                <Sheet sx={{ flexGrow: 1, padding: "12px", borderRadius: "3px" }} variant="soft" color="neutral">
                    <Typography
                        level="body-md"
                        sx={{
                            font: "SF Pro Text",
                            fontWeight: 400,
                            fontSize: "14px",
                            lineHeight: "100%",
                            letterSpacing: "0px",
                            verticalAlign: "middle",
                            color: "#42526E"
                        }}
                    >
                        {dataset === null
                            ? datasetId
                            : dataset.fileDescriptors !== undefined && dataset.fileDescriptors.length > 0
                            ? dataset.fileDescriptors[0].filename
                            : datasetId}
                    </Typography>
                </Sheet>
                {dataset && (dataset.format === "table" || dataset.format === "json") && (
                    <Tooltip title="View Table" placement="bottom">
                        <IconButton
                            aria-label="View Table"
                            onClick={() => {
                                setOpenTableDataModal(true);
                            }}
                        >
                            <PreviewRoundedIcon sx={{ "color": "#42526E80", "&:hover": { color: "black" } }} />
                        </IconButton>
                    </Tooltip>
                )}
                <Tooltip title={copied ? "Copied!" : "Copy ID to Clipboard"} placement="bottom">
                    <IconButton
                        color={copied ? "success" : "neutral"}
                        aria-label="Copy ID to Clipboard"
                        onClick={() => {
                            navigator.clipboard.writeText(datasetId).then(() => {
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
                            });
                        }}
                    >
                        <ContentCopyRoundedIcon sx={{ "color": "#42526E80", "&:hover": { color: "black" } }} />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Download file" placement="bottom-start">
                    <IconButton aria-label="Download file" onClick={() => downloadFile(datasetId)}>
                        <FileDownloadRoundedIcon sx={{ "color": "#42526E80", "&:hover": { color: "black" } }} />
                    </IconButton>
                </Tooltip>
            </Stack>
            {dataset && (
                <TableDataModal
                    open={openTableDataModal}
                    onClose={() => setOpenTableDataModal(false)}
                    dataset={dataset}
                />
            )}
        </Box>
    );
};

export default OutputFileDisplay;
