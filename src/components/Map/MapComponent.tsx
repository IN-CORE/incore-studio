import React, { useRef, useState, useEffect } from "react";
import Map, { Source, Layer, MapRef, MapMouseEvent } from "react-map-gl/maplibre";
import { useAuth } from "react-oidc-context";

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
    const auth = useAuth();

    const mapRef = useRef<MapRef>(null);
    const [uniqueLayers, setUniqueLayers] = useState<IncoreLayer[]>([]);
    const [activeLayers, setActiveLayers] = useState<{ [key: string]: boolean }>({});
    const [mouseCoords, setMouseCoords] = useState<{ lat: number; lon: number } | null>(null);
    // Handle mouse move to show coordinates
    const handleMouseMove = (event: MapMouseEvent) => {
        const { lng, lat } = event.lngLat;
        setMouseCoords({ lat, lon: lng });
    };

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
                transformRequest={(url) => {
                    return {
                        url,
                        headers: {
                            Authorization: `Bearer ${auth.user?.access_token}`
                        }
                    };
                }}
                style={{ width: "100%", height: "100%" }}
                maxBounds={boundingBox as [number, number, number, number]}
                onMouseMove={handleMouseMove}
            >
                {/* Carto Basemap as Raster Source */}
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

            {/* Mouse-over Coordinate Display */}
            {mouseCoords && (
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 10,
                        left: 10,
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        padding: "5px 10px",
                        borderRadius: "5px",
                        fontSize: "14px",
                        boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.2)",
                        zIndex: 1
                    }}
                >
                    <Typography level="body-sm">
                        Lat: {mouseCoords.lat.toFixed(4)}, Lon: {mouseCoords.lon.toFixed(4)}
                    </Typography>
                </Box>
            )}
        </div>
    );
};
