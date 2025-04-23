import React from "react";
import { Modal, ModalDialog, ModalClose, Box, Typography } from "@mui/joy";
import SimpleMap from "@app/components/Map/SimpleMap";
import { parseDateTime } from "@app/utils";
import config from "@app/app.config";

interface VisualizationViewProps {
    visualization: Visualization;
    open: boolean;
    onClose: () => void;
}

export const VisualizationView: React.FC<VisualizationViewProps> = ({ visualization, open, onClose }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog size="lg" sx={{ backgroundColor: "#fff" }}>
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
                <Box sx={{ width: "800px", height: "500px" }}>
                    {visualization.layers && (
                        <SimpleMap
                            visualizationId={visualization.id}
                            layers={visualization.layers}
                            mapOptions={{
                                minZoom: 1
                            }}
                            navigation
                            onLoad={() => {}}
                            initialBounds={
                                visualization.boundingBox ? visualization.boundingBox : config.DEFAULT_MAP_BOUNDS
                            }
                        />
                    )}
                </Box>
            </ModalDialog>
        </Modal>
    );
};
