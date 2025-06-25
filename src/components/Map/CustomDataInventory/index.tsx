import { Box, Tab, Tabs, Button } from "@mui/material";
import React, { useState } from "react";

import { RootState, useImplementation, useSelector } from "@ncsa/geo-explorer";
import { DatabaseHeavy } from "@app/icons/DatabaseHeavy";
import { DatasetLayerList } from "@app/components/Map/CustomDataInventory/DatasetLayerList";
import { HazardLayerList } from "@app/components/Map/CustomDataInventory/HazardLayerList";
import { useParams } from "react-router-dom";
import { useAppDispatch } from "@app/store/hooks";
import { patchVisualization } from "@app/reducer/projectSlice";

export function createCustomDataInventory(visualization: Visualization) {
    return function CustomDataInventory() {
        const { id } = useParams<{ id: string }>();

        const { SidebarSection } = useImplementation();

        const [tabIndex, setTabIndex] = useState(0);
        const [isEditing, setIsEditing] = useState(false);

        const mapLayers = useSelector((state: RootState) => state.explore.mapLayers);
        const appDispatch = useAppDispatch();

        const getLayerOrder = (): string[] => {
            return mapLayers.map((layer) => layer.data.layer_id);
        };

        const getLayers = (): IncoreLayer[] => {
            return mapLayers.map((layer) => ({
                workspace: "incore", // adjust if dynamic
                layerId: layer.data.layer_id,
                layerType: layer.data.layer_type,
                datasetCategoryType: layer.data.labels.dataset_category,
                displayName: layer.data.display_name,
                description: layer.data.description,
                unit: layer.data.unit
            }));
        };

        const handleToggle = async () => {
            if (isEditing) {
                if (!id) {
                    console.error("Project ID is not defined. Cannot patch visualization.");
                    return;
                }
                try {
                    const layerOrder: string[] = getLayerOrder(); // replace with your actual logic
                    const layers: IncoreLayer[] = getLayers(); // replace with your actual logic

                    const visualizationId = visualization.id;

                    await appDispatch(
                        patchVisualization({
                            projectId: id,
                            visualizationId,
                            patchData: {
                                layerOrder: JSON.stringify(layerOrder),
                                layers: JSON.stringify(layers)
                            }
                        })
                    );
                } catch (error) {
                    console.error("Failed to patch visualization", error);
                }
            }

            setIsEditing(!isEditing);
        };

        return (
            <>
                <Button onClick={handleToggle} variant={isEditing ? "contained" : "text"} color="primary">
                    {isEditing ? "Save to Visualization" : "Edit to Add to Visualization"}
                </Button>
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
                            {/* {tabIndex === 0 && <DatasetLayerList visualization={visualization} />} */}
                            {tabIndex === 0 && <DatasetLayerList />}
                            {/* {tabIndex === 1 && <HazardLayerList visualization={visualization} />} */}
                            {tabIndex === 1 && <HazardLayerList />}
                        </Box>
                    </SidebarSection>
                )}
            </>
        );
    };
}
