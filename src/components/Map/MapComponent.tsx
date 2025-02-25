import React, { useRef, useState, useEffect, useCallback} from "react";
import Map, { Source, Layer, MapRef } from "react-map-gl/maplibre";
import MapboxDraw, { DrawCreateEvent} from "@mapbox/mapbox-gl-draw";

import "maplibre-gl/dist/maplibre-gl.css";
import "mapbox-gl-draw/dist/mapbox-gl-draw.css";

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
    boundingBox = [-125.0, 24.396308, -66.93457, 49.384358]
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
                maxBounds={boundingBox}
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


interface MapComponentWithDrawingProps {
  width?: number;
  height?: number;
  zoom?: number;
  boundingBox?: [number, number, number, number];
  selectedHazardType: string;
  enableSrcEdit: boolean;
  setStartCoord?: (coord: number[]) => void;
  setEndCoord?: (coord: number[]) => void;
  setSrcCoord: React.Dispatch<React.SetStateAction<[number, number]>>;
}

export const MapComponentWithDrawing: React.FC<MapComponentWithDrawingProps> = ({
  width = 800,
  height = 600,
  zoom = 4,
  boundingBox = [-125.0, 24.396308, -66.93457, 49.384358],
  selectedHazardType,
  enableSrcEdit,
  setStartCoord,
  setEndCoord,
  setSrcCoord,
}) => {
  const mapRef = useRef<MapRef>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  // Optional state to display drawn features for debugging.
  const [drawnFeatures, setDrawnFeatures] = useState<any[]>([]);

  // Handler for tornado drawing: update start and end coordinates from a drawn line.
  const onTornadoDrawEnd = useCallback((e: DrawCreateEvent) => {
    // Expect only one feature drawn.
    const feature = e.features[0];
    if (feature && feature.geometry && feature.geometry.coordinates) {
      const coords: number[][] = feature.geometry.coordinates;
      if (coords.length >= 2) {
        // setStartCoord(coords[0]);
        // setEndCoord(coords[coords.length - 1]);
      }
    }
    // Update drawn features state for display.
    setDrawnFeatures(drawRef.current?.getAll().features || []);
  }, [setStartCoord, setEndCoord]);

  // Handler for earthquake drawing: update coordinate from a drawn point.
  const onEarthquakeDrawEnd = useCallback((e: DrawCreateEvent) => {
    const feature = e.features[0];
    if (feature && feature.geometry && feature.geometry.coordinates) {
      // For a point, use the coordinates directly.
      setSrcCoord(feature.geometry.coordinates as number[]);
    }
    setDrawnFeatures(drawRef.current?.getAll().features || []);
  }, [setSrcCoord]);

  // Set up (or update) the draw mode based on hazard type, tab index, and edit mode.
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    if (!map) return;
    // If no draw control exists yet, create and add it.
    if (!drawRef.current) {
      drawRef.current = new MapboxDraw({
        displayControlsDefault: false,
      });
      map.addControl(drawRef.current);
    }
    // Clear any existing drawn features.
    drawRef.current.deleteAll();
    // Remove any previous "draw.create" event listeners.
    map.off("draw.create", onTornadoDrawEnd);
    map.off("draw.create", onEarthquakeDrawEnd);

    // When the user is in drawing mode (not editing via textbox)
    if (!enableSrcEdit) {
      if (selectedHazardType === "tornado") {
        // Change mode to draw a LineString. (You may pass options like maxPoints if needed.)
        drawRef.current.changeMode("draw_line_string", { maxPoints: 2 });
        map.on("draw.create", onTornadoDrawEnd);
      } else if (selectedHazardType === "earthquake") {
        drawRef.current.changeMode("draw_point");
        map.on("draw.create", onEarthquakeDrawEnd);
      } else {
        // For other hazard types, you might disable drawing.
        drawRef.current.changeMode("simple_select");
      }
    } else {
      // If drawing is not allowed, exit drawing mode.
      drawRef.current.changeMode("simple_select");
    }
  }, [
    selectedHazardType,
    enableSrcEdit,
    onTornadoDrawEnd,
    onEarthquakeDrawEnd,
  ]);

  return (
    <Box sx={{ position: "relative", width, height }}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: (boundingBox[0] + boundingBox[2]) / 2,
          latitude: (boundingBox[1] + boundingBox[3]) / 2,
          zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        maxBounds={boundingBox}
      />
      {/* Optional overlay to display drawn features (for debugging) */}
      <Box
        sx={{
          position: "absolute",
          bottom: 10,
          left: 10,
          backgroundColor: "rgba(255,255,255,0.9)",
          p: 1,
          borderRadius: 1,
          maxHeight: "150px",
          overflowY: "auto",
        }}
      >
        <Typography level="body-sm" sx={{ mb: 1 }}>
          Drawn Features:
        </Typography>
        {drawnFeatures.length === 0 ? (
          <Typography level="body-xs">None</Typography>
        ) : (
          drawnFeatures.map((feature, index) => (
            <Typography key={index} level="body-xs">
              {JSON.stringify(feature.geometry)}
            </Typography>
          ))
        )}
      </Box>
    </Box>
  );
};
