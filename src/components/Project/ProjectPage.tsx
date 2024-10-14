import React, { useEffect } from "react";
import { Box, Typography, Container } from "@mui/joy";
import { Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@app/store";
import {
    getProject,
    getProjectDatasets,
    getProjectDRF3Mappings,
    getProjectVisualizations,
    getProjectWorkflows
} from "@app/reducer/projectSlice";
import Topbar from "@app/components/Home/Topbar";
import { HazardCards } from "@app/components/Project/HazardCards";
import { VisualizationCards } from "@app/components/Project/VisualizationCards";
import { ProjectBreadcrumb } from "@app/components/Project/ProjectBreadcrumb";
import { ProjectHeader } from "@app/components/Project/ProjectHeader";
import { ResourceTable } from "@app/components/Project/ResourceTable";

const ProjectPage = (): JSX.Element => {
    const { id } = useParams(); // Get projectId from the URL path
    const dispatch = useDispatch();

    // Redux state
    const project = useSelector((state: RootState) => state.project.project);
    const loading = useSelector((state: RootState) => state.project.loading);

    // Fetch projects when filters or pagination change (but not during search)
    useEffect(() => {
        // @ts-ignore
        dispatch(getProject(id));
        // @ts-ignore
        dispatch(getProjectDatasets(id));
        // @ts-ignore
        dispatch(getProjectWorkflows(id));
        // @ts-ignore
        dispatch(getProjectDRF3Mappings(id));
        // @ts-ignore
        dispatch(getProjectVisualizations(id));
    }, [id]);

    const projectDatasets = useSelector((state: RootState) => state.project.projectDatasets);
    const projectWorkflows = useSelector((state: RootState) => state.project.projectWorkflows);
    const projectDFR3Mappings = useSelector((state: RootState) => state.project.projectDFR3Mappings);

    return (
        <>
            <Topbar />
            <Container sx={{ display: "flex", flexDirection: "column", height: "100vh" }} maxWidth="xl">
                <Box sx={{ flexShrink: 0 }} mt={5}>
                    {loading || !project ? (
                        <Typography>Loading...</Typography>
                    ) : (
                        <>
                            {/* Header Section */}
                            <ProjectBreadcrumb project={{ href: `/project/${project.id}`, label: project.name }} />
                            <ProjectHeader project={project} />

                            <Grid container spacing={2} mt={3}>
                                {/* Left Column: Hazard and Visualization Cards */}
                                <Grid sm={6}>
                                    <HazardCards projectId={project.id} />
                                    <VisualizationCards />
                                </Grid>

                                {/* Right Column: Workflow, Dataset, and DFR3Mapping Tables */}
                                <Grid sm={6}>
                                    <ResourceTable
                                        resourceTitle="Datasets"
                                        columns={["name", "description", "date", "owner"]}
                                        data={projectDatasets}
                                    />
                                    <ResourceTable
                                        resourceTitle="Workflows"
                                        columns={["title", "description", "date", "creator", "isFinalized"]}
                                        data={projectWorkflows}
                                    />
                                    <ResourceTable
                                        resourceTitle="DFR3 Mappings"
                                        columns={["name", "hazardType", "inventoryType", "mappingType", "owner"]}
                                        data={projectDFR3Mappings}
                                    />
                                </Grid>
                            </Grid>
                        </>
                    )}
                </Box>
            </Container>
        </>
    );
};

export default ProjectPage;
