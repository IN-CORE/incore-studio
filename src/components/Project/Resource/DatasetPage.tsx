import React, { useEffect, useState } from "react";
import { Box, Typography, Container } from "@mui/joy";
import { Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import {
    getProject,
    getProjectDatasets,
    deleteProjectDatasets,
    addLayerToVisualization,
    getProjectVisualizations,
    addDatasetToProject
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
import Snackbar from "@mui/joy/Snackbar";

import DatasetIcon from "@mui/icons-material/FormatListBulleted";
import { AddFromServiceDialog } from "@app/components/Project/Resource/AddFromServiceDialog";

const DatasetPage = (): JSX.Element => {
    const { id } = useParams(); // Get projectId from the URL path
    const appDispatch = useAppDispatch();

    // Redux state
    const project = useSelector((state: RootState) => state.project.project);
    const deletedDatasetIds = useSelector((state: RootState) => state.project.deletedDatasetIds);

    // Pagination states
    const [datasetPageNumber, setDatasetPageNumber] = useState(1);
    const datasetNextPage = () => {
        setDatasetPageNumber((prevPage) => prevPage + 1);
    };
    const datasetPreviousPage = () => {
        setDatasetPageNumber((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
    };

    useEffect(() => {
        if (id) {
            appDispatch(getProject(id));
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            appDispatch(getProjectDatasets({ projectId: id, skip: (datasetPageNumber - 1) * 10, limit: 10 }));
            // TODO figure out how to get all visualizations
            appDispatch(getProjectVisualizations({ projectId: id, skip: 0, limit: 10 }));
        }
    }, [id, datasetPageNumber, deletedDatasetIds]);

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const onSearchClick = () => {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const onFilterSelect = () => {};
    const onCreateClick = () => {
        setOpenAddDatasetFromServiceDialog(true);
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const onSortClick = () => {};

    // Table view vs Card view
    const [isTableView, setIsTableView] = useState(false); // Toggle state for view mode
    const onViewChangeClick = () => {
        setIsTableView((prev) => !prev); // Toggle between table and card view
    };

    const projectDatasets = useSelector((state: RootState) => state.project.projectDatasets);

    // delete datasets
    const deleteDatasetFunc = (projectId: string, dataset: Dataset) => {
        appDispatch(deleteProjectDatasets({ projectId, datasetIds: [dataset.id] }));
    };

    // add to visualization function
    const addDatasetVisualizationFunc = (
        projectId: string,
        visualizationId: string,
        dataset: Dataset,
        styleName?: string
    ) => {
        if (dataset.format === "shapefile") {
            const layers = [
                {
                    workspace: "incore",
                    layerId: dataset.id,
                    ...(styleName && { styleName }) // Only include styleName if it's provided
                }
            ];

            // Dispatch the action with the new layers array
            appDispatch(addLayerToVisualization({ projectId, visualizationId, layers }));
        } else {
            alert("Only shapefiles can be added to a visualization for now!");
        }
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

    // Add dataset to project from service
    const [openAddDatasetFromServiceDialog, setOpenAddDatasetFromServiceDialog] = useState(false);
    const addDatasetFunc = (projectId: string, resource: Dataset) => {
        appDispatch(addDatasetToProject({ projectId, datasets: [resource] }));
        setOpenAddDatasetFromServiceDialog(false);
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
                            resource="Datasets"
                        />
                        <ProjectHeader project={project} />
                        <Divider />
                        <Grid container spacing={5} mt={3} ml={0}>
                            <Grid sm={2}>
                                <ProjectSidebar id={project.id} />
                            </Grid>
                            <Grid sm={10}>
                                <ResourceFilterBar
                                    title="Datasets"
                                    icon={<DatasetIcon sx={{ verticalAlign: "middle" }} />}
                                    onSearchClick={onSearchClick}
                                    onFilterSelect={onFilterSelect}
                                    filters={{ type: [] }}
                                    onCreateClick={onCreateClick}
                                    onSortClick={onSortClick}
                                    onViewChangeClick={onViewChangeClick}
                                    isTableView={isTableView}
                                    createLabel="Add from Service"
                                />
                                <AddFromServiceDialog
                                    projectId={project.id}
                                    resourceType="dataset"
                                    open={openAddDatasetFromServiceDialog}
                                    onClose={() => {
                                        setOpenAddDatasetFromServiceDialog(false);
                                    }}
                                    onAddClick={addDatasetFunc}
                                />
                                {isTableView ? (
                                    <ResourceTable
                                        columns={["title", "description", "date", "owner"]}
                                        data={projectDatasets}
                                        projectId={project.id}
                                        deleteFunc={deleteDatasetFunc}
                                        addVisualizationFunc={addDatasetVisualizationFunc}
                                    />
                                ) : (
                                    <ResourceCards
                                        resources={projectDatasets}
                                        cardPerRow={4}
                                        projectId={project.id}
                                        deleteFunc={deleteDatasetFunc}
                                        addVisualizationFunc={addDatasetVisualizationFunc}
                                    />
                                )}
                                <Box mt={4} display="flex" justifyContent="center">
                                    <Pagination
                                        pageNumber={datasetPageNumber}
                                        data={projectDatasets}
                                        dataPerPage={10}
                                        previous={datasetPreviousPage}
                                        next={datasetNextPage}
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

export default DatasetPage;
