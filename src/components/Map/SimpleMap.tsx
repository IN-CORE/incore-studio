import React from "react";
import maplibre from "maplibre-gl";
import { Box, Accordion, AccordionSummary, AccordionDetails, Typography, Checkbox } from "@mui/joy";
import { ZoomOutMap as ZoomOutMapIcon } from "@mui/icons-material";
import "maplibre-gl/dist/maplibre-gl.css";

import config from "@app/app.config";
import { getHeaders, getLayerBoundingBox } from "@app/utils";
import { MapControl } from "./Control";
import { IS_WEBGL_SUPPORTED } from "./utils";

interface Props {
    mapOptions: Partial<maplibregl.MapOptions>;
    layers?: IncoreLayer[]; // Optional layers for switching
    initialBounds?: number[];
    center?: maplibregl.LngLatLike;
    init_zoom?: number;
    attribution?: boolean;
    navigation?: boolean;
    onLoad: (map: maplibregl.Map) => void;
}

const SimpleMap = ({
    mapOptions,
    layers = [],
    initialBounds,
    center,
    init_zoom,
    attribution,
    navigation,
    onLoad
}: Props): JSX.Element => {
    const mapContainerRef = React.useRef<HTMLDivElement>(null);
    const mapRef = React.useRef<maplibregl.Map>();
    const resetBoundsButtonRef = React.useRef<HTMLButtonElement>(null);
    const [activeLayers, setActiveLayers] = React.useState<{ [key: string]: boolean }>({});
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [zoom] = React.useState(init_zoom || 8);
    const [layerBoundingBoxes, setLayerBoundingBoxes] = React.useState<
        Record<string, [number, number, number, number] | null>
    >({});

    React.useEffect(() => {
        if (mapContainerRef.current) {
            const mapInit = {
                container: mapContainerRef.current,
                zoom,
                attributionControl: !attribution,
                style: config.basemapStyle,
                ...mapOptions
            };

            if (center) {
                mapInit.center = center;
            } else if (initialBounds) {
                mapInit.bounds = new maplibre.LngLatBounds(
                    [initialBounds[0], initialBounds[1]],
                    [initialBounds[2], initialBounds[3]]
                );
            } else {
                mapInit.bounds = new maplibre.LngLatBounds(
                    [config.VALID_MAP_BOUNDS[0], config.VALID_MAP_BOUNDS[1]],
                    [config.VALID_MAP_BOUNDS[2], config.VALID_MAP_BOUNDS[3]]
                );
            }

            const map = new maplibre.Map({
                ...(mapInit as maplibregl.MapOptions),
                transformRequest: (url) => {
                    if (url.startsWith(`${config.hostname}/geoserver/`)) {
                        try {
                            return {
                                url,
                                headers: getHeaders()
                            };
                        } catch (err) {
                            console.warn("Failed to apply transformRequest logic:", err);
                            return { url };
                        }
                    }

                    return { url }; //
                }
            });

            if (attribution) {
                map.addControl(new maplibre.AttributionControl({ compact: true }), "bottom-right");
            }

            if (navigation) {
                map.addControl(new maplibre.NavigationControl({ showCompass: false }), "bottom-left");
                if (resetBoundsButtonRef.current) {
                    map.addControl(new MapControl(resetBoundsButtonRef.current), "bottom-left");
                }
            }

            map.on("load", () => {
                onLoad(map);
                setIsLoaded(true);
            });
            mapRef.current = map;
        }
    }, []);

    // Fetch bounding boxes for layers
    React.useEffect(() => {
        const fetchBBoxes = async () => {
            const bboxMap: Record<string, [number, number, number, number] | null> = {};

            await Promise.all(
                layers.map(async (layer) => {
                    try {
                        const bbox = await getLayerBoundingBox(layer.layerId);
                        bboxMap[`incore-${layer.layerId}`] = bbox;
                    } catch (error) {
                        console.warn(`Bounding box fetch failed for ${layer.layerId}`, error);
                    }
                })
            );

            setLayerBoundingBoxes(bboxMap);
        };

        if (layers.length > 0) {
            fetchBBoxes();
        }
    }, [layers]);

    // **Effect to handle dynamic layers**
    React.useEffect(() => {
        if (mapRef.current === undefined || !isLoaded) return;

        const map = mapRef.current;
        const existingLayers = new Set(map.getStyle()?.layers?.map((l) => l.id));

        layers.forEach((layer, index) => {
            const layerId = `incore-${layer.layerId}`;
            const layerName = `${layer.workspace}:${layer.layerId}`;

            if (!existingLayers.has(layerId)) {
                // Add source if it doesn't exist
                if (!map.getSource(layerId)) {
                    map.addSource(layerId, {
                        type: "raster",
                        tiles: [
                            `${
                                config.hostname
                            }/geoserver/incore/wms/?bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.1.1&request=GetMap&srs=EPSG:3857&width=256&height=256&layers=${layerName}&transparent=true${
                                layer.styleName ? `&styles=${layer.styleName}` : ""
                            }`
                        ],
                        tileSize: 256
                    });
                }

                // Add layer
                map.addLayer({
                    id: layerId,
                    type: "raster",
                    source: layerId,
                    layout: {
                        visibility: index === 0 ? "visible" : "none" // First layer visible
                    }
                });

                setActiveLayers((prev) => ({
                    ...prev,
                    [layerId]: index === 0 // First layer enabled
                }));
            }
        });

        // TODO: Figuring out what this code is doing?
        // **Remove layers that no longer exist in props**
        existingLayers.forEach((layerId) => {
            if (!layers.some((layer) => `incore-${layer.layerId}` === layerId) && layerId.startsWith("incore-")) {
                map.removeLayer(layerId);
                map.removeSource(layerId);
            }
        });

        // Fly to first layer's bbox if map hasn't moved yet
        if (layers.length > 0 && Object.keys(layerBoundingBoxes).length > 0 && map && !initialBounds && !center) {
            const firstBbox = layerBoundingBoxes[`incore-${layers[0].layerId}`];
            if (firstBbox) {
                flyToBoundingBox(firstBbox);
            }
        }
    }, [layers, isLoaded, layerBoundingBoxes]);

    // Function to fly to bounding box
    const flyToBoundingBox = (bbox: [number, number, number, number] | null) => {
        if (!mapRef.current || !bbox || bbox.length !== 4) return;

        const [minLng, minLat, maxLng, maxLat] = bbox;
        mapRef.current.fitBounds(
            [
                [minLng, minLat],
                [maxLng, maxLat]
            ],
            {
                animate: true,
                duration: 1000
            }
        );
    };

    // Function to toggle layers on/off
    const toggleLayer = (layerId: string) => {
        if (!mapRef.current) return;

        const visibility = activeLayers[layerId] ? "none" : "visible";
        mapRef.current.setLayoutProperty(layerId, "visibility", visibility);

        setActiveLayers((prev) => {
            const updated = { ...prev, [layerId]: !prev[layerId] };

            // Fly to bbox if layer turned on
            if (!prev[layerId] && layerBoundingBoxes[layerId]) {
                flyToBoundingBox(layerBoundingBoxes[layerId]);
            }

            return updated;
        });
    };

    return (
        <Box
            ref={mapContainerRef}
            sx={{
                height: "100%"
            }}
        >
            {IS_WEBGL_SUPPORTED ? null : "Your browser does not support the map features."}

            {navigation ? (
                <Box ref={resetBoundsButtonRef} className="maplibregl-ctrl-group">
                    <button
                        type="button"
                        title="Reset Map"
                        onClick={() => {
                            if (mapRef.current) {
                                if (center) {
                                    mapRef.current?.flyTo({ center, zoom });
                                } else {
                                    mapRef.current?.fitBounds(initialBounds as maplibregl.LngLatBoundsLike);
                                }
                            }
                        }}
                    >
                        <ZoomOutMapIcon sx={{ color: "black" }} />
                    </button>
                </Box>
            ) : null}

            {/* Layer Switcher UI */}
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
                        {layers.map((layer) => (
                            <Box key={layer.layerId} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <Checkbox
                                    checked={!!activeLayers[`incore-${layer.layerId}`]}
                                    onChange={() => toggleLayer(`incore-${layer.layerId}`)}
                                    size="sm"
                                    sx={{ mr: 1 }}
                                />
                                <Typography>{`${layer.workspace}:${layer.layerId}`}</Typography>
                            </Box>
                        ))}
                    </AccordionDetails>
                </Accordion>
            </Box>
        </Box>
    );
};

export default SimpleMap;
