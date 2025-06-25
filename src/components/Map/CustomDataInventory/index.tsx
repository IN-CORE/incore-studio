import { Box, Tab, Tabs, Button } from "@mui/material";
import React, { useState } from "react";

import { useImplementation } from "@ncsa/geo-explorer";
import { DatabaseHeavy } from "@app/icons/DatabaseHeavy";
import { DatasetLayerList } from "@app/components/Map/CustomDataInventory/DatasetLayerList";
import { HazardLayerList } from "@app/components/Map/CustomDataInventory/HazardLayerList";

export function CustomDataInventory() {
    const { SidebarSection } = useImplementation();

    const [tabIndex, setTabIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);

    const handleToggle = async () => {
        setIsEditing(!isEditing);
    };

    return (
        <>
            {!isEditing && (
                <Button onClick={handleToggle} variant={isEditing ? "contained" : "text"} color="primary">
                    Add New Layers to Visualization
                </Button>
            )}
            {isEditing && (
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
                        {tabIndex === 0 && <DatasetLayerList />}
                        {tabIndex === 1 && <HazardLayerList />}
                    </Box>
                </SidebarSection>
            )}
        </>
    );
}
