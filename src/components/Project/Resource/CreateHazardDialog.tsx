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
    Button,
    Grid,
    Tabs,
    TabList,
    Tab,
    Container
} from "@mui/joy";
import { MapComponent } from "@app/components/Map/MapComponent";
import { DatasetEarthquake } from "@app/components/Project/Hazards/DatasetEarthquake";
import { ModelEarthquake } from "@app/components/Project/Hazards/ModelEarthquake";
import { RasterTornado } from "@app/components/Project/Hazards/RasterTornado";
import { ModelTornado } from "@app/components/Project/Hazards/ModelTornado";
import { DatasetHurricane } from "@app/components/Project/Hazards/DatasetHurricane";
import { DatasetFlood } from "@app/components/Project/Hazards/DatasetFlood";
import { DatasetTsunami } from "@app/components/Project/Hazards/DatasetTsunami";
import { TornadoMapDrawPrompt } from "@app/components/Map/TornadoMapDrawPrompt";
import { EqMapDrawPrompt } from "@app/components/Map/EqMapDrawPrompt";

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
}

// Hazard Layer Mapping
const hazardLayers: Record<string, HazardLayer> = {
    earthquakes: { workspace: "geoserver", layerId: "earthquakes", styleName: "earthquake-style" },
    floods: { workspace: "geoserver", layerId: "floods", styleName: "flood-style" },
    hurricanes: { workspace: "geoserver", layerId: "hurricanes", styleName: "hurricane-style" },
    tornadoes: { workspace: "geoserver", layerId: "tornadoes", styleName: "tornado-style" },
    tsunamis: { workspace: "geoserver", layerId: "tsunamis", styleName: "tsunami-style" }
};

export const CreateHazardDialog: React.FC<CreateHazardDialogProps> = ({ open, onClose, projectId, resourceType }) => {
    const [hazardType, setHazardType] = useState<string>("");
    const [activeLayers, setActiveLayers] = useState<HazardLayer[]>([]);
    const [mapDialogOpen, setMapDialogOpen] = useState<boolean>(false);

    // Handle Hazard Selection
    const handleHazardChange = (_: any, newValue: string | null) => {
        if (newValue) {
            setHazardType(newValue);
            setActiveLayers([hazardLayers[newValue]]);
        }
    };

    const handleLayerUpdate = (layerId: string) => {
        if (hazardType && hazardLayers[hazardType]) {
            setActiveLayers([{ ...hazardLayers[hazardType], layerId }]);
        }
    };

    // Clear Layers on Map
    const handleClearAllLayers = () => {
        setActiveLayers([]);
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog sx={{ backgroundColor: "#fff", width: "80em", maxWidth: "90vw" }}>
                <ModalClose sx={{ zIndex: 20 }} />
                <Box sx={{ maxWidth: "100%", padding: "3%", overflow: "auto" }}>
                    <Typography level="h4" sx={{ mb: 2, textTransform: "capitalize" }}>
                        Create {resourceType}
                    </Typography>

                    <Grid container spacing={3}>
                        {/* Left Panel: Hazard Selection + Tabs */}
                        <Grid sm={6}>
                            {/* Select Hazard Type */}
                            <Box>
                                <FormControl required sx={{ marginBottom: "1em" }}>
                                    <FormLabel>Select {resourceType} Type</FormLabel>
                                    <Select placeholder="Choose..." value={hazardType} onChange={handleHazardChange}>
                                        <Option value="earthquakes">Earthquake</Option>
                                        <Option value="floods">Flood</Option>
                                        <Option value="hurricanes">Hurricane</Option>
                                        <Option value="tornadoes">Tornado</Option>
                                        <Option value="tsunamis">Tsunami</Option>
                                    </Select>
                                </FormControl>
                            </Box>

                            {/* Tabs for Dataset Upload & Model Creation */}
                            <Tabs defaultValue={0}>
                                <TabList>
                                    <Tab>Upload a Hazard Dataset</Tab>
                                    <Tab
                                        sx={{
                                            display: ["tornadoes", "earthquakes"].includes(hazardType)
                                                ? "block"
                                                : "none"
                                        }}
                                    >
                                        Create a Hazard
                                    </Tab>
                                </TabList>
                                {/* Tab Content */}
                                {hazardType === "earthquakes" && (
                                    <>
                                        <DatasetEarthquake
                                            index={0}
                                            projectId={projectId}
                                            onClose={onClose}
                                            handleLayerUpdate={handleLayerUpdate}
                                        />
                                        <ModelEarthquake index={1} />
                                    </>
                                )}
                                {hazardType === "tornadoes" && (
                                    <>
                                        <RasterTornado index={0} />
                                        <ModelTornado index={1} />
                                    </>
                                )}
                                {hazardType === "hurricanes" && <DatasetHurricane index={0} />}
                                {hazardType === "floods" && <DatasetFlood index={0} />}
                                {hazardType === "tsunamis" && <DatasetTsunami index={0} />}
                            </Tabs>
                        </Grid>

                        {/* Right Panel: Map Component */}
                        <Grid sm={6}>
                            <Container disableGutters style={{ position: "relative" }}>
                                {/* Clear Layers Button */}
                                <Button
                                    variant="outlined"
                                    onClick={handleClearAllLayers}
                                    sx={{
                                        position: "absolute",
                                        zIndex: 100,
                                        right: "5px",
                                        top: "5px",
                                        background: "#FFFFFF"
                                    }}
                                >
                                    Clear All
                                </Button>

                                {/* Map Draw Prompts */}
                                {hazardType === "tornadoes" && (
                                    <TornadoMapDrawPrompt
                                        mapDialogOpen={mapDialogOpen}
                                        handleMapDialogClose={() => setMapDialogOpen(false)}
                                    />
                                )}
                                {hazardType === "earthquakes" && (
                                    <EqMapDrawPrompt
                                        mapDialogOpen={mapDialogOpen}
                                        handleMapDialogClose={() => setMapDialogOpen(false)}
                                    />
                                )}

                                {/* Map Component */}
                                <MapComponent layers={activeLayers} width={600} height={500} />
                            </Container>
                        </Grid>
                    </Grid>
                </Box>
            </ModalDialog>
        </Modal>
    );
};
