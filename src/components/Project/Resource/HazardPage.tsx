import React, { useEffect, useState } from "react";
import { Box, Typography, Container } from "@mui/joy";
import { Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import {
    addHazardToProject,
    addLayerToVisualization,
    deleteProjectHazards,
    getProject,
    getProjectHazards,
    getProjectVisualizations,
    searchProjectHazards
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
            // TODO figure out how to get all visualizations
            appDispatch(getProjectVisualizations({ projectId: id, skip: 0, limit: 10 }));
        }
    }, [id, hazardPageNumber, deletedHazardIds]);

    const onSearch = (text: string) => {
        if (id)
            appDispatch(searchProjectHazards({ text, projectId: id, skip: (hazardPageNumber - 1) * 10, limit: 10 }));
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const onFilterSelect = () => {};
    const onCreateClick = () => {
        setOpenAddHazardFromServiceDialog(true);
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const onSortClick = () => {};

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

    return (
        <Container sx={{ display: "flex", flexDirection: "column", height: "100vh" }} maxWidth="xl">
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
                                    onSearch={onSearch}
                                    onFilterSelect={onFilterSelect}
                                    filters={{ type: ["earthquake", "tsunami", "hurricane", "tornado", "flood"] }}
                                    onCreateClick={onCreateClick}
                                    onSortClick={onSortClick}
                                    sortOptions={["date", "type", "name", "id"]}
                                    onViewChangeClick={onViewChangeClick}
                                    isTableView={isTableView}
                                    createLabel="Add from Service"
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
                                    />
                                )}
                                <Box mt={4} display="flex" justifyContent="center">
                                    <Pagination
                                        pageNumber={hazardPageNumber}
                                        data={projectHazards}
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
