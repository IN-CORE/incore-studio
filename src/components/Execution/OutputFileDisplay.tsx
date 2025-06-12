import React from "react";
import axios from "axios";

import { Box, Stack, Input, IconButton, Snackbar, Tooltip } from "@mui/joy";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import BookmarkAddRoundedIcon from "@mui/icons-material/BookmarkAddRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

import config from "@app/app.config";
import { getHeaders, inferLayerType } from "@app/utils";
import { addLayerToVisualization } from "@app/reducer/projectSlice";
import { useAppDispatch } from "@app/store/hooks";
import { VisualizationDialog } from "@app/components/Project/Resource/VisualizationDialog";
import TableDataModal from "@app/components/TableDataModal";

interface OutputFileDisplayProps {
    datasetId: string;
    projectId: string | undefined;
}

const OutputFileDisplay: React.FC<OutputFileDisplayProps> = ({ datasetId, projectId }) => {
    const [copied, setCopied] = React.useState(false);
    const [dataset, setDataset] = React.useState<Dataset | null>(null);
    const [selectedDataset, setSelectedDataset] = React.useState<Dataset | null>(null);
    const appDispatch = useAppDispatch();
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

    // add to visualization
    const [openVisDialog, setOpenVisDialog] = React.useState(false);
    const handleCloseVisDialog = () => {
        setOpenVisDialog(false);
    };
    const handleAddVisualization = (visualizationId: string) => {
        if (selectedDataset && projectId) {
            setSnackbarMessage("Adding to Visualization...");
            setSnackbarColor("warning");
            setSnackbarOpen(true);
            if (
                selectedDataset.format === "shapefile" ||
                selectedDataset.format === "geotif" ||
                selectedDataset.format === "raster" ||
                selectedDataset.format === "table" // TODO: Need to rethink this logic
            ) {
                const layers = [
                    {
                        workspace: "incore",
                        layerId: selectedDataset.id,
                        displayName: selectedDataset.title,
                        description: selectedDataset.description,
                        datasetCategoryType: selectedDataset.dataType,
                        layerType: inferLayerType(selectedDataset.dataType),
                        boundingBox: selectedDataset.boundingBox
                    }
                ];
                try {
                    // Dispatch the action with the new layers array
                    appDispatch(addLayerToVisualization({ projectId, visualizationId, layers }));
                    setSnackbarMessage("Successfully added to Visualization!");
                    setSnackbarColor("success");
                    setSnackbarOpen(true);
                } catch (error) {
                    console.error("Error adding layer to visualization", error);
                    setSnackbarMessage("Error adding to Visualization!");
                    setSnackbarColor("danger");
                    setSnackbarOpen(true);
                }
            } else {
                alert("Only shapefiles can be added to a visualization for now!");
                setSnackbarMessage("Error adding to Visualization!");
                setSnackbarColor("danger");
                setSnackbarOpen(true);
            }
            setSelectedDataset(null);
        }
        setOpenVisDialog(false);
    };

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
                {dataset && dataset.format === "shapefile" && (
                    <Tooltip title="Add to Map" placement="bottom">
                        <IconButton
                            variant="soft"
                            color="neutral"
                            aria-label="Add to Map"
                            onClick={() => {
                                setSelectedDataset(dataset);
                                setOpenVisDialog(true);
                            }}
                        >
                            <BookmarkAddRoundedIcon />
                        </IconButton>
                    </Tooltip>
                )}
            </Stack>
            <VisualizationDialog
                projectId={projectId || ""}
                open={openVisDialog}
                onClose={handleCloseVisDialog}
                onAddVisualization={handleAddVisualization}
            />
            {dataset && (
                <TableDataModal
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
