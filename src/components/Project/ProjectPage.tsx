import React, { useEffect, useState } from "react";
import { Box, Typography, Container } from "@mui/joy";
import { Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@app/store";
import {
    deleteProjectDatasets,
    deleteProjectVisualizations,
    deleteProjectWorkflows,
    getProject,
    getProjectDatasets,
    getProjectDRF3Mappings,
    getProjectHazards,
    getProjectVisualizations,
    getProjectWorkflows
} from "@app/reducer/projectSlice";
import Navbar from "@app/components/Navigation/Navbar";
import { ProjectBreadcrumb } from "@app/components/Project/ProjectBreadcrumb";
import { ProjectHeader } from "@app/components/Project/ProjectHeader";
import { ResourceTable } from "@app/components/Project/Resource/ResourceTable";
import { Pagination } from "@app/components/Home/Pagination";
import ResourceFilterBar from "@app/components/Project/Resource/ResourceFilterBar";
import Divider from "@mui/joy/Divider";
import { ResourceCards } from "@app/components/Project/Resource/ResourceCards";
import { ProjectSidebar } from "@app/components/Project/ProjectSidebar";

import DatasetIcon from "@mui/icons-material/FormatListBulleted";
import WorkflowIcon from "@mui/icons-material/AccountTree";
import DFR3Icon from "@mui/icons-material/ShowChart";
import HazardIcon from "@mui/icons-material/Storm";
import VisualizationIcon from "@mui/icons-material/Map";

const ProjectPage = (): JSX.Element => {
    const { id } = useParams(); // Get projectId from the URL path
    const dispatch = useDispatch();

    // Redux state
    const project = useSelector((state: RootState) => state.project.project);

    // Pagination states
    const [visPageNumber, setVisPageNumber] = useState(1);
    const [hazardPageNumber, setHazardPageNumber] = useState(1);
    const [dfr3mappingPageNumber, setDfr3mappingPageNumber] = useState(1);
    const [wfPageNumber, setWfPageNumber] = useState(1);
    const [datasetPageNumber, setDatasetPageNumber] = useState(1);
    const visNextPage = () => {
        setVisPageNumber((prevPage) => prevPage + 1);
    };
    const hazardNextPage = () => {
        setHazardPageNumber((prevPage) => prevPage + 1);
    };
    const dfr3mappingNextPage = () => {
        setDfr3mappingPageNumber((prevPage) => prevPage + 1);
    };
    const wfNextPage = () => {
        setWfPageNumber((prevPage) => prevPage + 1);
    };
    const datasetNextPage = () => {
        setDatasetPageNumber((prevPage) => prevPage + 1);
    };
    const visPreviousPage = () => {
        setVisPageNumber((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
    };
    const hazardPreviousPage = () => {
        setHazardPageNumber((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
    };
    const dfr3mappingPreviousPage = () => {
        setDfr3mappingPageNumber((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
    };
    const wfPreviousPage = () => {
        setWfPageNumber((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
    };
    const datasetPreviousPage = () => {
        setDatasetPageNumber((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
    };

    // Fetch projects when filters or pagination change (but not during search)
    useEffect(() => {
        if (id) {
            // @ts-ignore
            dispatch(getProject(id));
        }
    }, [id]);

    useEffect(() => {
        // @ts-ignore
        dispatch(getProjectVisualizations({ projectId: id, skip: (visPageNumber - 1) * 2, limit: 2 }));
    }, [id, visPageNumber]);

    useEffect(() => {
        // @ts-ignore
        dispatch(getProjectHazards({ projectId: id, skip: (hazardPageNumber - 1) * 2, limit: 2 }));
    }, [id, hazardPageNumber]);

    useEffect(() => {
        // @ts-ignore
        dispatch(getProjectDRF3Mappings({ projectId: id, skip: (dfr3mappingPageNumber - 1) * 5, limit: 5 }));
    }, [id, dfr3mappingPageNumber]);

    useEffect(() => {
        // @ts-ignore
        dispatch(getProjectWorkflows({ projectId: id, skip: (wfPageNumber - 1) * 5, limit: 5 }));
    }, [id, wfPageNumber]);

    useEffect(() => {
        // @ts-ignore
        dispatch(getProjectDatasets({ projectId: id, skip: (datasetPageNumber - 1) * 5, limit: 5 }));
    }, [id, datasetPageNumber]);

    const projectDatasets = useSelector((state: RootState) => state.project.projectDatasets);
    const projectHazards = useSelector((state: RootState) => state.project.projectHazards);
    const projectWorkflows = useSelector((state: RootState) => state.project.projectWorkflows);
    const projectDFR3Mappings = useSelector((state: RootState) => state.project.projectDFR3Mappings);
    const projectVisualizations = useSelector((state: RootState) => state.project.projectVisualizations);

    // Delete
    const deleteDatasetFunc = (projectId: string, datasetIds: string[]) => {
        // @ts-ignore
        dispatch(deleteProjectDatasets({ projectId, datasetIds }));
    };
    const deleteHazardFunc = (projectId: string, hazardIds: string[]) => {
        // @ts-ignore
        dispatch(deleteProjectHazards({ projectId, hazardIds }));
    };
    const deleteDFR3MappingFunc = (projectId: string, dfr3mappingIds: string[]) => {
        // @ts-ignore
        dispatch(deleteProjectDFR3Mappings({ projectId, dfr3mappingIds }));
    };
    const deleteVisualizationFunc = (projectId: string, visualizationIds: string[]) => {
        // @ts-ignore
        dispatch(deleteProjectVisualizations({ projectId, visualizationIds }));
    };
    const deleteWorkflowFunc = (projectId: string, workflowIds: string[]) => {
        // @ts-ignore
        dispatch(deleteProjectWorkflows({ projectId, workflowIds }));
    };

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
                                {/* Left Column: Workflow, Hazard and Visualization Cards */}
                                <Grid sm={5}>
                                    <Box mb={1}>
                                        <ResourceFilterBar
                                            title="Workflows"
                                            icon={<WorkflowIcon sx={{ verticalAlign: "middle" }} />}
                                            createLabel="Create New Workflow"
                                        />
                                        <ResourceCards
                                            resources={projectWorkflows}
                                            projectId={project.id}
                                            deleteFunc={deleteWorkflowFunc}
                                        />
                                        <Box mt={4} display="flex" justifyContent="center">
                                            <Pagination
                                                pageNumber={wfPageNumber}
                                                data={projectWorkflows}
                                                dataPerPage={2}
                                                previous={wfPreviousPage}
                                                next={wfNextPage}
                                            />
                                        </Box>
                                    </Box>
                                    <Box mb={1}>
                                        <ResourceFilterBar
                                            title="Hazards"
                                            icon={<HazardIcon sx={{ verticalAlign: "middle" }} />}
                                            createLabel="Add from Service"
                                        />
                                        <ResourceCards
                                            resources={projectHazards}
                                            projectId={project.id}
                                            deleteFunc={deleteHazardFunc}
                                        />
                                        <Box mt={4} display="flex" justifyContent="center">
                                            <Pagination
                                                pageNumber={hazardPageNumber}
                                                data={projectHazards}
                                                dataPerPage={2}
                                                previous={hazardPreviousPage}
                                                next={hazardNextPage}
                                            />
                                        </Box>
                                    </Box>
                                    <Box>
                                        <ResourceFilterBar
                                            title="Visualization"
                                            icon={<VisualizationIcon sx={{ verticalAlign: "middle" }} />}
                                            createLabel="Create Visualization"
                                        />
                                        <ResourceCards
                                            resources={projectVisualizations}
                                            projectId={project.id}
                                            deleteFunc={deleteVisualizationFunc}
                                        />
                                        <Box mt={4} display="flex" justifyContent="center">
                                            <Pagination
                                                pageNumber={visPageNumber}
                                                data={projectVisualizations}
                                                dataPerPage={2}
                                                previous={visPreviousPage}
                                                next={visNextPage}
                                            />
                                        </Box>
                                    </Box>
                                </Grid>
                                {/* Right Column: Dataset, and DFR3Mapping Tables */}
                                <Grid sm={5}>
                                    <Box mb={1}>
                                        <ResourceFilterBar
                                            title="Datasets"
                                            icon={<DatasetIcon sx={{ verticalAlign: "middle" }} />}
                                            createLabel="Add from Service"
                                        />
                                        <ResourceTable
                                            columns={["title", "description", "date", "owner"]}
                                            data={projectDatasets}
                                            projectId={project.id}
                                            deleteFunc={deleteDatasetFunc}
                                        />
                                        <Box mt={4} display="flex" justifyContent="center">
                                            <Pagination
                                                pageNumber={datasetPageNumber}
                                                data={projectDatasets}
                                                dataPerPage={5}
                                                previous={datasetPreviousPage}
                                                next={datasetNextPage}
                                            />
                                        </Box>
                                    </Box>

                                    <Box>
                                        <ResourceFilterBar
                                            title="DFR3 Mappings"
                                            icon={<DFR3Icon sx={{ verticalAlign: "middle" }} />}
                                            createLabel="Add from Service"
                                        />
                                        <ResourceTable
                                            columns={["name", "hazardType", "inventoryType", "mappingType", "owner"]}
                                            data={projectDFR3Mappings}
                                            projectId={project.id}
                                            deleteFunc={deleteDFR3MappingFunc}
                                        />
                                        <Box mt={4} display="flex" justifyContent="center">
                                            <Pagination
                                                pageNumber={dfr3mappingPageNumber}
                                                data={projectDFR3Mappings}
                                                dataPerPage={5}
                                                previous={dfr3mappingPreviousPage}
                                                next={dfr3mappingNextPage}
                                            />
                                        </Box>
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

export default ProjectPage;
