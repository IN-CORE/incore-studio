import React, { useEffect, useState } from "react";
import { Box, Typography, Container } from "@mui/joy";
import { Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@app/store";
import { getProject, getProjectWorkflows } from "@app/reducer/projectSlice";
import Navbar from "@app/components/Navigation/Navbar";
import { ProjectBreadcrumb } from "@app/components/Project/ProjectBreadcrumb";
import { ProjectHeader } from "@app/components/Project/ProjectHeader";
import { ResourceTable } from "@app/components/Project/Resource/ResourceTable";
import { Pagination } from "@app/components/Home/Pagination";
import ResourceFilterBar from "@app/components/Project/Resource/ResourceFilterBar";
import Divider from "@mui/joy/Divider";
import { ProjectSidebar } from "@app/components/Project/ProjectSidebar";

import WorkflowIcon from "@mui/icons-material/AccountTree";

const WorkflowPage = (): JSX.Element => {
    const { id } = useParams(); // Get projectId from the URL path
    const dispatch = useDispatch();

    // Redux state
    const project = useSelector((state: RootState) => state.project.project);

    // Pagination states
    const [workflowPageNumber, setWorkflowPageNumber] = useState(1);
    const workflowNextPage = () => {
        setWorkflowPageNumber((prevPage) => prevPage + 1);
    };
    const workflowPreviousPage = () => {
        setWorkflowPageNumber((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
    };

    useEffect(() => {
        if (id) {
            // @ts-ignore
            dispatch(getProject(id));
        }
    }, [id]);

    useEffect(() => {
        // @ts-ignore
        dispatch(getProjectWorkflows({ projectId: id, skip: (workflowPageNumber - 1) * 10, limit: 10 }));
    }, [id, workflowPageNumber]);

    const onSearchClick = () => {};
    const onFilterClick = () => {};
    const onCreateClick = () => {};
    const onSortClick = () => {};

    const projectWorkflows = useSelector((state: RootState) => state.project.projectWorkflows);

    return (
        <>
            <Navbar />
            <Container sx={{ display: "flex", flexDirection: "column", height: "100vh" }} maxWidth="xl">
                <Box sx={{ flexShrink: 0 }} mt={5}>
                    {!project ? (
                        <Typography>Loading...</Typography>
                    ) : (
                        <>
                            {/* Header Section */}
                            <ProjectBreadcrumb project={{ href: `/project/${project.id}`, label: project.name }} />
                            <ProjectHeader project={project} />
                            <Divider />
                            <Grid container spacing={5} mt={3} ml={0}>
                                <Grid sm={2}>
                                    <ProjectSidebar id={project.id} />
                                </Grid>
                                <Grid sm={10}>
                                    <ResourceFilterBar
                                        title="Workflows"
                                        icon={<WorkflowIcon sx={{ verticalAlign: "middle" }} />}
                                        onSearchClick={onSearchClick}
                                        onFilterClick={onFilterClick}
                                        onCreateClick={onCreateClick}
                                        onSortClick={onSortClick}
                                        isTableView
                                        createLabel="Create New Workflow"
                                    />
                                    <ResourceTable
                                        columns={["title", "description", "date", "creator"]}
                                        data={projectWorkflows}
                                    />
                                    <Box mt={4} display="flex" justifyContent="center">
                                        <Pagination
                                            pageNumber={workflowPageNumber}
                                            data={projectWorkflows}
                                            dataPerPage={10}
                                            previous={workflowPreviousPage}
                                            next={workflowNextPage}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </Box>
            </Container>
        </>
    );
};

export default WorkflowPage;
