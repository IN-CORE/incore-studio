import { FilterAltOutlined, Search } from "@mui/icons-material";
import { Box, IconButton, Tab, Tabs } from "@mui/material";
import React, { useEffect, useState } from "react";

import { addLayer, useDispatch, useImplementation } from "@ncsa/geo-explorer";
import { DatabaseHeavy } from "@app/icons/DatabaseHeavy";
import { DatasetLayerList } from "@app/components/Map/CustomDataInventory/DatasetLayerList";
import { HazardLayerList } from "@app/components/Map/CustomDataInventory/HazardLayerList";

type CustomDataInventoryProps = {
    visualization: Visualization;
};

export const CustomDataInventory = ({ visualization }: CustomDataInventoryProps) => {
    const { SidebarSection } = useImplementation();

    const [tabIndex, setTabIndex] = useState(0);

    const geoExplorerDispatch = useDispatch();

    useEffect(() => {
        if (Array.isArray(visualization?.layers)) {
            visualization.layers.forEach((layer) => {
                if (layer?.layerId) {
                    console.log("Adding layer to GeoExplorer:", layer.layerId);
                    geoExplorerDispatch(addLayer({ layer_id: layer.layerId }));
                }
            });
        }
    }, [visualization, geoExplorerDispatch]);

    return (
        <SidebarSection
            icon={<DatabaseHeavy size={16} />}
            weight={2}
            title="Data Inventory"
            extras={
                <Box className="flex flex-row gap-[6px]">
                    <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                        <Search className="text-[#0000008A]" />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                        <FilterAltOutlined className="text-[#0000008A]" />
                    </IconButton>
                </Box>
            }
        >
            <Box className="flex flex-col h-full">
                <Box className="flex-none px-[32px]">
                    <Tabs
                        centered
                        className="w-full"
                        value={tabIndex}
                        onChange={(_, newValue) => setTabIndex(newValue)}
                    >
                        <Tab label="Datasets" className="flex-1 min-w-0 capitalize" />
                        <Tab label="Hazards" className="flex-1 min-w-0 capitalize" />
                    </Tabs>
                </Box>
                {tabIndex === 0 && <DatasetLayerList visualization={visualization} />}
                {tabIndex === 1 && <HazardLayerList visualization={visualization} />}
            </Box>
        </SidebarSection>
    );
};
