import React from "react";
import { Modal, ModalDialog, ModalClose, Box, Typography } from "@mui/joy";
import { MapComponent } from "@app/components/Map/MapComponent";
import { parseDateTime } from "@app/utils";

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
                <Box>
                    {visualization.layers && (
                        <MapComponent
                            layers={visualization.layers}
                            width={800}
                            height={500}
                            {...(visualization.boundingBox &&
                                visualization.boundingBox.length > 0 && { boundingBox: visualization.boundingBox })}
                        />
                    )}
                </Box>
            </ModalDialog>
        </Modal>
    );
};
