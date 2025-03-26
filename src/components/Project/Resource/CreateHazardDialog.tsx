import React, { useState, useRef, useEffect } from "react";
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
import maplibregl, { LngLatLike, GeoJSONSource, Marker } from "maplibre-gl";

import { DatasetEarthquake } from "@app/components/Project/Hazards/DatasetEarthquake";
import { ModelEarthquake } from "@app/components/Project/Hazards/ModelEarthquake";
import { DatasetTornado } from "@app/components/Project/Hazards/DatasetTornado";
import { ModelTornado } from "@app/components/Project/Hazards/ModelTornado";
import { DatasetHurricane } from "@app/components/Project/Hazards/DatasetHurricane";
import { DatasetFlood } from "@app/components/Project/Hazards/DatasetFlood";
import { DatasetTsunami } from "@app/components/Project/Hazards/DatasetTsunami";
import SimpleMap from "@app/components/Map/SimpleMap";
import config from "@app/app.config";
import { TornadoMapDrawPrompt } from "@app/components/Map/TornadoMapDrawPrompt";
import { EqMapDrawPrompt } from "@app/components/Map/EqMapDrawPrompt";
import { round } from "@app/utils";

interface CreateHazardDialogProps {
    projectId: string;
    resourceType: string;
    open: boolean;
    onClose: () => void;
}

// Hazard Layer Mapping
const hazardLayers: Record<string, IncoreLayer> = {
    earthquakes: { workspace: "incore", layerId: "" },
    floods: { workspace: "incore", layerId: "" },
    hurricanes: { workspace: "incore", layerId: "" },
    tornadoes: { workspace: "incore", layerId: "" },
    tsunamis: { workspace: "incore", layerId: "" }
};

const TAB_DATASET_HAZARD = "dataset-based";
const TAB_MODEL_HAZARD = "model-based";

export const CreateHazardDialog: React.FC<CreateHazardDialogProps> = ({ open, onClose, projectId, resourceType }) => {
    const [hazardType, setHazardType] = useState<string>("");
    const hazardTypeRef = useRef<string>(""); // mutable hazard type needed for map listener

    const [activeLayers, setActiveLayers] = useState<IncoreLayer[]>([]);
    const [points, setPoints] = useState<LngLatLike[]>([]);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);
    const [mapDialogOpen, setMapDialogOpen] = React.useState(false); // map prompt
    const [drawn, setDrawn] = useState<boolean>(false);

    // When Switching Tab, open map prompt
    const [currTabIndex, setCurrTabIndex] = useState<string>(TAB_DATASET_HAZARD);
    const currTabIndexRef = useRef<string>(TAB_DATASET_HAZARD); // mutable tab index needed for map listener
    useEffect(() => {
        resetDrawing();

        // setup prompt
        if (
            (hazardType === "tornadoes" && currTabIndex === TAB_MODEL_HAZARD) ||
            (hazardType === "earthquakes" && currTabIndex === TAB_MODEL_HAZARD)
        ) {
            setMapDialogOpen(true);
            if (mapInstance) mapInstance.getCanvas().style.cursor = "crosshair";
        } else {
            setMapDialogOpen(false);
            if (mapInstance) mapInstance.getCanvas().style.cursor = "pointer";
        }
    }, [hazardType, currTabIndex]);

    // Function to draw a single point (used for earthquakes)
    const drawPoint = (point: LngLatLike, map: maplibregl.Map) => {
        const el = document.createElement("span");

        Object.assign(el.style, {
            height: "2em",
            width: "2em",
            backgroundColor: "#D63649",
            borderRadius: "50%",
            display: "block",
            margin: "auto"
        });

        const marker = new maplibregl.Marker({ element: el }).setLngLat(point).addTo(map);

        setMarkers((prevMarkers) => [...prevMarkers, marker]);
        setDrawn(true);
    };

    // Function to draw a line between the selected points
    const drawLine = (point1: LngLatLike, point2: LngLatLike, map: maplibregl.Map) => {
        const source = map.getSource("drawn-line") as GeoJSONSource;

        if (source) {
            source.setData({
                type: "FeatureCollection",
                features: [
                    {
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: [point1 as number[], point2 as number[]]
                        },
                        properties: {}
                    }
                ]
            });
        } else {
            map.addSource("drawn-line", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [
                        {
                            type: "Feature",
                            geometry: {
                                type: "LineString",
                                coordinates: [point1 as number[], point2 as number[]]
                            },
                            properties: {}
                        }
                    ]
                }
            });
            map.addLayer({
                id: "drawn-line-layer",
                type: "line",
                source: "drawn-line",
                paint: {
                    "line-color": "#979797",
                    "line-width": 2,
                    "line-dasharray": [2, 2]
                }
            });
        }

        setDrawn(true);
    };

    // Function to reset the points and remove the line
    const resetDrawing = () => {
        setDrawn(false);
        setPoints([]);
        // Remove markers from map
        markers.forEach((marker) => marker.remove());
        setMarkers([]);

        if (mapInstance?.getSource("drawn-line")) {
            (mapInstance.getSource("drawn-line") as GeoJSONSource).setData({
                type: "FeatureCollection",
                features: []
            });
        }
    };

    const onMapLoad = (map: maplibregl.Map) => {
        setMapInstance(map);

        map.on("click", (event) => {
            const currentHazardType = hazardTypeRef.current;
            const currentTabIndex = currTabIndexRef.current;
            if (currentHazardType === "tornadoes" && currentTabIndex === TAB_MODEL_HAZARD) {
                setPoints((prevPoints) => {
                    if (prevPoints.length >= 2 || drawn) {
                        return prevPoints;
                    }

                    const newPoint: LngLatLike = [round(event.lngLat.lng, 4), round(event.lngLat.lat, 4)];

                    if (prevPoints.length === 1) {
                        const [prevLng, prevLat] = prevPoints[0] as number[];
                        const distance = Math.sqrt((prevLng - newPoint[0]) ** 2 + (prevLat - newPoint[1]) ** 2);
                        if (distance < 0.00001) {
                            console.log("Points are too close. Select a different location.");
                            return prevPoints;
                        }
                    }

                    const updatedPoints = [...prevPoints, newPoint];

                    // === Marker Creation ===
                    let newMarkerEl = document.createElement("div");

                    if (updatedPoints.length === 1) {
                        // First marker (green dot)
                        Object.assign(newMarkerEl.style, {
                            height: "1.5em",
                            width: "1.5em",
                            backgroundColor: "#96B712",
                            borderRadius: "50%",
                            display: "block",
                            margin: "auto"
                        });
                    }

                    if (updatedPoints.length === 2) {
                        // Second marker (red dot + label)
                        const wrapper = document.createElement("div");
                        wrapper.style.display = "flex";
                        wrapper.style.flexDirection = "column";
                        wrapper.style.alignItems = "center";

                        Object.assign(newMarkerEl.style, {
                            height: "1.5em",
                            width: "1.5em",
                            backgroundColor: "#D63649",
                            borderRadius: "50%",
                            display: "block",
                            margin: "auto"
                        });

                        wrapper.appendChild(newMarkerEl);
                        newMarkerEl = wrapper; // Use the wrapper as marker element
                    }

                    const marker = new maplibregl.Marker({ element: newMarkerEl }).setLngLat(newPoint).addTo(map);
                    setMarkers((prevMarkers) => [...prevMarkers, marker]);

                    // Draw line once both points are selected
                    if (updatedPoints.length === 2) {
                        drawLine(updatedPoints[0], updatedPoints[1], map);
                    }

                    return updatedPoints;
                });
            } else if (currentHazardType === "earthquakes" && currentTabIndex === TAB_MODEL_HAZARD) {
                setPoints((prevPoints) => {
                    // EQ should only have 1 point
                    if (prevPoints.length >= 1 || drawn) {
                        return prevPoints;
                    }
                    const newPoint: LngLatLike = [round(event.lngLat.lng, 4), round(event.lngLat.lat, 4)];
                    const updatedPoints = [...prevPoints, newPoint];
                    if (updatedPoints.length === 1) {
                        drawPoint(updatedPoints[0], map);
                    }
                    return updatedPoints;
                });
            }
        });
    };

    // TODO: Redraw when `points` change
    // Easy for EQ; hard for tornado which has start/end points that can be changed

    // Handle Hazard Selection
    const handleHazardChange = (_: any, newValue: string | null) => {
        if (newValue) {
            setHazardType(newValue);
            hazardTypeRef.current = newValue; // keep ref in sync
        }
    };

    const handleLayerUpdate = (layerId: string) => {
        if (hazardType && hazardLayers[hazardType]) {
            let styleName = ""; // Default empty style

            // Check if hazardType exists in config.defaultLayerStyles
            // @ts-ignore
            if (config?.defaultLayerStyles[hazardType]) {
                // @ts-ignore
                styleName = config.defaultLayerStyles[hazardType]; // Direct mapping
            } else if (hazardType === "hurricanes") {
                // TODO fixme Use the first available hurricane style
                const hurricaneStyles = Object.values(config.defaultLayerStyles.MapUtil.hurricane);
                styleName = hurricaneStyles.length > 0 ? hurricaneStyles[0] : "";
            }

            setActiveLayers([{ ...hazardLayers[hazardType], layerId, styleName }]);
        }
    };

    // Clear Layers on Map
    const handleClearAllLayers = () => {
        setActiveLayers([]);
    };

    return (
        <Modal
            open={open}
            onClose={() => {
                // close modal and clear map layers
                onClose();
                handleClearAllLayers();
                setHazardType("");
            }}
        >
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
                                <FormControl required sx={{ marginBottom: "1.5em" }}>
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
                            <Tabs
                                value={currTabIndex}
                                onChange={(_, val) => {
                                    setCurrTabIndex(val as string);
                                    currTabIndexRef.current = val as string; // keep ref in sync
                                }}
                            >
                                <TabList>
                                    <Tab value={TAB_DATASET_HAZARD}>Upload a Hazard Dataset</Tab>
                                    <Tab
                                        value={TAB_MODEL_HAZARD}
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
                                            value={TAB_DATASET_HAZARD}
                                            projectId={projectId}
                                            handleLayerUpdate={handleLayerUpdate}
                                        />
                                        <ModelEarthquake
                                            value={TAB_MODEL_HAZARD}
                                            projectId={projectId}
                                            handleLayerUpdate={handleLayerUpdate}
                                            setPoints={setPoints}
                                            points={points}
                                        />
                                    </>
                                )}
                                {hazardType === "tornadoes" && (
                                    <>
                                        <DatasetTornado
                                            value={TAB_DATASET_HAZARD}
                                            projectId={projectId}
                                            handleLayerUpdate={handleLayerUpdate}
                                        />
                                        <ModelTornado
                                            value={TAB_MODEL_HAZARD}
                                            projectId={projectId}
                                            handleLayerUpdate={handleLayerUpdate}
                                            setPoints={setPoints}
                                            points={points}
                                        />
                                    </>
                                )}
                                {hazardType === "hurricanes" && (
                                    <DatasetHurricane
                                        value={TAB_DATASET_HAZARD}
                                        projectId={projectId}
                                        handleLayerUpdate={handleLayerUpdate}
                                    />
                                )}
                                {hazardType === "floods" && (
                                    <DatasetFlood
                                        value={TAB_DATASET_HAZARD}
                                        projectId={projectId}
                                        handleLayerUpdate={handleLayerUpdate}
                                    />
                                )}
                                {hazardType === "tsunamis" && (
                                    <DatasetTsunami
                                        value={TAB_DATASET_HAZARD}
                                        projectId={projectId}
                                        handleLayerUpdate={handleLayerUpdate}
                                    />
                                )}
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

                                {/* Map Component */}
                                <Box sx={{ width: "600px", height: "500px" }}>
                                    <SimpleMap
                                        mapOptions={{
                                            minZoom: 1,
                                            style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                                        }}
                                        navigation
                                        initialBounds={
                                            config.DEFAULT_MAP_BOUNDS.length === 4
                                                ? (config.DEFAULT_MAP_BOUNDS as [number, number, number, number])
                                                : undefined
                                        }
                                        layers={activeLayers}
                                        onLoad={onMapLoad}
                                    />
                                    {drawn && (
                                        <Button
                                            variant="solid"
                                            color="danger"
                                            onClick={resetDrawing}
                                            sx={{
                                                position: "absolute",
                                                bottom: 10,
                                                left: 50,
                                                padding: "10px",
                                                fontSize: "14px"
                                            }}
                                        >
                                            Reset
                                        </Button>
                                    )}
                                    {hazardType === "tornadoes" && currTabIndex === TAB_MODEL_HAZARD ? (
                                        <TornadoMapDrawPrompt
                                            mapDialogOpen={mapDialogOpen}
                                            handleMapDialogClose={() => {
                                                setMapDialogOpen(false);
                                            }}
                                        />
                                    ) : hazardType === "earthquakes" && currTabIndex === TAB_MODEL_HAZARD ? (
                                        <EqMapDrawPrompt
                                            mapDialogOpen={mapDialogOpen}
                                            handleMapDialogClose={() => {
                                                setMapDialogOpen(false);
                                            }}
                                        />
                                    ) : (
                                        <></>
                                    )}
                                </Box>
                            </Container>
                        </Grid>
                    </Grid>
                </Box>
            </ModalDialog>
        </Modal>
    );
};
