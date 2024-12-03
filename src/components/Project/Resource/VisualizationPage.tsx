import React, { useEffect, useState } from "react";
import { Box, Typography, Container } from "@mui/joy";
import { Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import { deleteProjectVisualizations, getProject, getProjectVisualizations } from "@app/reducer/projectSlice";
import { ProjectBreadcrumb } from "@app/components/Project/ProjectBreadcrumb";
import { ProjectHeader } from "@app/components/Project/ProjectHeader";
import { ResourceTable } from "@app/components/Project/Resource/ResourceTable";
import { Pagination } from "@app/components/Home/Pagination";
import ResourceFilterBar from "@app/components/Project/Resource/ResourceFilterBar";
import Divider from "@mui/joy/Divider";
import { ResourceCards } from "@app/components/Project/Resource/ResourceCards";
import { ProjectSidebar } from "@app/components/Project/ProjectSidebar";
import { CreateVisualizationDialog } from "@app/components/Project/Resource/VisualizationDialog";
import { VisualizationView } from "@app/components/Project/Resource/VisaualizationView";
import { useAppDispatch } from "@app/store/hooks";

import VisualizationIcon from "@mui/icons-material/Map";
import Snackbar from "@mui/joy/Snackbar";

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

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const onSearchClick = () => {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const onFilterClick = () => {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const onSortClick = () => {};

    // Table view vs Card view
    const [isTableView, setIsTableView] = useState(false); // Toggle state for view mode
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
    const [selectedVisualization, setSelectedVisualization] = useState<Visualization>();
    const [openVisualziationView, setOpenVisualziationView] = useState(true);
    const handleCloseVisualziationView = () => {
        setOpenVisualziationView(false);
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
                            resource="Visualizations"
                        />
                        <ProjectHeader project={project} />
                        <Divider />
                        <Grid container spacing={5} mt={3} ml={0}>
                            <Grid sm={2}>
                                <ProjectSidebar id={project.id} />
                            </Grid>
                            <Grid sm={10}>
                                <ResourceFilterBar
                                    title="Visualizations"
                                    icon={<VisualizationIcon sx={{ verticalAlign: "middle" }} />}
                                    onSearchClick={onSearchClick}
                                    onFilterClick={onFilterClick}
                                    onCreateClick={onCreateClick}
                                    onSortClick={onSortClick}
                                    onViewChangeClick={onViewChangeClick}
                                    isTableView={isTableView}
                                    createLabel="Create New Visualization"
                                />
                                <CreateVisualizationDialog
                                    projectId={project.id}
                                    open={openCreateVisDialog}
                                    onClose={handleCloseCreateVisDialog}
                                />
                                {selectedVisualization && (
                                    <VisualizationView
                                        visualization={selectedVisualization}
                                        open={openVisualziationView}
                                        onClose={handleCloseVisualziationView}
                                    />
                                )}
                                {isTableView ? (
                                    <ResourceTable
                                        columns={["name", "description", "date"]}
                                        data={projectVisualizations}
                                        projectId={project.id}
                                        deleteFunc={deleteVisualizationFunc}
                                        viewFunc={(visualization: Visualization) => {
                                            setSelectedVisualization(visualization);
                                            setOpenVisualziationView(true);
                                        }}
                                    />
                                ) : (
                                    <ResourceCards
                                        resources={projectVisualizations}
                                        cardPerRow={4}
                                        projectId={project.id}
                                        deleteFunc={deleteVisualizationFunc}
                                        viewFunc={(visualization: Visualization) => {
                                            setSelectedVisualization(visualization);
                                            setOpenVisualziationView(true);
                                        }}
                                    />
                                )}
                                <Box mt={4} display="flex" justifyContent="center">
                                    <Pagination
                                        pageNumber={visualizationPageNumber}
                                        data={projectVisualizations}
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
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
