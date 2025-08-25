import React from "react";
import maplibregl from "maplibre-gl";
import { Box, Checkbox, Typography } from "@mui/joy";
import "maplibre-gl/dist/maplibre-gl.css";

import config from "@app/app.config";

interface BoundingBoxDrawerProps {
    onBboxSelected: (bbox: [number, number, number, number]) => void;
    height?: number;
}

const BoundingBoxDrawer: React.FC<BoundingBoxDrawerProps> = ({ onBboxSelected, height = 300 }) => {
    const mapContainerRef = React.useRef<HTMLDivElement>(null);
    const mapRef = React.useRef<maplibregl.Map>();
    const [isDrawing, setIsDrawing] = React.useState(false);
    const [startPoint, setStartPoint] = React.useState<maplibregl.LngLat | null>(null);
    const [drawModeEnabled, setDrawModeEnabled] = React.useState(false);
    const [mouseDownTime, setMouseDownTime] = React.useState<number>(0);
    
    // Use refs for synchronous access to drawing state
    const isDrawingRef = React.useRef(false);
    const startPointRef = React.useRef<maplibregl.LngLat | null>(null);

    // Initialize map
    React.useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            const map = new maplibregl.Map({
                container: mapContainerRef.current,
                style: config.basemapStyle,
                center: [-88.2272, 40.1164], // Champaign, Illinois
                zoom: 10,
                maxZoom: 18,
                minZoom: 2
            });

                    map.on('load', () => {
            console.log('BoundingBoxDrawer map loaded');
            mapRef.current = map;
        });

            return () => {
                if (mapRef.current) {
                    mapRef.current.remove();
                    mapRef.current = undefined;
                }
            };
        }
    }, []);

    // Draw bounding box function - matching test implementation exactly
    const drawBoundingBox = (start: maplibregl.LngLat, end: maplibregl.LngLat) => {
        const map = mapRef.current;
        if (!map) {
            console.log('No map available for drawing');
            return;
        }
        
        const coordinates = [
            [start.lng, start.lat],
            [end.lng, start.lat],
            [end.lng, end.lat],
            [start.lng, end.lat],
            [start.lng, start.lat] // Close the polygon
        ];
        
        // Remove existing bounding box source and layer - matching test IDs
        if (map.getSource('bounding-box')) {
            if (map.getLayer('bounding-box-fill')) {
                map.removeLayer('bounding-box-fill');
            }
            if (map.getLayer('bounding-box-layer')) {
                map.removeLayer('bounding-box-layer');
            }
            map.removeSource('bounding-box');
        }
        
        // Add new bounding box
        map.addSource('bounding-box', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: [coordinates]
                },
                properties: {}
            }
        });
        
        map.addLayer({
            id: 'bounding-box-layer',
            type: 'line',
            source: 'bounding-box',
            paint: {
                'line-color': '#ff0000',
                'line-width': 4,
                'line-opacity': 1.0
            }
        });
        
        map.addLayer({
            id: 'bounding-box-fill',
            type: 'fill',
            source: 'bounding-box',
            paint: {
                'fill-color': '#ff0000',
                'fill-opacity': 0.1
            }
        });
    };

    const clearBoundingBox = () => {
        const map = mapRef.current;
        if (!map) return;

        if (map.getSource('bounding-box')) {
            map.removeLayer('bounding-box-fill');
            map.removeLayer('bounding-box-layer');
            map.removeSource('bounding-box');
        }
    };

    const finalizeBoundingBox = (start: maplibregl.LngLat, end: maplibregl.LngLat) => {
        const minLng = Math.min(start.lng, end.lng);
        const minLat = Math.min(start.lat, end.lat);
        const maxLng = Math.max(start.lng, end.lng);
        const maxLat = Math.max(start.lat, end.lat);
        
        onBboxSelected([minLng, minLat, maxLng, maxLat]);
    };

    // Event handlers - matching test implementation exactly
    const onMouseDown = (e: maplibregl.MapMouseEvent) => {
        if (!drawModeEnabled) {
            return;
        }
        
        setIsDrawing(true);
        setStartPoint(e.lngLat);
        setMouseDownTime(Date.now());
        
        // Update refs synchronously
        isDrawingRef.current = true;
        startPointRef.current = e.lngLat;
    };

    const onMouseMove = (e: maplibregl.MapMouseEvent) => {
        // Use refs for synchronous access
        if (!isDrawingRef.current || !startPointRef.current) {
            return;
        }
        
        drawBoundingBox(startPointRef.current, e.lngLat);
    };

    const onMouseUp = (e: maplibregl.MapMouseEvent) => {
        const timeSinceMouseDown = Date.now() - mouseDownTime;
        
        if (!isDrawingRef.current || !startPointRef.current) {
            return;
        }
        
        // Ignore mouse up if it happens too quickly after mouse down (less than 50ms)
        if (timeSinceMouseDown < 50) {
            return;
        }
        
        setIsDrawing(false);
        const endPoint = e.lngLat;
        
        // Only create bounding box if there's meaningful distance
        const distance = Math.sqrt(
            Math.pow(endPoint.lng - startPointRef.current.lng, 2) + 
            Math.pow(endPoint.lat - startPointRef.current.lat, 2)
        );
        
        if (distance > 0.001) { // Minimum distance threshold
            finalizeBoundingBox(startPointRef.current, endPoint);
        } else {
            clearBoundingBox();
        }
        
        setStartPoint(null);
        
        // Reset refs
        isDrawingRef.current = false;
        startPointRef.current = null;
    };

    // Enable/disable drawing - matching test implementation
    const enableBoundingBoxDrawing = () => {
        const map = mapRef.current;
        if (!map) {
            console.log('No map available for enabling drawing');
            return;
        }

        map.getCanvas().style.cursor = 'crosshair';
        
        // Disable ALL map interactions to prevent any interference
        map.dragPan.disable();
        map.dragRotate.disable();
        map.scrollZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        map.doubleClickZoom.disable();
        
        // Add event listeners for drawing
        map.on('mousedown', onMouseDown);
        map.on('mousemove', onMouseMove);
        map.on('mouseup', onMouseUp);
    };

    const disableBoundingBoxDrawing = () => {
        const map = mapRef.current;
        if (!map) return;

        map.getCanvas().style.cursor = '';
        
        // Re-enable ALL map interactions
        map.dragPan.enable();
        map.dragRotate.enable();
        map.scrollZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
        map.doubleClickZoom.enable();
        
        // Remove event listeners
        map.off('mousedown', onMouseDown);
        map.off('mousemove', onMouseMove);
        map.off('mouseup', onMouseUp);
        
        // Clear any existing bounding box
        clearBoundingBox();
    };

    // Handle draw mode toggle
    React.useEffect(() => {
        if (drawModeEnabled) {
            enableBoundingBoxDrawing();
        } else {
            disableBoundingBoxDrawing();
        }
    }, [drawModeEnabled]);

    return (
        <Box sx={{ position: "relative" }}>
            <Box 
                ref={mapContainerRef} 
                sx={{ 
                    height: height, 
                    border: "1px solid #ddd",
                    position: "relative"
                }} 
            />
            <Box sx={{ 
                position: "absolute", 
                top: 8, 
                right: 8, 
                zIndex: 2, 
                backgroundColor: "#fff", 
                p: 1, 
                border: "1px solid #ddd", 
                borderRadius: 4 
            }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                        size="sm"
                        checked={drawModeEnabled}
                        onChange={(e) => setDrawModeEnabled(e.target.checked)}
                    />
                    <Typography level="body-sm" sx={{ ml: 1 }}>
                        Draw Bounding Box
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default BoundingBoxDrawer; 