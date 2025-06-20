import { setMapLayers } from "@ncsa/geo-explorer";
import { useEffect } from "react";
import { useDispatch } from "@ncsa/geo-explorer";
import config from "@app/app.config";
import { MapLayer, MapLayerStyle } from "@ncsa/geo-explorer/dist/store/explore/types";
import { LayerType } from "@ncsa/geo-explorer/dist/types";

const isLayerType = (type: any): type is LayerType => ["point", "line", "polygon", "raster"].includes(type);

const defaultStyle: MapLayerStyle = {
    layerOpacity: 1.0,
    radius: 5,
    fillColor: "#3388ff",
    fillOpacity: 0.5,
    strokeWidth: 1,
    strokeColor: "#000000",
    strokeOpacity: 1.0
};

export const GeoExplorerLoader = ({ visualization }: { visualization: Visualization }) => {
    const geoExplorerDispatch = useDispatch();

    useEffect(() => {
        if (!visualization?.layers?.length) return;

        const mapLayers: MapLayer[] = visualization.layers.map((layer) => ({
            data: {
                layer_id: layer.layerId,
                display_name: layer.displayName ?? "Untitled Layer",
                layer_type: isLayerType(layer.layerType) ? layer.layerType : "point",
                description: layer.description ?? "N/A",
                default_style_name: layer.styleName,
                ogc_service_url: `${config.hostname}/geoserver`,
                labels: {
                    dataset_category: layer.datasetCategoryType ?? "Unknown"
                },
                bounding_box: layer.boundingBox,
                timestamps: []
            },
            playing: false,
            timestampIdx: 0,
            visible: true,
            version: 0,
            style: defaultStyle,
            styleSLD: ""
        }));

        geoExplorerDispatch(setMapLayers({ layers: mapLayers }));
    }, [visualization, geoExplorerDispatch]);

    return null;
};
