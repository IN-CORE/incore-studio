import React, { useState } from "react";
import {
    Modal,
    ModalDialog,
    ModalClose,
    Box,
    Typography,
    FormControl,
    FormLabel,
    Select,
    Option,
    Button
} from "@mui/joy";
import { MapComponent } from "@app/components/Map/MapComponent";

interface HazardLayer {
    workspace: string;
    layerId: string;
    styleName?: string;
}

interface CreateHazardDialogProps {
    projectId: string;
    resourceType: string;
    open: boolean;
    onClose: () => void;
    onAddClick?: any;
}

export const CreateHazardDialog: React.FC<CreateHazardDialogProps> = ({
    open,
    onClose,
    projectId,
    resourceType,
    onAddClick
}) => {
    const [hazardType, setHazardType] = useState<string>("");
    const [activeLayers, setActiveLayers] = useState<HazardLayer[]>([]);

    // Hazard Layer Mapping
    const hazardLayers: Record<string, HazardLayer> = {
        earthquakes: { workspace: "geoserver", layerId: "earthquakes", styleName: "earthquake-style" },
        floods: { workspace: "geoserver", layerId: "floods", styleName: "flood-style" },
        hurricanes: { workspace: "geoserver", layerId: "hurricanes", styleName: "hurricane-style" },
        tornadoes: { workspace: "geoserver", layerId: "tornadoes", styleName: "tornado-style" },
        tsunamis: { workspace: "geoserver", layerId: "tsunamis", styleName: "tsunami-style" }
    };

    // Handle Hazard Selection
    const handleHazardChange = (_: any, newValue: string | null) => {
        if (newValue) {
            setHazardType(newValue);
            setActiveLayers([hazardLayers[newValue]]);
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog sx={{ backgroundColor: "#fff", width: "50em" }}>
                <ModalClose sx={{ zIndex: 20 }} />
                <Box sx={{ maxWidth: "100%", padding: "5%", overflow: "auto" }}>
                    <Typography level="h4" sx={{ mb: 1, textTransform: "capitalize" }}>
                        Select {resourceType} Type
                    </Typography>

                    <FormControl required sx={{ marginTop: "1em" }}>
                        <FormLabel>{resourceType} Type</FormLabel>
                        <Select placeholder="Choose..." value={hazardType} onChange={handleHazardChange}>
                            <Option value="earthquakes">Earthquake</Option>
                            <Option value="floods">Flood</Option>
                            <Option value="hurricanes">Hurricane</Option>
                            <Option value="tornadoes">Tornado</Option>
                            <Option value="tsunamis">Tsunami</Option>
                        </Select>
                    </FormControl>

                    <Box sx={{ marginTop: "2em" }}>
                        <Typography>Preview on Map</Typography>
                        <MapComponent layers={activeLayers} />
                    </Box>

                    <Box sx={{ marginTop: "1.5em", display: "flex", justifyContent: "flex-end" }}>
                        <Button
                            variant="solid"
                            onClick={() => {
                                onAddClick(projectId, resourceType);
                                setHazardType("");
                            }}
                        >
                            Create
                        </Button>
                        <Button variant="outlined" onClick={onClose}>
                            Close
                        </Button>
                    </Box>
                </Box>
            </ModalDialog>
        </Modal>
    );
};
