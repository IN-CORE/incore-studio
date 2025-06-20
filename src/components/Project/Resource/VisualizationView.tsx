import React, { useEffect, useState } from "react";
import { Modal, ModalDialog, ModalClose, Box, Typography } from "@mui/joy";
import { getHeaders, getOidcUser, mapIncoreDatasetToGeoExplorerDataset, parseDateTime } from "@app/utils";

import { GeoExplorer, GeoExplorerConfig, GeoExplorerProvider } from "@ncsa/geo-explorer";
import "@ncsa/geo-explorer/index.css";

import { CustomDataInventory } from "@app/components/Map/CustomDataInventory";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import axios from "axios";
import config from "@app/app.config";
import { Dataset as GeoExplorerDataset } from "@ncsa/geo-explorer/dist/types";

interface VisualizationViewProps {
    visualization: Visualization;
    open: boolean;
    onClose: () => void;
}

export const VisualizationView: React.FC<VisualizationViewProps> = ({ visualization, open, onClose }) => {
    const [geoExplorerLayers, setGeoExplorerLayers] = useState<GeoExplorerDataset[]>([]);

    const datasets = useSelector((state: RootState) => state.project.projectDatasets);
    const hazards = useSelector((state: RootState) => state.project.projectHazards);

    useEffect(() => {
        const fetchAndBuildLayers = async () => {
            const datasetIdsFromHazards = hazards
                .flatMap((hazard) => hazard.hazardDatasets || [])
                .map((ds) => ds.datasetId);

            const datasetIdsFromProject = datasets
                .filter((ds) => ds.format === "shapefile" || (ds.sourceDataset && ds.sourceDataset.trim() !== ""))
                .map((ds) => ds.id);

            const allDatasetIds = Array.from(new Set([...datasetIdsFromProject, ...datasetIdsFromHazards]));

            const datasetResponses = await Promise.all(
                allDatasetIds.map((id) =>
                    axios
                        .get(`${config.dataService}/${id}`, { headers: getHeaders() })
                        .then((res) => res.data)
                        .catch(() => null)
                )
            );

            const validDatasets = datasetResponses.filter(Boolean);

            const mapped = validDatasets.map((ds) =>
                mapIncoreDatasetToGeoExplorerDataset(ds, `${config.hostname}/geoserver`)
            );

            setGeoExplorerLayers(mapped);
        };

        fetchAndBuildLayers();
    }, [hazards, datasets]);

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog layout="fullscreen" size="lg" sx={{ backgroundColor: "#fff" }}>
                <Box sx={{ padding: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography level="h4" fontWeight="bold">
                            {visualization?.name}
                        </Typography>
                        <ModalClose />
                    </Box>
                    <Typography level="body-sm">{visualization.date && parseDateTime(visualization?.date)}</Typography>
                    {visualization.description && (
                        <Typography level="body-md" sx={{ mt: 1 }}>
                            {visualization.description}
                        </Typography>
                    )}
                </Box>
                <Box>
                    {visualization.layers && (
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
                                    simple_layers: geoExplorerLayers, // set in the custom layer list component
                                    temporal_layers: []
                                } as GeoExplorerConfig
                            }
                            accessToken={getOidcUser()?.access_token}
                            isProtectedResource={(url) => /geoserver/.test(url)}
                            components={{
                                DataInventory: CustomDataInventory
                            }}
                        >
                            <Box sx={{ height: 800, position: "relative", overflow: "hidden", my: "20px" }}>
                                <GeoExplorer />
                            </Box>
                        </GeoExplorerProvider>
                    )}
                </Box>
            </ModalDialog>
        </Modal>
    );
};
