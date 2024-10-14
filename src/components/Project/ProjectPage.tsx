import React, { useEffect, useState } from "react";
import { Box, Typography, Container } from "@mui/joy";
import { Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@app/store";
import {
    getProject,
    getProjectDatasets,
    getProjectDRF3Mappings,
    getProjectHazards,
    getProjectVisualizations,
    getProjectWorkflows
} from "@app/reducer/projectSlice";
import Topbar from "@app/components/Home/Topbar";
import { HazardCards } from "@app/components/Project/HazardCards";
import { VisualizationCards } from "@app/components/Project/VisualizationCards";
import { ProjectBreadcrumb } from "@app/components/Project/ProjectBreadcrumb";
import { ProjectHeader } from "@app/components/Project/ProjectHeader";
import { ResourceTable } from "@app/components/Project/ResourceTable";
import { Pagination } from "@app/components/Home/Pagination";
import ResourceFilterBar from "@app/components/Project/ResourceFilterBar";

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
        dispatch(getProjectDRF3Mappings({ projectId: id, skip: (hazardPageNumber - 1) * 5, limit: 5 }));
    }, [id, dfr3mappingPageNumber]);

    useEffect(() => {
        // @ts-ignore
        dispatch(getProjectWorkflows({ projectId: id, skip: (hazardPageNumber - 1) * 5, limit: 5 }));
    }, [id, wfPageNumber]);

    useEffect(() => {
        // @ts-ignore
        dispatch(getProjectDatasets({ projectId: id, skip: (hazardPageNumber - 1) * 5, limit: 5 }));
    }, [id, datasetPageNumber]);

    const projectDatasets = useSelector((state: RootState) => state.project.projectDatasets);
    const projectHazards = useSelector((state: RootState) => state.project.projectHazards);
    const projectWorkflows = useSelector((state: RootState) => state.project.projectWorkflows);
    const projectDFR3Mappings = useSelector((state: RootState) => state.project.projectDFR3Mappings);
    const projectVisualizations = useSelector((state: RootState) => state.project.projectVisualizations);

    return (
        <>
            <Topbar />
            <Container sx={{ display: "flex", flexDirection: "column", height: "100vh" }} maxWidth="xl">
                <Box sx={{ flexShrink: 0 }} mt={5}>
                    {!project ? (
                        <Typography>Loading...</Typography>
                    ) : (
                        <>
                            {/* Header Section */}
                            <ProjectBreadcrumb project={{ href: `/project/${project.id}`, label: project.name }} />
                            <ProjectHeader project={project} />

                            <Grid container spacing={5} mt={3} ml={0}>
                                {/* Left Column: Hazard and Visualization Cards */}
                                <Grid sm={6}>
                                    <Box>
                                        <ResourceFilterBar title="Hazards" createLabel="Add from Service" />
                                        <HazardCards projectHazards={projectHazards} />
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
                                        <ResourceFilterBar title="Visualization" createLabel="Create Visualization" />
                                        <VisualizationCards projectVisualizations={projectVisualizations} />
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

                                {/* Right Column: Workflow, Dataset, and DFR3Mapping Tables */}
                                <Grid sm={6}>
                                    <Box>
                                        <ResourceFilterBar title="Datasets" createLabel="Add from Service" />
                                        <ResourceTable
                                            resourceTitle="Datasets"
                                            columns={["name", "description", "date", "owner"]}
                                            data={projectDatasets}
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
                                        <ResourceFilterBar title="Workflows" createLabel="Add from Service" />
                                        <ResourceTable
                                            resourceTitle="Workflows"
                                            columns={["title", "description", "date", "creator", "isFinalized"]}
                                            data={projectWorkflows}
                                        />
                                        <Box mt={4} display="flex" justifyContent="center">
                                            <Pagination
                                                pageNumber={wfPageNumber}
                                                data={projectWorkflows}
                                                dataPerPage={5}
                                                previous={wfPreviousPage}
                                                next={wfNextPage}
                                            />
                                        </Box>
                                    </Box>
                                    <Box>
                                        <ResourceFilterBar title="DFR3 Mappings" createLabel="Add from Service" />
                                        <ResourceTable
                                            resourceTitle="DFR3 Mappings"
                                            columns={["name", "hazardType", "inventoryType", "mappingType", "owner"]}
                                            data={projectDFR3Mappings}
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
