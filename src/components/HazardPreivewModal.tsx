import React from "react";

import { Modal, ModalDialog, ModalClose, Box, Typography } from "@mui/joy";

import config from "@app/app.config";
import SimpleMap from "@app/components/Map/SimpleMap";

interface HazardPreviewModalProps {
    open: boolean;
    onClose: () => void;
    hazard?: Hazard | null;
}

export const HazardPreviewModal: React.FC<HazardPreviewModalProps> = ({ open, onClose, hazard }) => {
    if (!hazard) {
        return null;
    }
    const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog layout="fullscreen" size="lg" sx={{ backgroundColor: "#fff", padding: 10, height: "100%" }}>
                <Box sx={{ padding: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography level="h4" fontWeight="bold">
                            {hazard?.name}
                        </Typography>
                        <ModalClose />
                    </Box>
                    <Typography level="body-sm">{hazard?.description}</Typography>
                    <Typography level="body-sm">
                        {new Intl.DateTimeFormat("en-US", options).format(new Date(hazard?.date))}
                    </Typography>
                </Box>
                {/* eslint-disable-next-line no-nested-ternary */}
                <SimpleMap
                    layers={
                        hazard?.hazardDatasets?.map((dataset) => ({
                            workspace: "incore",
                            layerId: dataset.datasetId
                        })) ?? []
                    }
                    mapOptions={{
                        minZoom: 1
                    }}
                    navigation
                    onLoad={() => {}}
                    initialBounds={
                        config.DEFAULT_MAP_BOUNDS.length === 4
                            ? (config.DEFAULT_MAP_BOUNDS as [number, number, number, number])
                            : undefined
                    }
                />
            </ModalDialog>
        </Modal>
    );
};
