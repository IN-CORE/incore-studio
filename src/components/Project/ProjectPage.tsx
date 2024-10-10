import React, { useEffect } from "react";
import { Box, Typography, Container } from "@mui/joy";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@app/store";
import {
    getProject,
    getProjectDatasets,
    getProjectDRF3Mappings,
    getProjectHazards,
    getProjectWorkflows
} from "@app/reducer/projectSlice";
import { parseDateTime } from "@app/utils";
import Topbar from "@app/components/Home/Topbar";
import { DatasetTable } from "@app/components/Project/DatasetTable";
import { DFR3MappingTable } from "@app/components/Project/DFR3MappingTable";
import { HazardCards } from "@app/components/Project/HazardCards";
import { WorkflowTable } from "@app/components/Project/WorkflowTable";
import { VisualizationCards } from "@app/components/Project/VisualizationCards";
import { ProjectBreadcrumb } from "@app/components/Project/ProjectBreadcrumb";

const ProjectPage = (): JSX.Element => {
    const { id } = useParams(); // Get projectId from the URL path
    const dispatch = useDispatch();

    // Redux state
    const project = useSelector((state: RootState) => state.project.project);
    // const projectWorkflows = useSelector((state: RootState) => state.project.projectWorkflows);
    // const projectHazards = useSelector((state: RootState) => state.project.projectHazards);

    const loading = useSelector((state: RootState) => state.project.loading);

    // Fetch projects when filters or pagination change (but not during search)
    useEffect(() => {
        // @ts-ignore
        dispatch(getProject(id));
        // @ts-ignore
        dispatch(getProjectDatasets(id));
        // @ts-ignore
        dispatch(getProjectHazards(id));
        // @ts-ignore
        dispatch(getProjectWorkflows(id));
        // @ts-ignore
        dispatch(getProjectDRF3Mappings(id));
    }, [id]);

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
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
                                <Box>
                                    <Typography level="h1" sx={{ fontSize: "24px" }}>
                                        {project.name}
                                    </Typography>
                                    <Typography level="body-md" sx={{ mt: 1 }}>
                                        {project.description}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                                    <Typography>{project.workflows.length}</Typography>
                                    <Typography>{project.region}</Typography>
                                    <Typography>{project.owner}</Typography>
                                    <Typography>{project.date ? parseDateTime(project.date) : "No date"}</Typography>
                                </Box>
                            </Box>

                            {/* Hazard Section */}
                            <HazardCards />
                            {/* Visualization Section */}
                            <VisualizationCards />
                            {/* Workflow Section */}
                            <WorkflowTable />
                            {/* Dataset Section */}
                            <DatasetTable />
                            {/* DFR3Mapping Section */}
                            <DFR3MappingTable />
                        </>
                    )}
                </Box>
            </Container>
        </>
    );
};

export default ProjectPage;
