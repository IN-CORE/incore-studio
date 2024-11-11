import { Card, Typography, Box, CardContent, Chip, Dropdown, IconButton, Menu, MenuButton, MenuItem } from "@mui/joy";
import { Grid } from "@mui/material";
import React, { useState } from "react";
import { parseDateTime } from "@app/utils";
import { MapThumbnail } from "@app/components/Project/Thumbnails/MapThumbnail";
import { TableThumbnail } from "@app/components/Project/Thumbnails/TableThumbnail";
import { WorkflowThumbnail } from "@app/components/Project/Thumbnails/WorkflowThumbnail";
import { DefaultThumbnail } from "@app/components/Project/Thumbnails/DefaultThumbnail";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IncoreDialog } from "@app/components/IncoreDialog";
import { VisualizationDialog } from "@app/components/Project/Resource/VisualizationDialog";

function isHazard(resource: any): resource is Hazard {
    return "hazardDatasets" in resource;
}

function isVisualization(resource: any): resource is Visualization {
    return "layers" in resource;
}

function isDataset(resource: any): resource is Dataset {
    return "dataType" in resource;
}

function isDatasetTable(resource: any): resource is Dataset {
    return "dataType" in resource && "format" in resource && (resource.format === "table" || resource.format === "csv");
}

function isDatasetMap(resource: any): resource is Dataset {
    return (
        "dataType" in resource && "format" in resource && (resource.format === "shapefile" || resource.format === "tif")
    );
}

function isWorkflow(resource: any): resource is Workflow {
    return "type" in resource && (resource.type === "workflow" || resource.type === "execution");
}

export const ResourceCards: React.FC<{
    resources: Hazard[] | Visualization[] | Dataset[] | Workflow[];
    cardPerRow?: number;
    deleteFunc?: any;
    addVisualizationFunc?: any;
    projectId: string;
}> = ({ resources, cardPerRow, deleteFunc, addVisualizationFunc, projectId }) => {
    const [selectedItem, setSelectedItem] = useState<Hazard | Visualization | Dataset | Workflow | null>(null);
    const handleOpenMenu = (item: Hazard | Visualization | Dataset | Workflow) => {
        setSelectedItem(item);
    };

    const handleCloseMenu = () => {
        setSelectedItem(null);
    };

    // delete
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const handleCloseDialog = () => {
        setOpenDeleteDialog(false);
    };
    const handleDelete = () => {
        if (setSelectedItem && projectId) {
            deleteFunc(projectId, selectedItem);
            setSelectedItem(null);
        }
        setOpenDeleteDialog(false);
    };

    // add to visualization
    const [openVisDialog, setOpenVisDialog] = useState(false);
    const handleCloseVisDialog = () => {
        setOpenVisDialog(false);
    };
    const handleAddVisualization = () => {
        if (selectedItem && projectId) {
            addVisualizationFunc(projectId, selectedItem);
            setSelectedItem(null);
        }
        setOpenVisDialog(false);
    };

    return (
        <Grid container spacing={3}>
            {resources.map((resource) => (
                <Grid
                    key={resource.id}
                    xs={12}
                    sm={12}
                    md={Math.ceil(12 / (cardPerRow ?? 2))}
                    lg={Math.ceil(12 / (cardPerRow ?? 2))}
                >
                    <Card
                        variant="plain"
                        sx={{
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            height: "100%",
                            padding: 0
                        }}
                    >
                        {/* Menu Icon on Top-Right */}
                        <Dropdown>
                            <MenuButton
                                slots={{ root: IconButton }}
                                slotProps={{
                                    root: {
                                        sx: { position: "absolute", top: 8, right: -10, zIndex: 1000 },
                                        variant: "plain",
                                        color: "neutral"
                                    }
                                }}
                                onClick={() => handleOpenMenu(resource)}
                            >
                                <MoreVertIcon />
                            </MenuButton>
                            <Menu onClose={handleCloseMenu} placement="bottom-start">
                                <MenuItem
                                    onClick={() => {
                                        setOpenDeleteDialog(true);
                                    }}
                                >
                                    Delete
                                </MenuItem>
                                {addVisualizationFunc && (
                                    <MenuItem
                                        onClick={() => {
                                            setOpenVisDialog(true);
                                        }}
                                    >
                                        Add to Visualization
                                    </MenuItem>
                                )}
                            </Menu>
                        </Dropdown>
                        <VisualizationDialog
                            projectId={projectId}
                            open={openVisDialog}
                            onClose={handleCloseVisDialog}
                            onAddVisualization={handleAddVisualization}
                        />
                        <IncoreDialog
                            open={openDeleteDialog}
                            onClose={handleCloseDialog}
                            onAction={handleDelete}
                            message="Are you sure you want to delete this item? This action cannot be undone."
                            dialogTitle="Confirm Deletion"
                            actionButtonName="Delete"
                        />
                        <CardContent>
                            {isHazard(resource) ? (
                                <MapThumbnail />
                            ) : isVisualization(resource) ? (
                                <MapThumbnail />
                            ) : isDatasetTable(resource) ? (
                                <TableThumbnail />
                            ) : isDatasetMap(resource) ? (
                                <MapThumbnail />
                            ) : isWorkflow(resource) ? (
                                <WorkflowThumbnail />
                            ) : (
                                <DefaultThumbnail />
                            )}
                            <Box sx={{ p: 1, flexGrow: 1, height: 80, overflow: "auto" }}>
                                <Typography level="body-sm" mb={1} textColor="primary.main">
                                    {isDataset(resource) || isWorkflow(resource)
                                        ? resource.title
                                        : resource.name || "Name not" + " provided"}
                                </Typography>
                                <Typography level="body-sm">
                                    {resource.description || "Description not provided"}
                                </Typography>
                            </Box>
                        </CardContent>
                        <Box
                            sx={{
                                mt: "auto",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            {/* Pill for resource type */}
                            <Chip size="sm" sx={{ borderRadius: 0 }}>
                                {isDataset(resource) ? resource.format : resource.type || "Type not provided"}
                            </Chip>

                            {/* Date on the right */}
                            <Typography level="body-sm">
                                {resource.date ? parseDateTime(resource.date) : "Date not provided"}
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};
