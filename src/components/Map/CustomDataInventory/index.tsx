import { Box, Tab, Tabs } from "@mui/material";
import React, { useState } from "react";

import { useImplementation } from "@ncsa/geo-explorer";
import { DatabaseHeavy } from "@app/icons/DatabaseHeavy";
import { DatasetLayerList } from "@app/components/Map/CustomDataInventory/DatasetLayerList";
import { HazardLayerList } from "@app/components/Map/CustomDataInventory/HazardLayerList";

type CustomDataInventoryProps = {
    visualization: Visualization;
};

export const CustomDataInventory = ({ visualization }: CustomDataInventoryProps) => {
    const { SidebarSection } = useImplementation();

    const [tabIndex, setTabIndex] = useState(0);

    return (
        <SidebarSection icon={<DatabaseHeavy size={16} />} weight={2} title="Data Inventory">
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
