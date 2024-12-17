import React, { useEffect, useState } from "react";
import { Box, Typography, Container } from "@mui/joy";
import { Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import {
    addDFR3MappingToProject,
    deleteProjectDFR3Mappings,
    getProject,
    getProjectDRF3Mappings
} from "@app/reducer/projectSlice";
import { ProjectBreadcrumb } from "@app/components/Project/ProjectBreadcrumb";
import { ProjectHeader } from "@app/components/Project/ProjectHeader";
import { ResourceTable } from "@app/components/Project/Resource/ResourceTable";
import { Pagination } from "@app/components/Home/Pagination";
import ResourceFilterBar from "@app/components/Project/Resource/ResourceFilterBar";
import Divider from "@mui/joy/Divider";
import { ProjectSidebar } from "@app/components/Project/ProjectSidebar";
import { useAppDispatch } from "@app/store/hooks";

import DFR3Icon from "@mui/icons-material/ShowChart";
import Snackbar from "@mui/joy/Snackbar";
import { AddFromServiceDialog } from "@app/components/Project/Resource/AddFromServiceDialog";

const DFR3MappingPage = (): JSX.Element => {
    const { id } = useParams(); // Get projectId from the URL path
    const appDispatch = useAppDispatch();

    // Redux state
    const project = useSelector((state: RootState) => state.project.project);
    const deletedDFR3MappingIds = useSelector((state: RootState) => state.project.deletedDFR3MappingIds);

    // Pagination states
    const [DFR3MappingPageNumber, setDFR3MappingPageNumber] = useState(1);
    const DFR3MappingNextPage = () => {
        setDFR3MappingPageNumber((prevPage) => prevPage + 1);
    };
    const DFR3MappingPreviousPage = () => {
        setDFR3MappingPageNumber((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
    };

    useEffect(() => {
        if (id) {
            appDispatch(getProject(id));
        }
    }, [id]);

    useEffect(() => {
        if (id)
            appDispatch(getProjectDRF3Mappings({ projectId: id, skip: (DFR3MappingPageNumber - 1) * 10, limit: 10 }));
    }, [id, DFR3MappingPageNumber, deletedDFR3MappingIds]);

    const onApplyFilterSort = (params: { filters: Record<string, string | number>; sortBy: string; order: string }) => {
        if (id) {
            const { filters, sortBy, order } = params;

            // Dispatch the Redux Thunk with updated parameters
            appDispatch(
                getProjectDRF3Mappings({
                    projectId: id,
                    skip: (DFR3MappingPageNumber - 1) * 10, // Pagination logic
                    limit: 10, // Number of items per page
                    filters, // Filters applied
                    sortBy, // Sorting field
                    order // Sort order: "asc" or "desc"
                })
            );
        }
    };

    const onCreateClick = () => {
        setOpenAddDFR3MappingFromServiceDialog(true);
    };

    const projectDFR3Mappings = useSelector((state: RootState) => state.project.projectDFR3Mappings);

    // delete function
    const deleteDFR3MappingFunc = (projectId: string, dfr3mapping: DFR3Mapping) => {
        appDispatch(deleteProjectDFR3Mappings({ projectId, dfr3mappingIds: [dfr3mapping.id] }));
    };

    // Add hazard to project from service
    const [openAddDFR3MappingFromServiceDialog, setOpenAddDFR3MappingFromServiceDialog] = useState(false);
    const addDFR3MappingFunc = (projectId: string, resource: DFR3Mapping) => {
        appDispatch(addDFR3MappingToProject({ projectId, dfr3Mappings: [resource] }));
        setOpenAddDFR3MappingFromServiceDialog(false);
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
                            resource="DFR3 Mappings"
                        />
                        <ProjectHeader project={project} />
                        <Divider />
                        <Grid container spacing={5} mt={3} ml={0}>
                            <Grid sm={2}>
                                <ProjectSidebar id={project.id} />
                            </Grid>
                            <Grid sm={10}>
                                <ResourceFilterBar
                                    title="DFR3Mappings"
                                    icon={<DFR3Icon sx={{ verticalAlign: "middle" }} />}
                                    filters={{
                                        hazardType: ["earthquake", "tsunami", "hurricane", "tornado", "flood"],
                                        inventoryType: [
                                            "building",
                                            "bridge",
                                            "roadway",
                                            "electric_facility",
                                            "eletric_power_line",
                                            "water_facility",
                                            "buried_pipeline",
                                            "gas_facility"
                                        ],
                                        type: ["fragility", "repair", "restoration"]
                                    }}
                                    sortOptions={["date", "type", "hazardType", "inventoryType", "name", "id"]}
                                    onApply={onApplyFilterSort}
                                    onCreateClick={onCreateClick}
                                    isTableView
                                    createLabel="Add from Service"
                                />
                                <AddFromServiceDialog
                                    projectId={project.id}
                                    resourceType="DFR3 Mapping"
                                    open={openAddDFR3MappingFromServiceDialog}
                                    onClose={() => {
                                        setOpenAddDFR3MappingFromServiceDialog(false);
                                    }}
                                    onAddClick={addDFR3MappingFunc}
                                />
                                <ResourceTable
                                    columns={["name", "hazardType", "inventoryType", "mappingType", "date", "creator"]}
                                    data={projectDFR3Mappings}
                                    projectId={project.id}
                                    deleteFunc={deleteDFR3MappingFunc}
                                />
                                <Box mt={4} display="flex" justifyContent="center">
                                    <Pagination
                                        pageNumber={DFR3MappingPageNumber}
                                        data={projectDFR3Mappings}
                                        dataPerPage={10}
                                        previous={DFR3MappingPreviousPage}
                                        next={DFR3MappingNextPage}
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

export default DFR3MappingPage;
