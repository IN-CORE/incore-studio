import { Box, Tab, Tabs, Button, Dialog, IconButton } from "@mui/material";
import React, { useState } from "react";

import { DatasetLayerList } from "@app/components/Map/CustomDataInventory/DatasetLayerList";
import { HazardLayerList } from "@app/components/Map/CustomDataInventory/HazardLayerList";
import CloseIcon from "@mui/icons-material/Close";

export const CustomDataInventory = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);

    const handleToggle = async () => {
        setIsEditing(!isEditing);
    };

    return (
        <>
            {!isEditing && (
                <Button
                    onClick={handleToggle}
                    variant={isEditing ? "contained" : "text"}
                    color="primary"
                    sx={{ fontWeight: 800 }}
                >
                    Add New Layers to Visualization
                </Button>
            )}
            <Dialog
                open={isEditing}
                onClose={handleToggle}
                maxWidth={false}
                PaperProps={{
                    sx: {
                        minWidth: 800,
                        width: "50vw",
                        maxHeight: "90vh",
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden"
                    }
                }}
            >
                <IconButton
                    onClick={handleToggle}
                    sx={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
                    aria-label="close"
                >
                    <CloseIcon />
                </IconButton>
                <Box
                    sx={{
                        mt: 5,
                        px: 3,
                        pb: 3,
                        overflowY: "auto",
                        flexGrow: 1
                    }}
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
                        {tabIndex === 0 && <DatasetLayerList />}
                        {tabIndex === 1 && <HazardLayerList />}
                    </Box>
                </Box>
            </Dialog>
        </>
    );
};
