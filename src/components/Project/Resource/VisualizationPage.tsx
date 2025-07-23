import React, { useEffect, useState } from "react";
import { Box, Typography, Container, Grid } from "@mui/joy";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import {
    deleteProjectVisualizations,
    getProject,
    getProjectVisualizations,
    setSelectedVisualization
} from "@app/reducer/projectSlice";
import { ProjectBreadcrumb } from "@app/components/Project/ProjectBreadcrumb";
import { ProjectHeader } from "@app/components/Project/ProjectHeader";
import { ResourceTable } from "@app/components/Project/Resource/ResourceTable";
import { Pagination } from "@app/components/Home/Pagination";
import ResourceFilterBar from "@app/components/Project/Resource/ResourceFilterBar";
import Divider from "@mui/joy/Divider";
import { ResourceCards } from "@app/components/Project/Resource/ResourceCards";
import { ProjectSidebar } from "@app/components/Project/ProjectSidebar";
import { CreateVisualizationDialog } from "@app/components/Project/Resource/VisualizationDialog";
import { VisualizationView } from "@app/components/Project/Resource/VisualizationView";
import { useAppDispatch } from "@app/store/hooks";

import VisualizationIcon from "@mui/icons-material/Map";
import Snackbar from "@mui/joy/Snackbar";
import { IncoreDialog } from "@app/components/IncoreDialog";
import config from "@app/app.config";
import {
    addLayer,
    GeoExplorerConfig,
    GeoExplorerProvider, selectMapLayer,
    setLayerStyleName, setShowLayerSettings, setSidebarOpen,
    toggleVisibility
} from "@ncsa/geo-explorer";
import { getHeaders, getOidcUser, mapIncoreDatasetToGeoExplorerDataset } from "@app/utils";
import { CustomDataInventory } from "@app/components/Map/CustomDataInventory";
import { Dataset as GeoExplorerDataset } from "@ncsa/geo-explorer/dist/types";
import axios from "axios";

const VisualizationPage = (): JSX.Element => {
    const { id } = useParams(); // Get projectId from the URL path
    const appDispatch = useAppDispatch();

    // Redux state
    const project = useSelector((state: RootState) => state.project.project);
    const deletedVisualizationIds = useSelector((state: RootState) => state.project.deletedVisualizationIds);

    // Pagination states
    const [visualizationPageNumber, setVisualizationPageNumber] = useState(1);
    const visualizationNextPage = () => {
        setVisualizationPageNumber((prevPage) => prevPage + 1);
    };
    const visualizationPreviousPage = () => {
        setVisualizationPageNumber((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
    };

    useEffect(() => {
        if (id) {
            appDispatch(getProject(id));
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            appDispatch(
                getProjectVisualizations({ projectId: id, skip: (visualizationPageNumber - 1) * 10, limit: 10 })
            );
        }
    }, [id, visualizationPageNumber, deletedVisualizationIds]);

    const onApplyFilterSort = (params: {
        filters: Record<string, string | number>;
        sortBy: string;
        order: string
    }) => {
        if (id) {
            const { filters, sortBy, order } = params;

            // Dispatch the Redux Thunk with updated parameters
            appDispatch(
                getProjectVisualizations({
                    projectId: id,
                    skip: (visualizationPageNumber - 1) * 10, // Pagination logic
                    limit: 10, // Number of items per page
                    filters, // Filters applied
                    sortBy, // Sorting field
                    order // Sort order: "asc" or "desc"
                })
            );
        }
    };

    // Table view vs Card view
    const [isTableView, setIsTableView] = useState(true); // Toggle state for view mode
    const onViewChangeClick = () => {
        setIsTableView((prev) => !prev); // Toggle between table and card view
    };

    const projectVisualizations = useSelector((state: RootState) => state.project.projectVisualizations);

    // delete function
    const deleteVisualizationFunc = (projectId: string, visualization: Visualization) => {
        appDispatch(deleteProjectVisualizations({ projectId, visualizationIds: [visualization.id] }));
    };

    // create visualization
    const [openCreateVisDialog, setOpenCreateVisDialog] = useState(false);
    const handleCloseCreateVisDialog = () => {
        setOpenCreateVisDialog(false);
    };
    const onCreateClick = () => {
        setOpenCreateVisDialog(true);
    };

    // View visualization
    const [openVisualizationView, setOpenVisualizationView] = useState(false);
    const handleCloseVisualizationView = () => {
        setOpenVisualizationView(false);
    };
    // Populate the geo explorer provider
    const [geoExplorerLayers, setGeoExplorerLayers] = useState<GeoExplorerDataset[]>([]);
    const datasets = useSelector((state: RootState) => state.project.projectDatasets);
    const hazards = useSelector((state: RootState) => state.project.projectHazards);
    const visualization = useSelector((state: RootState) => state.project.selectedVisualization);

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

    // snackbar
    const [snackbarOpen, setSnackbarOpen] = React.useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState<string>("");
    const [snackbarColor, setSnackbarColor] = React.useState<"success" | "danger" | "warning" | "neutral">("neutral");
    const success = useSelector((state: RootState) => state.project.success);
    const error = useSelector((state: RootState) => state.project.error);
    React.useEffect(() => {
        if (error) {
            setSnackbarMessage(`Error: ${error}`);
            setSnackbarColor("danger");
            setSnackbarOpen(true);
        } else if (success) {
            setSnackbarMessage(success);
            setSnackbarColor("success");
            setSnackbarOpen(true);
        }
    }, [success, error]);

    // batch delete
    const [selectedVisualizations, setSelectedVisualizations] = useState<Visualization[]>([]);
    const [openBatchDeleteDialog, setOpenBatchDeleteDialog] = useState(false);
    const handleBatchDelete = async () => {
        if (project?.id && selectedVisualizations.length > 0) {
            await appDispatch(
                deleteProjectVisualizations({
                    projectId: project.id,
                    visualizationIds: selectedVisualizations.map((w) => w.id)
                })
            );
            setSelectedVisualizations([]);
        }
        setOpenBatchDeleteDialog(false);
    };

    return (
        <Container sx={{ display: "flex", flexDirection: "column", height: "100vh" }} maxWidth="xl">
            <IncoreDialog
                open={openBatchDeleteDialog}
                onClose={() => {
                    setOpenBatchDeleteDialog(false);
                }}
                onAction={handleBatchDelete}
                message="Are you sure you want to delete the selected items? This action cannot be undone."
                dialogTitle="Confirm Deletion"
                actionButtonName="Batch Delete"
            />
            <Box sx={{ flexShrink: 0 }} mt={5}>
                {!project ? (
                    <Typography>Loading...</Typography>
                ) : (
                    <>
                        {/* Header Section */}
                        <ProjectBreadcrumb
                            project={{ href: `/project/${project.id}`, label: project.name }}
                            resource="Visualizations"
                        />
                        <ProjectHeader project={project} />
                        <Divider />
                        <Grid container spacing={2} mt={3} ml={0}>
                            <Grid sm={2}>
                                <ProjectSidebar id={project.id} />
                            </Grid>
                            <Grid sm={10}>
                                <ResourceFilterBar
                                    title="Visualizations"
                                    icon={<VisualizationIcon sx={{ verticalAlign: "middle" }} />}
                                    filters={{ type: ["MAP", "CHART", "TABLE"] }}
                                    sortOptions={["date", "type", "name", "id"]}
                                    onApply={onApplyFilterSort}
                                    onCreateClick={onCreateClick}
                                    onViewChangeClick={onViewChangeClick}
                                    isTableView={isTableView}
                                    createLabel="Create Visualization"
                                    selectedItemsCount={selectedVisualizations.length}
                                    onBatchDeleteClick={() => setOpenBatchDeleteDialog(true)}
                                    onSelectionChange={(selected) =>
                                        setSelectedVisualizations(selected as Visualization[])
                                    }
                                />
                                <CreateVisualizationDialog
                                    projectId={project.id}
                                    open={openCreateVisDialog}
                                    onClose={handleCloseCreateVisDialog}
                                />
                                <GeoExplorerProvider
                                    config={
                                        {
                                            basemaps: [
                                                {
                                                    layer_id: "OSM",
                                                    display_name: "OpenStreetMap",
                                                    tile_url_template:
                                                        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                                                    thumbnail_url: "https://a.tile.openstreetmap.org/0/0/0.png"
                                                }
                                            ],
                                            simple_layers: geoExplorerLayers, // set in the custom layer list component
                                            temporal_layers: [],
                                            // naive approach to center the map on the visualization bounding box
                                            mapConfig: {
                                                boundingBox: visualization?.boundingBox ? visualization?.boundingBox : (config.DEFAULT_MAP_BOUNDS as [number, number, number, number])
                                            }
                                        } as GeoExplorerConfig
                                    }
                                    accessToken={getOidcUser()?.access_token}
                                    isProtectedResource={(url) => /geoserver/.test(url)}
                                    components={{
                                        DataInventory: CustomDataInventory
                                    }}
                                    onReady={({ store }) => {
                                        // reset to default state
                                        store.dispatch(selectMapLayer({ layer_id: null}));
                                        store.dispatch(setShowLayerSettings({ show: false }));
                                        store.dispatch(setSidebarOpen({ open: true }));
                                        if (
                                            Array.isArray(visualization?.layers) &&
                                            Array.isArray(visualization?.layerOrder)
                                        ) {
                                            const layerMap = new Map(
                                                visualization.layers.map((layer) => [layer.layerId, layer])
                                            );
                                            [...visualization.layerOrder].reverse().forEach((layerId) => {
                                                const layer = layerMap.get(layerId);
                                                if (layer) {
                                                    store.dispatch(addLayer({ layer_id: layer.layerId }));
                                                    if (!layer.visible)
                                                        store.dispatch(toggleVisibility({ layer_id: layer.layerId }));
                                                    if (layer.styleName) {
                                                        store.dispatch(
                                                            store.dispatch(
                                                                setLayerStyleName({
                                                                    layer_id: layer.layerId,
                                                                    style_name: layer.styleName
                                                                })
                                                            )
                                                        );
                                                    }
                                                }
                                            });
                                        }
                                    }}
                                >
                                    <VisualizationView
                                        open={openVisualizationView}
                                        onClose={handleCloseVisualizationView}
                                    />
                                </GeoExplorerProvider>
                                {isTableView ? (
                                    <ResourceTable
                                        columns={["name", "description", "type", "date"]}
                                        data={projectVisualizations}
                                        projectId={project.id}
                                        deleteFunc={deleteVisualizationFunc}
                                        viewFunc={(visualization: Visualization) => {
                                            appDispatch(setSelectedVisualization(visualization.id));
                                            setOpenVisualizationView(true);
                                        }}
                                        onSelectionChange={(selected) =>
                                            setSelectedVisualizations(selected as Visualization[])
                                        }
                                        selectedItems={selectedVisualizations}
                                    />
                                ) : (
                                    <ResourceCards
                                        resources={projectVisualizations}
                                        cardPerRow={4}
                                        projectId={project.id}
                                        deleteFunc={deleteVisualizationFunc}
                                        viewFunc={(visualization: Visualization) => {
                                            appDispatch(setSelectedVisualization(visualization.id));
                                            setOpenVisualizationView(true);
                                        }}
                                        onSelectionChange={(selected) =>
                                            setSelectedVisualizations(selected as Visualization[])
                                        }
                                        selectedItems={selectedVisualizations}
                                    />
                                )}
                                <Box mt={4} display="flex" justifyContent="center">
                                    <Pagination
                                        pageNumber={visualizationPageNumber}
                                        dataLength={projectVisualizations.length}
                                        dataPerPage={10}
                                        previous={visualizationPreviousPage}
                                        next={visualizationNextPage}
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Box>
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                open={snackbarOpen}
                onClose={() => {
                    setSnackbarOpen(false);
                    setSnackbarMessage("");
                }}
                variant="outlined"
                color={snackbarColor}
                autoHideDuration={2000}
            >
                {snackbarMessage}
            </Snackbar>
        </Container>
    );
};

export default VisualizationPage;
