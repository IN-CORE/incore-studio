import React from "react";
import axios from "axios";

import { Box, Stack, Input, IconButton, Tooltip } from "@mui/joy";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import BookmarkAddRoundedIcon from "@mui/icons-material/BookmarkAddRounded";

import config from "@app/app.config";
import { getHeaders } from "@app/utils";
import { addLayerToVisualization } from "@app/reducer/projectSlice";
import { useAppDispatch } from "@app/store/hooks";
import { VisualizationDialog } from "@app/components/Project/Resource/VisualizationDialog";

interface OutputFileDisplayProps {
    datasetId: string;
    projectId: string | undefined;
}

const OutputFileDisplay: React.FC<OutputFileDisplayProps> = ({ datasetId, projectId }) => {
    const [copied, setCopied] = React.useState(false);
    const [dataset, setDataset] = React.useState<Dataset | null>(null);
    const [selectedDataset, setSelectedDataset] = React.useState<Dataset | null>(null);
    const appDispatch = useAppDispatch();

    React.useEffect(() => {
        if (datasetId !== "" && datasetId !== "N/A" && datasetId !== "ERROR" && datasetId !== "Not present") {
            const fetchDataset = async () => {
                try {
                    const response = await axios.get<Dataset>(`${config.hostname}/data/api/datasets/${datasetId}`, {
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
            if (selectedDataset.format === "shapefile") {
                const layers = [
                    {
                        workspace: "incore",
                        layerId: selectedDataset.id
                    }
                ];

                // Dispatch the action with the new layers array
                appDispatch(addLayerToVisualization({ projectId, visualizationId, layers }));
            } else {
                alert("Only shapefiles can be added to a visualization for now!");
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
                <Tooltip title="Add to Visualization" placement="bottom">
                    <IconButton
                        variant="soft"
                        color="neutral"
                        aria-label="Add to Visualization"
                        onClick={() => {
                            setOpenVisDialog(true);
                        }}
                    >
                        <BookmarkAddRoundedIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
            <VisualizationDialog
                projectId={projectId || ""}
                open={openVisDialog}
                onClose={handleCloseVisDialog}
                onAddVisualization={handleAddVisualization}
            />
        </Box>
    );
};

export default OutputFileDisplay;
