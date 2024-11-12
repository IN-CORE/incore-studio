import React, { useRef, useState } from "react";
import Map, { Layer, MapRef } from "react-map-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import config from "@app/app.config";

interface Layer {
    layerId: string;
    workspace?: string;
}

interface MapComponentProps {
    layers: Layer[];
    width?: number;
    height?: number;
}

const geoserverBaseUrl = `${config.hostname}/geoserver/incore/wms`;

export const MapComponent: React.FC<MapComponentProps> = ({ layers, width = 800, height = 600 }) => {
    const mapRef = useRef<MapRef>(null);
    const addedLayers = useRef<Set<string>>(new Set());
    const [activeLayers, setActiveLayers] = useState<{ [key: string]: boolean }>({});

    // Define bounding box for the entire contiguous U.S. in EPSG:4326
    const boundingBox: [number, number, number, number] = [-125.0, 24.396308, -66.93457, 49.384358];

    // Generate WMS URL based on layer name and bounding box
    const getWmsUrl = (layerName: string, width = 256, height = 256) => {
        const srs = "EPSG:4326";
        return `${geoserverBaseUrl}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&tiled=true&LAYERS=${layerName}&WIDTH=${width}&HEIGHT=${height}&SRS=${srs}&BBOX=${boundingBox.join(
            ","
        )}`;
    };

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
                    zoom: 3
                }}
                style={{ width: "100%", height: "100%" }}
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                onLoad={() => {
                    layers.forEach((layer) => {
                        const layerId = `${layer.workspace ?? "incore"}:${layer.layerId}`;

                        if (addedLayers.current.has(layerId)) {
                            console.warn(`Layer with ID ${layerId} already added. Skipping duplicate.`);
                            return;
                        }

                        mapRef.current?.getMap().addSource(layerId, {
                            type: "raster",
                            tiles: [getWmsUrl(layerId)],
                            tileSize: 256
                        });

                        mapRef.current?.getMap().addLayer({
                            id: layerId,
                            type: "raster",
                            source: layerId,
                            layout: { visibility: "none" } // Initially hidden
                        });

                        setActiveLayers((prev) => ({ ...prev, [layerId]: false }));
                        addedLayers.current.add(layerId);
                    });
                }}
            />

            {/* Layer Switcher Control */}
            <div
                style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    backgroundColor: "white",
                    padding: "10px",
                    borderRadius: "4px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                    zIndex: 1
                }}
            >
                <h4>Layers</h4>
                {Object.entries(activeLayers).map(([layerId, isActive]) => (
                    <div key={layerId}>
                        <input type="checkbox" checked={isActive} onChange={() => toggleLayer(layerId)} />
                        <label style={{ marginLeft: 4 }}>{layerId}</label>
                    </div>
                ))}
            </div>
        </div>
    );
};
