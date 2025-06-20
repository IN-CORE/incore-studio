import React from "react";
import { Modal, ModalDialog, ModalClose, Box, Typography } from "@mui/joy";
import { getOidcUser, parseDateTime } from "@app/utils";

import { GeoExplorer, GeoExplorerConfig, GeoExplorerProvider } from "@ncsa/geo-explorer";
import "@ncsa/geo-explorer/index.css";

import { CustomDataInventory } from "@app/components/Map/CustomDataInventory";

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
                                    simple_layers: [],
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
