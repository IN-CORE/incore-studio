import React from "react";
import { Modal, ModalDialog, ModalClose, Box, Typography } from "@mui/joy";
import { getOidcUser, parseDateTime } from "@app/utils";
import config from "@app/app.config";

import { GeoExplorer, GeoExplorerConfig, GeoExplorerProvider } from "@ncsa/geo-explorer";
import "@ncsa/geo-explorer/index.css";

interface VisualizationViewProps {
    visualization: Visualization;
    open: boolean;
    onClose: () => void;
}

export const VisualizationView: React.FC<VisualizationViewProps> = ({ visualization, open, onClose }) => {
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
                                    simple_layers: visualization.layers.map((layer) => ({
                                        layer_id: layer.layerId,
                                        layer_type: "polygon",
                                        display_name: layer.layerId,
                                        description: layer.layerId,
                                        timestamps: [],
                                        default_style_name: layer.styleName,
                                        ogc_service_url: `${config.hostname}/geoserver`,
                                        labels: {
                                            dataset_category: "power"
                                        }
                                    })),
                                    temporal_layers: []
                                } as GeoExplorerConfig
                            }
                            accessToken={getOidcUser()?.access_token}
                            isProtectedResource={(url) => /geoserver/.test(url)}
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
