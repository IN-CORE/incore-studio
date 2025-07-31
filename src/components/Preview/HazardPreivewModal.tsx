import React, { useEffect, useState } from "react";

import { Modal, ModalDialog, ModalClose, Box, Typography } from "@mui/joy";

import config from "@app/app.config";
import {
    addLayer,
    GeoExplorer,
    GeoExplorerConfig,
    GeoExplorerProvider,
    setShowLayerSettings,
    setSidebarOpen
} from "@ncsa/geo-explorer";
import { getHeaders, getOidcUser, mapIncoreDatasetToGeoExplorerDataset } from "@app/utils";
import axios from "axios";
import { Dataset as GeoExplorerDataset } from "@ncsa/geo-explorer/dist/types";

interface HazardPreviewModalProps {
    open: boolean;
    onClose: () => void;
    hazard?: Hazard | null;
}

export const HazardPreviewModal: React.FC<HazardPreviewModalProps> = ({ open, onClose, hazard }) => {
    if (!hazard) {
        return null;
    }
    const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    };

    const [hazardDatasets, setHazardDatasets] = useState<Dataset[]>([]);
    const [geoExplorerLayers, setGeoExplorerLayers] = useState<GeoExplorerDataset[]>([]);

    useEffect(() => {
        const fetchAndBuildLayers = async () => {
            const datasetResponses = await Promise.all(
                hazard.hazardDatasets.map((hazardDataset) =>
                    axios
                        .get(`${config.dataService}/${hazardDataset.datasetId}`, { headers: getHeaders() })
                        .then((res) => res.data)
                        .catch(() => null)
                )
            );

            const validDatasets = datasetResponses.filter(Boolean);

            const mapped = validDatasets.map((ds) =>
                mapIncoreDatasetToGeoExplorerDataset(ds, `${config.hostname}/geoserver`)
            );

            setGeoExplorerLayers(mapped);
            setHazardDatasets(validDatasets);
        };

        fetchAndBuildLayers();
    }, [hazard]);

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog layout="fullscreen" size="lg" sx={{ backgroundColor: "#fff", padding: 10, height: "100%" }}>
                <Box sx={{ padding: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography level="h4" fontWeight="bold">
                            {hazard?.name}
                        </Typography>
                        <ModalClose />
                    </Box>
                    <Typography level="body-sm">{hazard?.description}</Typography>
                    <Typography level="body-sm">
                        {new Intl.DateTimeFormat("en-US", options).format(new Date(hazard?.date))}
                    </Typography>
                </Box>
                <GeoExplorerProvider
                    config={
                        {
                            basemaps: [
                                {
                                    layer_id: "OSM",
                                    display_name: "OpenStreetMap",
                                    tile_url_template: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                                    thumbnail_url: "https://a.tile.openstreetmap.org/0/0/0.png"
                                }
                            ],
                            simple_layers: geoExplorerLayers,
                            temporal_layers: [],
                            // naive approach to center the map on the first layer's bounding box
                            mapConfig: {
                                boundingBox:
                                    hazardDatasets.length > 0
                                        ? [
                                              Math.min(...hazardDatasets.map((ds) => ds.boundingBox?.[0] ?? 0)),
                                              Math.min(...hazardDatasets.map((ds) => ds.boundingBox?.[1] ?? 0)),
                                              Math.max(...hazardDatasets.map((ds) => ds.boundingBox?.[2] ?? 0)),
                                              Math.max(...hazardDatasets.map((ds) => ds.boundingBox?.[3] ?? 0))
                                          ]
                                        : (config.DEFAULT_MAP_BOUNDS as [number, number, number, number])
                            }
                        } as GeoExplorerConfig
                    }
                    accessToken={getOidcUser()?.access_token}
                    isProtectedResource={(url) => /geoserver/.test(url)}
                    components={{
                        DataInventory: () => null
                    }}
                    onReady={({ store }) => {
                        hazardDatasets.forEach((hazardDataset) => {
                            store.dispatch(addLayer({ layer_id: hazardDataset.id }));
                        });
                        // reset to default state
                        store.dispatch(setShowLayerSettings({ show: false }));
                        store.dispatch(setSidebarOpen({ open: true }));
                    }}
                >
                    <GeoExplorer key={hazardDatasets.map((ds) => ds.id).join(",")} />
                </GeoExplorerProvider>
            </ModalDialog>
        </Modal>
    );
};
