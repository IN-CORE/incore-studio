import React from "react";
import { Modal, ModalDialog, ModalClose } from "@mui/joy";
import { MapComponent } from "@app/components/Map/MapComponent";

interface VisualizationViewProps {
    layers?: Layer[];
    open: boolean;
    onClose: () => void;
}

export const VisualizationView: React.FC<VisualizationViewProps> = ({ layers, open, onClose }) => {
    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog size="lg">
                <ModalClose />
                {layers && <MapComponent layers={layers} width={600} height={600} />}
            </ModalDialog>
        </Modal>
    );
};
