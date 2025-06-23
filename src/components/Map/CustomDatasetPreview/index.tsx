import { AddOutlined, CloseOutlined, RemoveOutlined } from "@mui/icons-material";
import { Box, Button, IconButton, Modal, Paper, Stack, Typography } from "@mui/material";
import React, { useCallback, useMemo } from "react";

import {
    useImplementation,
    addLayer,
    removeLayer,
    selectDataset,
    AppDispatch,
    RootState,
    useDispatch,
    useSelector
} from "@ncsa/geo-explorer";
import { useParams } from "react-router-dom";
import axios from "axios";
import config from "@app/app.config";
import { getHeaders } from "@app/utils";

type CustomDatasetPreviewProps = {
    visualization: Visualization;
};

export function CustomDatasetPreview({ visualization }: CustomDatasetPreviewProps) {
    const { id } = useParams<{ id: string }>();
    const geoExplorerDispatch = useDispatch();

    const { DatasetInfo } = useImplementation();

    const dispatch = useDispatch<AppDispatch>();
    const mapLayers = useSelector((state: RootState) => state.explore.mapLayers);

    const dataset = useSelector(
        (state: RootState) =>
            state.explore.simpleLayerInventory.find((dataset) => dataset.layer_id === state.explore.selectedDataset) ||
            state.explore.temporalLayerInventory.find((dataset) => dataset.layer_id === state.explore.selectedDataset)
    );

    const addedToLayers = useMemo(() => {
        return mapLayers.some((layer) => layer.data.layer_id === dataset?.layer_id);
    }, [mapLayers, dataset]);

    const onClose = useCallback(() => {
        dispatch(selectDataset({ layer_id: null }));
    }, []);

    // custom code
    const handleAdd = async () => {
        if (!id) {
            console.error("Project ID is not defined. Cannot add layer to visualization.");
            return;
        }

        if (!dataset) {
            console.error("No dataset has been selected. Cannot delete layer from visualization.");
        } else {
            const layers = [
                {
                    workspace: "incore",
                    layerId: dataset?.layer_id,
                    displayName: dataset.display_name,
                    description: dataset.description,
                    datasetCategoryType: dataset.labels.dataset_category,
                    layerType: dataset.layer_type,
                    // boundingBox: dataset. TODO: missing bounding box using visualziation bounding box for now
                    boundingBox: visualization.boundingBox
                }
            ];
            try {
                await axios.post(`${config.projectApi}/${id}/visualizations/${visualization.id}/layers`, layers, {
                    headers: getHeaders()
                });
                console.log("Layer added to visualization successfully.");
            } catch (error) {
                console.error("Failed to add layer to visualization:", error);
            }
            geoExplorerDispatch(addLayer({ layer_id: dataset?.layer_id }));
        }
    };

    const handleRemove = async () => {
        if (!id) {
            console.error("Project ID is not defined. Cannot delete layer from visualization.");
            return;
        }
        if (!dataset) {
            console.error("No dataset has been selected. Cannot delete layer from visualization.");
        } else {
            try {
                await axios.delete(`${config.projectApi}/${id}/visualizations/${visualization.id}/layers`, {
                    headers: getHeaders(),
                    data: [dataset?.layer_id]
                });
                console.log("Layer deleted from visualization successfully.");
            } catch (error) {
                console.error("Failed to delete layer from visualization:", error);
            }
            geoExplorerDispatch(removeLayer({ layer_id: dataset.layer_id }));
        }
    };

    if (!dataset) return null;

    return (
        <Modal open={!!dataset} onClose={onClose}>
            <Paper className="fixed left-0 right-0 top-0 bottom-0 m-auto rounded-[6px] py-[24px] px-[32px] overflow-scroll no-scrollbar w-[60%] h-fit">
                <Stack direction="row" className="items-center">
                    <Typography className="font-bold text-[20px]">{dataset?.display_name}</Typography>
                    <Box className="flex-1" />
                    {dataset &&
                        (addedToLayers ? (
                            <Button
                                variant="contained"
                                disableElevation
                                className="bg-[#2C343C]"
                                startIcon={<RemoveOutlined />}
                                onClick={handleRemove}
                            >
                                Remove
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                disableElevation
                                startIcon={<AddOutlined />}
                                onClick={handleAdd}
                            >
                                Add to map
                            </Button>
                        ))}
                    <IconButton onClick={onClose}>
                        <CloseOutlined />
                    </IconButton>
                </Stack>
                <DatasetInfo />
            </Paper>
        </Modal>
    );
}
