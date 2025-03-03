import React, { useRef, useState, useEffect } from "react";
import Map, { Source, Layer, MapRef } from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

import config from "@app/app.config";
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography, Checkbox } from "@mui/joy";

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
    const mapRef = useRef<MapRef>(null);
    const [uniqueLayers, setUniqueLayers] = useState<IncoreLayer[]>([]);
    const [activeLayers, setActiveLayers] = useState<{ [key: string]: boolean }>({});

    // Deduplicate layers
    useEffect(() => {
        const uniqueLayers =
            layers.length > 0
                ? Array.from(
                      new Set(
                          layers.map((layer) =>
                              JSON.stringify({
                                  workspace: layer.workspace,
                                  layerId: layer.layerId,
                                  styleName: layer.styleName
                              })
                          )
                      )
                  ).map((layerString) => JSON.parse(layerString))
                : [];

        setUniqueLayers(uniqueLayers);

        // Initialize the activeLayers state to set each layer's visibility to false (hidden)
        const initialActiveLayers = uniqueLayers.reduce((acc, layer) => {
            const layerId = layer?.layerId;
            return { ...acc, [layerId]: false };
        }, {});
        initialActiveLayers[uniqueLayers[0]?.layerId] = true; // Set the first layer to visible by default
        setActiveLayers(initialActiveLayers);
    }, [layers]);

    // Toggle visibility of a layer
    const toggleLayer = (layerId: string) => {
        if (!mapRef.current) return;

        const visibility = activeLayers[layerId] ? "none" : "visible";
        mapRef.current.getMap().setLayoutProperty(layerId, "visibility", visibility);

        setActiveLayers((prev) => ({ ...prev, [layerId]: !prev[layerId] }));
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
                style={{ width: "100%", height: "100%" }}
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                maxBounds={boundingBox as [number, number, number, number]}
            >
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

            {/* Layer Switcher Control */}
            <Box
                sx={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    width: "fit-content",
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
