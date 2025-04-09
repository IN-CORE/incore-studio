import React, { useEffect, useState } from "react";
import { Box, Typography, Container, Grid } from "@mui/joy";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import {
    addHazardToProject,
    addLayerToVisualization,
    deleteProjectHazards,
    getProject,
    getProjectHazards
} from "@app/reducer/projectSlice";
import { ProjectBreadcrumb } from "@app/components/Project/ProjectBreadcrumb";
import { ProjectHeader } from "@app/components/Project/ProjectHeader";
import { ResourceTable } from "@app/components/Project/Resource/ResourceTable";
import { Pagination } from "@app/components/Home/Pagination";
import ResourceFilterBar from "@app/components/Project/Resource/ResourceFilterBar";
import Divider from "@mui/joy/Divider";
import { ResourceCards } from "@app/components/Project/Resource/ResourceCards";
import { ProjectSidebar } from "@app/components/Project/ProjectSidebar";
import { useAppDispatch } from "@app/store/hooks";

import HazardIcon from "@mui/icons-material/Storm";
import Snackbar from "@mui/joy/Snackbar";
import { AddFromServiceDialog } from "@app/components/Project/Resource/AddFromServiceDialog";
import { CreateHazardDialog } from "@app/components/Project/Resource/CreateHazardDialog";
import { IncoreDialog } from "@app/components/IncoreDialog";

const HazardPage = (): JSX.Element => {
    const { id } = useParams(); // Get projectId from the URL path
    const appDispatch = useAppDispatch();

    // Redux state
    const project = useSelector((state: RootState) => state.project.project);
    const deletedHazardIds = useSelector((state: RootState) => state.project.deletedHazardIds);

    // Pagination states
    const [hazardPageNumber, setHazardPageNumber] = useState(1);
    const hazardNextPage = () => {
        setHazardPageNumber((prevPage) => prevPage + 1);
    };
    const hazardPreviousPage = () => {
        setHazardPageNumber((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
    };

    useEffect(() => {
        if (id) {
            appDispatch(getProject(id));
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            appDispatch(getProjectHazards({ projectId: id, skip: (hazardPageNumber - 1) * 10, limit: 10 }));
        }
    }, [id, hazardPageNumber, deletedHazardIds]);

    const onApplyFilterSort = (params: { filters: Record<string, string | number>; sortBy: string; order: string }) => {
        if (id) {
            const { filters, sortBy, order } = params;

            // Dispatch the Redux Thunk with updated parameters
            appDispatch(
                getProjectHazards({
                    projectId: id,
                    skip: (hazardPageNumber - 1) * 10, // Pagination logic
                    limit: 10, // Number of items per page
                    filters, // Filters applied
                    sortBy, // Sorting field
                    order // Sort order: "asc" or "desc"
                })
            );
        }
    };

    const onAddHazard = () => {
        setOpenAddHazardFromServiceDialog(true);
    };

    const onCreateHazard = () => {
        setOpenCreateHazardDialog(true);
    };

    // Table view vs Card view
    const [isTableView, setIsTableView] = useState(false); // Toggle state for view mode
    const onViewChangeClick = () => {
        setIsTableView((prev) => !prev); // Toggle between table and card view
    };

    const projectHazards = useSelector((state: RootState) => state.project.projectHazards);

    // delete function
    const deleteHazardFunc = (projectId: string, hazard: Hazard) => {
        appDispatch(deleteProjectHazards({ projectId, hazardIds: [hazard.id] }));
    };

    // add to visualization function
    const addHazardVisualizationFunc = (
        projectId: string,
        visualizationId: string,
        hazard: Hazard,
        styleName?: string
    ) => {
        // Create layers array by mapping over each datasetId in hazard.HazardDatasets
        const layers = hazard.hazardDatasets.map((hazardDataset: HazardDataset) => ({
            workspace: "incore",
            layerId: hazardDataset.datasetId,
            ...(styleName && { styleName }) // Only include styleName if it's provided
        }));

        // Dispatch the action with the new layers array
        appDispatch(addLayerToVisualization({ projectId, visualizationId, layers }));
    };

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

    // Add hazard to project from service
    const [openAddHazardFromServiceDialog, setOpenAddHazardFromServiceDialog] = useState(false);
    const addHazardFunc = (projectId: string, resource: Hazard) => {
        appDispatch(addHazardToProject({ projectId, hazards: [resource] }));
        setOpenAddHazardFromServiceDialog(false);
    };

    // Create new hazard
    const [openCreateHazardDialog, setOpenCreateHazardDialog] = useState(false);

    // batch delete
    const [selectedHazards, setSelectedHazards] = useState<Hazard[]>([]);
    const [openBatchDeleteDialog, setOpenBatchDeleteDialog] = useState(false);
    const handleBatchDelete = async () => {
        if (project?.id && selectedHazards.length > 0) {
            await appDispatch(
                deleteProjectHazards({
                    projectId: project.id,
                    hazardIds: selectedHazards.map((w) => w.id)
                })
            );
            setSelectedHazards([]);
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
                            resource="Hazards"
                        />
                        <ProjectHeader project={project} />
                        <Divider />
                        <Grid container spacing={5} mt={3} ml={0}>
                            <Grid sm={2}>
                                <ProjectSidebar id={project.id} />
                            </Grid>
                            <Grid sm={10}>
                                <ResourceFilterBar
                                    title="Hazards"
                                    icon={<HazardIcon sx={{ verticalAlign: "middle" }} />}
                                    filters={{ type: ["earthquake", "tsunami", "hurricane", "tornado", "flood"] }}
                                    sortOptions={["date", "type", "name", "id"]}
                                    onApply={onApplyFilterSort}
                                    onCreateClick={onAddHazard}
                                    onViewChangeClick={onViewChangeClick}
                                    isTableView={isTableView}
                                    createLabel="Add Existing Hazard"
                                    addtionalCreateLabel="Create Hazard"
                                    additionalCreateClick={onCreateHazard}
                                    selectedItemsCount={selectedHazards.length}
                                    onBatchDeleteClick={() => setOpenBatchDeleteDialog(true)}
                                />
                                <AddFromServiceDialog
                                    projectId={project.id}
                                    resourceType="hazard"
                                    open={openAddHazardFromServiceDialog}
                                    onClose={() => {
                                        setOpenAddHazardFromServiceDialog(false);
                                    }}
                                    onAddClick={addHazardFunc}
                                />
                                <CreateHazardDialog
                                    projectId={project.id}
                                    resourceType="hazard"
                                    open={openCreateHazardDialog}
                                    onClose={() => {
                                        setOpenCreateHazardDialog(false);
                                    }}
                                />
                                {isTableView ? (
                                    <ResourceTable
                                        columns={["name", "description", "date", "creator"]}
                                        data={projectHazards}
                                        projectId={project.id}
                                        deleteFunc={deleteHazardFunc}
                                        addVisualizationFunc={addHazardVisualizationFunc}
                                    />
                                ) : (
                                    <ResourceCards
                                        resources={projectHazards}
                                        cardPerRow={4}
                                        projectId={project.id}
                                        deleteFunc={deleteHazardFunc}
                                        addVisualizationFunc={addHazardVisualizationFunc}
                                        onSelectionChange={(selected) => setSelectedHazards(selected as Hazard[])}
                                        selectedItems={selectedHazards}
                                    />
                                )}
                                <Box mt={4} display="flex" justifyContent="center">
                                    <Pagination
                                        pageNumber={hazardPageNumber}
                                        dataLength={projectHazards.length}
                                        dataPerPage={10}
                                        previous={hazardPreviousPage}
                                        next={hazardNextPage}
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

export default HazardPage;
