import {
    Card,
    Link,
    Typography,
    Box,
    CardContent,
    Chip,
    Dropdown,
    IconButton,
    Menu,
    MenuButton,
    MenuItem,
    Grid
} from "@mui/joy";
import { Link as RouterLink } from "react-router-dom";
import React, { useState } from "react";
import { parseDateTime } from "@app/utils";
import { MapThumbnail } from "@app/components/Project/Thumbnails/MapThumbnail";
import { TableThumbnail } from "@app/components/Project/Thumbnails/TableThumbnail";
import { WorkflowThumbnail } from "@app/components/Project/Thumbnails/WorkflowThumbnail";
import { DefaultThumbnail } from "@app/components/Project/Thumbnails/DefaultThumbnail";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IncoreDialog } from "@app/components/IncoreDialog";
import { VisualizationDialog } from "@app/components/Project/Resource/VisualizationDialog";

import CheckIcon from "@mui/icons-material/Check";

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
    viewFunc?: any;
    projectId: string;
    onSelectionChange?: (selectedItems: (Hazard | Visualization | Dataset | Workflow)[]) => void;
}> = ({ resources, cardPerRow, deleteFunc, addVisualizationFunc, projectId, viewFunc, onSelectionChange }) => {
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
    const handleAddVisualization = (visualizationId: string, styleName?: string) => {
        if (selectedItem && projectId) {
            addVisualizationFunc(projectId, visualizationId, selectedItem, styleName);
            setSelectedItem(null);
        }
        setOpenVisDialog(false);
    };

    // batch selection
    const [selectedItems, setSelectedItems] = useState<(Hazard | Visualization | Dataset | Workflow)[]>([]);

    const toggleSelection = (item: Hazard | Visualization | Dataset | Workflow) => {
        setSelectedItems((prev) => {
            const exists = prev.find((i) => i.id === item.id);
            const updated = exists ? prev.filter((i) => i.id !== item.id) : [...prev, item];
            onSelectionChange?.(updated); // Notify parent
            return updated;
        });
    };

    const isSelected = (item: Hazard | Visualization | Dataset | Workflow) => {
        return selectedItems.some((i) => i.id === item.id);
    };

    return (
        <Grid container spacing={3}>
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
            {resources.map((resource) => {
                const selected = isSelected(resource);
                return (
                    <Grid
                        key={resource.id}
                        xs={12}
                        sm={12}
                        md={Math.ceil(12 / (cardPerRow ?? 2))}
                        lg={Math.ceil(12 / (cardPerRow ?? 2))}
                    >
                        <Box sx={{ position: "relative", height: "100%" }}>
                            {/* Selection overlay */}
                            {selected && (
                                <Box
                                    sx={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        zIndex: 10,
                                        borderRadius: "8px",
                                        pointerEvents: "none"
                                    }}
                                >
                                    <CheckIcon sx={{ color: "neutral.info", fontSize: 48 }} />
                                </Box>
                            )}

                            {/* Card */}
                            <Card
                                variant="plain"
                                onClick={() => toggleSelection(resource)}
                                sx={{
                                    position: "relative",
                                    display: "flex",
                                    flexDirection: "column",
                                    height: "100%",
                                    padding: "1em",
                                    border: selected ? "2px solid #42526E" : "none",
                                    cursor: "pointer",
                                    opacity: selected ? 0.7 : 1
                                }}
                            >
                                {/* Menu Icon */}
                                <Dropdown>
                                    <MenuButton
                                        onClick={(e) => {
                                            e.stopPropagation(); // prevent selection on menu click
                                            handleOpenMenu(resource);
                                        }}
                                        slots={{ root: IconButton }}
                                        slotProps={{
                                            root: {
                                                sx: { position: "absolute", top: 8, right: -10, zIndex: 15 },
                                                variant: "plain",
                                                color: "neutral"
                                            }
                                        }}
                                    >
                                        <MoreVertIcon />
                                    </MenuButton>
                                    <Menu onClose={handleCloseMenu} placement="bottom-start">
                                        {isWorkflow(resource) && (
                                            <MenuItem>
                                                <Link
                                                    component={RouterLink}
                                                    textColor="primary.main"
                                                    underline="none"
                                                    to={`/project/${projectId}/workflows/${resource.id}`}
                                                >
                                                    Open
                                                </Link>
                                            </MenuItem>
                                        )}
                                        {addVisualizationFunc && (
                                            <MenuItem
                                                onClick={() => {
                                                    setOpenVisDialog(true);
                                                }}
                                            >
                                                Add to Visualization
                                            </MenuItem>
                                        )}
                                        {viewFunc && (
                                            <MenuItem
                                                onClick={() => {
                                                    viewFunc(resource);
                                                }}
                                            >
                                                View
                                            </MenuItem>
                                        )}
                                        <MenuItem
                                            onClick={() => {
                                                setOpenDeleteDialog(true);
                                            }}
                                        >
                                            Delete
                                        </MenuItem>
                                    </Menu>
                                </Dropdown>

                                {/* Card Content */}
                                <CardContent>
                                    <Box>
                                        {isHazard(resource) || isVisualization(resource) || isDatasetMap(resource) ? (
                                            <MapThumbnail />
                                        ) : isDatasetTable(resource) ? (
                                            <TableThumbnail />
                                        ) : isWorkflow(resource) ? (
                                            <WorkflowThumbnail />
                                        ) : (
                                            <DefaultThumbnail />
                                        )}
                                    </Box>
                                    <Box sx={{ p: 1, flexGrow: 1, height: 80, overflow: "auto" }}>
                                        <Typography level="body-sm" mb={1} textColor="primary.main">
                                            {isDataset(resource) || isWorkflow(resource)
                                                ? resource.title
                                                : resource.name || "Name not provided"}
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
                                    <Chip size="sm" sx={{ borderRadius: 0 }}>
                                        {isDataset(resource) ? resource.format : resource.type || "Type not provided"}
                                    </Chip>
                                    <Typography level="body-sm">
                                        {resource.date ? parseDateTime(resource.date) : "Date not provided"}
                                    </Typography>
                                </Box>
                            </Card>
                        </Box>
                    </Grid>
                );
            })}
        </Grid>
    );
};
