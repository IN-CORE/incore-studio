import React, { useEffect, useRef } from "react";
import { Modal, ModalDialog, ModalClose, Box, Typography } from "@mui/joy";
import { parseDateTime } from "@app/utils";

import {
    GeoExplorer,
    useSelector as geoExplorerUseSelector,
    RootState as GeoExplorerRootState,
    registerMapAccessHandler,
    unregisterMapAccessHandler,
    Map
} from "@ncsa/geo-explorer";
import "@ncsa/geo-explorer/index.css";

import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import { useAppDispatch } from "@app/store/hooks";
import { patchVisualization } from "@app/reducer/projectSlice";
import { useParams } from "react-router-dom";

interface VisualizationViewProps {
    open: boolean;
    onClose: () => void;
}

export const VisualizationView: React.FC<VisualizationViewProps> = ({ open, onClose }) => {
    const { id } = useParams<{ id: string }>();

    // incore studio redux store
    const visualization = useSelector((state: RootState) => state.project.selectedVisualization);
    const appDispatch = useAppDispatch();

    // geo explorer redux store
    const mapLayers = geoExplorerUseSelector((state: GeoExplorerRootState) => state.explore.mapLayers);

    const mapBoundsRef = useRef<number[][] | null>(null);

    useEffect(() => {
        let cleanup: () => void;

        const onMapReady = (map: Map) => {
            const updateView = () => {
                mapBoundsRef.current = map.getBounds().toArray(); // [[west, south], [east, north]]
            };

            map.on("moveend", updateView);
            updateView(); // capture immediately on mount

            cleanup = () => map.off("moveend", updateView);
        };

        registerMapAccessHandler(onMapReady);

        return () => {
            unregisterMapAccessHandler(onMapReady);
            if (cleanup) cleanup();
        };
    }, []);

    const handleModalClose = async () => {
        const getLayerOrder = (): string[] => {
            return mapLayers.map((layer) => layer.data.layer_id);
        };

        const getLayers = (): IncoreLayer[] => {
            return mapLayers.map((layer) => ({
                workspace: "incore", // adjust if dynamic
                layerId: layer.data.layer_id,
                layerType: layer.data.layer_type,
                datasetCategoryType: layer.data.labels.dataset_category,
                displayName: layer.data.display_name,
                description: layer.data.description,
                unit: layer.data.unit,
                visible: layer.visible ?? true, // default to true if not defined,
                styleName: layer.style_name
            }));
        };

        if (!id) {
            console.error("Project ID is not defined. Cannot patch visualization.");
            return;
        }
        try {
            const layerOrder: string[] = getLayerOrder(); // replace with your actual logic
            const layers: IncoreLayer[] = getLayers(); // replace with your actual logic

            const visualizationId = visualization.id;
            const mapBounds = mapBoundsRef.current;

            await appDispatch(
                patchVisualization({
                    projectId: id,
                    visualizationId,
                    patchData: {
                        layerOrder: JSON.stringify(layerOrder),
                        layers: JSON.stringify(layers),
                        ...(mapBounds && {
                            boundingBox: [...mapBounds[0], ...mapBounds[1]] as [number, number, number, number]
                        })
                    }
                })
            );
        } catch (error) {
            console.error("Failed to patch visualization", error);
        }

        onClose();
    };

    return (
        <Modal open={open} onClose={handleModalClose}>
            <ModalDialog layout="fullscreen" size="lg" sx={{ backgroundColor: "#fff" }}>
                <Box sx={{ padding: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography level="h4" fontWeight="bold">
                            {visualization?.name}
                        </Typography>
                        <ModalClose />
                    </Box>
                    <Typography level="body-sm">{visualization.date && parseDateTime(visualization?.date)}</Typography>
                    {visualization.description && (
                        <Typography level="body-md" sx={{ mt: 1 }}>
                            {visualization.description}
                        </Typography>
                    )}
                </Box>
                {visualization.layers && <GeoExplorer key={visualization.id} />}
            </ModalDialog>
        </Modal>
    );
};
