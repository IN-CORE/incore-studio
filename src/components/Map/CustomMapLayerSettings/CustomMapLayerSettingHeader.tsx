import { CloseOutlined, PaletteOutlined, RemoveOutlined } from "@mui/icons-material";
import { Box, Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import React from "react";

import { DatasetDescriptionTooltip } from "@app/icons/DatasetDescriptionTooltip";
import { AppDispatch, RootState, useDispatch, useSelector, removeLayer } from "@ncsa/geo-explorer";
import axios from "axios";
import config from "@app/app.config";
import { getHeaders } from "@app/utils";
import { useParams } from "react-router-dom";

export type HeaderProps = {
    onOpenStyleSettings: () => void;
    onClose: () => void;
    visualization: Visualization;
};

export const CustomMapLayerSettingHeader = ({ onOpenStyleSettings, onClose, visualization }: HeaderProps) => {
    const geoExplorerDispatch = useDispatch<AppDispatch>();
    const { id } = useParams<{ id: string }>();

    const selectedLayer = useSelector((state: RootState) =>
        state.explore.mapLayers.find((layer) => layer.data.layer_id === state.explore.selectedLayer)
    );

    // custom code
    const handleRemove = async () => {
        if (!id) {
            console.error("Project ID is not defined. Cannot delete layer from visualization.");
            return;
        }
        if (!selectedLayer) {
            console.error("No dataset has been selected. Cannot delete layer from visualization.");
        } else {
            try {
                await axios.delete(`${config.projectApi}/${id}/visualizations/${visualization.id}/layers`, {
                    headers: getHeaders(),
                    data: [selectedLayer.data.layer_id]
                });
                console.log("Layer deleted from visualization successfully.");
            } catch (error) {
                console.error("Failed to delete layer from visualization:", error);
            }
            geoExplorerDispatch(removeLayer({ layer_id: selectedLayer.data.layer_id }));
        }
    };

    if (!selectedLayer) return null;

    return (
        <Stack direction="row" className="select-none items-center">
            <Stack direction="column">
                <Stack direction="row" className="items-center">
                    <Typography className="font-medium text-[16px]">{selectedLayer?.data.display_name}</Typography>
                    <Tooltip title={selectedLayer?.data.description} placement="top">
                        <Box className="ml-[6px] pointer-events-auto">
                            <DatasetDescriptionTooltip />
                        </Box>
                    </Tooltip>
                </Stack>
            </Stack>
            <Box className="flex-1" />
            <Button
                variant="contained"
                disableElevation
                className="bg-[#2C343C]"
                startIcon={<RemoveOutlined />}
                onClick={handleRemove}
            >
                Remove
            </Button>
            <IconButton onClick={onOpenStyleSettings}>
                <PaletteOutlined />
            </IconButton>
            <IconButton onClick={onClose}>
                <CloseOutlined />
            </IconButton>
        </Stack>
    );
};
