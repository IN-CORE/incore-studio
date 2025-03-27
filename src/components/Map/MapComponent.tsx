import React, { useRef, useState, useEffect } from "react";
import Map, { Source, Layer, MapRef } from "react-map-gl/maplibre";
import { useAuth } from "react-oidc-context";

import "maplibre-gl/dist/maplibre-gl.css";
import config from "@app/app.config";
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography, Checkbox } from "@mui/joy";
import { getLayerBoundingBox } from "@app/utils";

interface MapComponentProps {
    layers: IncoreLayer[];
    zoom?: number;
    boundingBox?: [number, number, number, number];
    width?: number;
    height?: number;
}

export const MapComponent: React.FC<MapComponentProps> = ({
    layers,
    zoom = 4,
    width = 800,
    height = 600,
    boundingBox = config.DEFAULT_MAP_BOUNDS
}) => {
    const auth = useAuth();
    const mapRef = useRef<MapRef>(null);
    const [uniqueLayers, setUniqueLayers] = useState<IncoreLayer[]>([]);
    const [activeLayers, setActiveLayers] = useState<{ [key: string]: boolean }>({});

    // Fetch bounding boxes and deduplicate layers
    useEffect(() => {
        const fetchBoundingBoxes = async () => {
            if (layers.length === 0) return;

            const uniqueLayers = await Promise.all(
                Array.from(
                    new Set(
                        layers.map((layer) =>
                            JSON.stringify({
                                workspace: layer.workspace,
                                layerId: layer.layerId,
                                styleName: layer.styleName
                            })
                        )
                    )
                ).map(async (layerString) => {
                    const layer = JSON.parse(layerString);

                    // Fetch bounding box asynchronously
                    try {
                        layer.boundingBox = await getLayerBoundingBox(layer.layerId);
                    } catch (error) {
                        console.warn(`Failed to fetch bounding box for ${layer.layerId}`, error);
                    }

                    return layer;
                })
            );

            setUniqueLayers(uniqueLayers);

            // Initialize activeLayers (set first layer to active by default)
            const initialActiveLayers = uniqueLayers.reduce(
                (acc, layer) => {
                    acc[layer.layerId] = false;
                    return acc;
                },
                {} as { [key: string]: boolean }
            );

            if (uniqueLayers[0]) {
                initialActiveLayers[uniqueLayers[0].layerId] = true;
            }

            setActiveLayers(initialActiveLayers);
        };

        fetchBoundingBoxes();
    }, [layers]);

    // Function to fly to a given bounding box
    const flyToBoundingBox = (bbox: [number, number, number, number]) => {
        if (!mapRef.current || !Array.isArray(boundingBox) || boundingBox.length !== 4) {
            console.error("Invalid bounding box provided", boundingBox);
            return;
        }
        const [minLng, minLat, maxLng, maxLat] = bbox;
        mapRef.current.getMap().fitBounds(
            [
                [minLng, minLat], // Southwest corner
                [maxLng, maxLat] // Northeast corner
            ],
            {
                padding: 20,
                animate: true,
                duration: 1000
            }
        );
    };

    // Effect to fly to the active layer's bounding box
    useEffect(() => {
        if (!mapRef.current) return;
        if (uniqueLayers.length > 0 && uniqueLayers[0]?.boundingBox) {
            flyToBoundingBox(uniqueLayers[0].boundingBox);
        } else {
            flyToBoundingBox(boundingBox as [number, number, number, number]);
        }
    }, [uniqueLayers]);

    // Toggle layer visibility and update active layer state
    const toggleLayer = (layerId: string) => {
        if (!mapRef.current) return;

        setActiveLayers((prev) => {
            const newActiveLayers = { ...prev, [layerId]: !prev[layerId] };

            // Fly to the bounding box of the newly activated layer
            const activeLayer = uniqueLayers.find((layer) => layer.layerId === layerId);
            if (activeLayer?.boundingBox && newActiveLayers[layerId]) {
                flyToBoundingBox(activeLayer.boundingBox);
            }

            return newActiveLayers;
        });

        const visibility = activeLayers[layerId] ? "none" : "visible";
        mapRef.current.getMap().setLayoutProperty(layerId, "visibility", visibility);
    };

    return (
        <div style={{ position: "relative", width, height }}>
            <Map
                ref={mapRef}
                initialViewState={{
                    longitude: (boundingBox[0] + boundingBox[2]) / 2,
                    latitude: (boundingBox[1] + boundingBox[3]) / 2,
                    zoom
                }}
                transformRequest={(url) => {
                    if (url.startsWith(`${config.hostname}/geoserver`)) {
                        return {
                            url,
                            headers: {
                                Authorization: `Bearer ${auth.user?.access_token}`
                            }
                        };
                    }
                    return { url };
                }}
                style={{ width: "100%", height: "100%" }}
            >
                {/* Carto Basemap */}
                <Source
                    type="raster"
                    tiles={["https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png"]}
                    tileSize={256}
                >
                    <Layer type="raster" />
                </Source>

                {/* Add unique WMS layers */}
                {uniqueLayers.map((layer) => {
                    const layerName = `${layer.workspace}:${layer.layerId}`;
                    return (
                        <Source
                            key={layer.layerId}
                            id={layer.layerId}
                            type="raster"
                            tiles={[
                                `${
                                    config.hostname
                                }/geoserver/incore/wms/?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=${layerName}&transparent=true${
                                    layer.styleName ? `&styles=${layer.styleName}` : ""
                                }`
                            ]}
                            tileSize={256}
                        >
                            <Layer
                                id={layer.layerId}
                                type="raster"
                                source={layer.layerId}
                                layout={{ visibility: activeLayers[layer.layerId] ? "visible" : "none" }}
                            />
                        </Source>
                    );
                })}
            </Map>

            {/* Layer Switcher */}
            <Box
                sx={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    zIndex: 1,
                    padding: 2,
                    backgroundColor: "#fff",
                    border: "0.5px solid #999"
                }}
            >
                <Accordion variant="plain" defaultExpanded>
                    <AccordionSummary>
                        <Typography level="body-md">Layers</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ marginTop: "0.5em" }}>
                        {uniqueLayers.map((layer) => (
                            <Box key={layer.layerId} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <Checkbox
                                    checked={activeLayers[layer.layerId]}
                                    onChange={() => toggleLayer(layer.layerId)}
                                    size="sm"
                                    sx={{ mr: 1 }}
                                />
                                <Typography>{`${layer.workspace}:${layer.layerId}`}</Typography>
                            </Box>
                        ))}
                    </AccordionDetails>
                </Accordion>
            </Box>
        </div>
    );
};
