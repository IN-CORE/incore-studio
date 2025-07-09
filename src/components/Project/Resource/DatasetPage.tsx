import React, { useEffect, useState } from "react";
import { Box, Typography, Container, Grid } from "@mui/joy";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import {
    getProject,
    getProjectDatasets,
    deleteProjectDatasets,
    addLayerToVisualization,
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
import { CreateDatasetDialog } from "@app/components/Project/Resource/CreateDatasetDialog";
import TableDataModal from "@app/components/TableDataModal";
import { IncoreDialog } from "@app/components/IncoreDialog";

const DatasetPage = (): JSX.Element => {
    const { id } = useParams(); // Get projectId from the URL path
    const appDispatch = useAppDispatch();

    // Redux state
    const project = useSelector((state: RootState) => state.project.project);
    const deletedDatasetIds = useSelector((state: RootState) => state.project.deletedDatasetIds);
    const [openTableDataModal, setOpenTableDataModal] = useState(false); // State to control the visibility of the table data modal
    const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null); // State to store the selected dataset

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
        }
    }, [id, datasetPageNumber, deletedDatasetIds]);

    const onCreateClick = () => {
        setOpenAddDatasetFromServiceDialog(true);
    };
    const onApply = (params: { filters: Record<string, string | number>; sortBy: string; order: string }) => {
        if (id) {
            const { filters, sortBy, order } = params;

            // Dispatch the Redux Thunk with updated parameters
            appDispatch(
                getProjectDatasets({
                    projectId: id,
                    skip: (datasetPageNumber - 1) * 10, // Pagination logic
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
        if (dataset.format === "shapefile" || dataset.format === "table") {
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
            alert("Only shapefiles and tables can be added to a visualization for now!");
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

    // Create dataset
    const [openCreateDatasetDialog, setOpenCreateDatasetDialog] = useState(false);
    const onCreateDataset = () => {
        setOpenCreateDatasetDialog(true);
    };

    // batch delete
    const [selectedDatasets, setSelectedDatasets] = useState<Dataset[]>([]);
    const [openBatchDeleteDialog, setOpenBatchDeleteDialog] = useState(false);
    const handleBatchDelete = async () => {
        if (project?.id && selectedDatasets.length > 0) {
            await appDispatch(
                deleteProjectDatasets({
                    projectId: project.id,
                    datasetIds: selectedDatasets.map((w) => w.id)
                })
            );
            setSelectedDatasets([]);
        }
        setOpenBatchDeleteDialog(false);
    };

    console.log("Project Datasets:", projectDatasets);

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
                                    filters={{ type: [], format: [] }}
                                    sortOptions={["date", "type", "title", "id"]}
                                    onApply={onApply}
                                    onCreateClick={onCreateClick}
                                    onViewChangeClick={onViewChangeClick}
                                    isTableView={isTableView}
                                    createLabel="Add from Service"
                                    addtionalCreateLabel="Upload Dataset"
                                    additionalCreateClick={onCreateDataset}
                                    selectedItemsCount={selectedDatasets.length}
                                    onBatchDeleteClick={() => setOpenBatchDeleteDialog(true)}
                                    onSelectionChange={(selected) => setSelectedDatasets(selected as Dataset[])}
                                />
                                <AddFromServiceDialog
                                    projectId={project.id}
                                    resourceType="dataset"
                                    open={openAddDatasetFromServiceDialog}
                                    onClose={() => {
                                        setOpenAddDatasetFromServiceDialog(false);
                                    }}
                                    onAddClick={addDatasetFunc}
                                    previewFunc={(dataset) => {
                                        setSelectedDataset(dataset as Dataset);
                                        setOpenTableDataModal(true);
                                    }}
                                />
                                <CreateDatasetDialog
                                    projectId={project.id}
                                    open={openCreateDatasetDialog}
                                    onClose={() => {
                                        setOpenCreateDatasetDialog(false);
                                    }}
                                />
                                {isTableView ? (
                                    <ResourceTable
                                        columns={["title", "description", "type", "date", "owner"]}
                                        data={projectDatasets}
                                        projectId={project.id}
                                        deleteFunc={deleteDatasetFunc}
                                        addVisualizationFunc={addDatasetVisualizationFunc}
                                        viewFunc={(dataset: Dataset) => {
                                            setOpenTableDataModal(true);
                                            setSelectedDataset(dataset);
                                        }}
                                        onSelectionChange={(selected) => setSelectedDatasets(selected as Dataset[])}
                                        selectedItems={selectedDatasets}
                                    />
                                ) : (
                                    <ResourceCards
                                        resources={projectDatasets}
                                        cardPerRow={4}
                                        projectId={project.id}
                                        deleteFunc={deleteDatasetFunc}
                                        addVisualizationFunc={addDatasetVisualizationFunc}
                                        viewFunc={(dataset: Dataset) => {
                                            setOpenTableDataModal(true);
                                            setSelectedDataset(dataset);
                                        }}
                                        onSelectionChange={(selected) => setSelectedDatasets(selected as Dataset[])}
                                        selectedItems={selectedDatasets}
                                    />
                                )}
                                <Box mt={4} display="flex" justifyContent="center">
                                    <Pagination
                                        pageNumber={datasetPageNumber}
                                        dataLength={projectDatasets.length}
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
            {selectedDataset && (
                <TableDataModal
                    open={openTableDataModal}
                    onClose={() => {
                        setOpenTableDataModal(false);
                    }}
                    dataset={selectedDataset}
                />
            )}
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
