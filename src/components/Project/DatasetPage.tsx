import React, { useEffect, useState } from "react";
import { Box, Typography, Container } from "@mui/joy";
import { Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@app/store";
import { getProject, getProjectDatasets } from "@app/reducer/projectSlice";
import Topbar from "@app/components/Home/Topbar";
import { ProjectBreadcrumb } from "@app/components/Project/ProjectBreadcrumb";
import { ProjectHeader } from "@app/components/Project/ProjectHeader";
import { ResourceTable } from "@app/components/Project/ResourceTable";
import { Pagination } from "@app/components/Home/Pagination";
import ResourceFilterBar from "@app/components/Project/ResourceFilterBar";
import Divider from "@mui/joy/Divider";
// import { ResourceCards } from "@app/components/Project/ResourceCards";
import { ProjectSidebar } from "@app/components/Project/ProjectSidebar";

import DatasetIcon from "@mui/icons-material/FormatListBulleted";

const DatasetPage = (): JSX.Element => {
    const { id } = useParams(); // Get projectId from the URL path
    const dispatch = useDispatch();

    // Redux state
    const project = useSelector((state: RootState) => state.project.project);

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
            // @ts-ignore
            dispatch(getProject(id));
        }
    }, [id]);

    useEffect(() => {
        // @ts-ignore
        dispatch(getProjectDatasets({ projectId: id, skip: (datasetPageNumber - 1) * 10, limit: 10 }));
    }, [id, datasetPageNumber]);

    const onSearchClick = () => {};
    const onFilterClick = () => {};
    const onCreateClick = () => {};
    const onSortClick = () => {};

    const projectDatasets = useSelector((state: RootState) => state.project.projectDatasets);

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
                            <Divider />
                            <Grid container spacing={5} mt={3} ml={0}>
                                <Grid sm={2}>
                                    <ProjectSidebar id={project.id} />
                                </Grid>
                                {/* /!* Left Column: Hazard and Visualization Cards *!/ */}
                                {/* <Grid sm={10}> */}
                                {/*    <Box mb={1}> */}
                                {/*        <ResourceFilterBar */}
                                {/*            title="Hazards" */}
                                {/*            icon={<HazardIcon sx={{ verticalAlign: "middle" }} />} */}
                                {/*            createLabel="Add from Service" */}
                                {/*        /> */}
                                {/*        <ResourceCards resources={projectHazards} /> */}
                                {/*        <Box mt={4} display="flex" justifyContent="center"> */}
                                {/*            <Pagination */}
                                {/*                pageNumber={hazardPageNumber} */}
                                {/*                data={projectHazards} */}
                                {/*                dataPerPage={2} */}
                                {/*                previous={hazardPreviousPage} */}
                                {/*                next={hazardNextPage} */}
                                {/*            /> */}
                                {/*        </Box> */}
                                {/*    </Box> */}
                                {/*    <Box> */}
                                {/*        <ResourceFilterBar */}
                                {/*            title="Visualization" */}
                                {/*            icon={<VisualizationIcon sx={{ verticalAlign: "middle" }} />} */}
                                {/*            createLabel="Create Visualization" */}
                                {/*        /> */}
                                {/*        <ResourceCards resources={projectVisualizations} /> */}
                                {/*        <Box mt={4} display="flex" justifyContent="center"> */}
                                {/*            <Pagination */}
                                {/*                pageNumber={visPageNumber} */}
                                {/*                data={projectVisualizations} */}
                                {/*                dataPerPage={2} */}
                                {/*                previous={visPreviousPage} */}
                                {/*                next={visNextPage} */}
                                {/*            /> */}
                                {/*        </Box> */}
                                {/*    </Box> */}
                                {/* </Grid> */}
                                {/* Right Column: Workflow, Dataset, and DFR3Mapping Tables */}
                                <Grid sm={10}>
                                    <ResourceFilterBar
                                        title="Datasets"
                                        icon={<DatasetIcon sx={{ verticalAlign: "middle" }} />}
                                        onSearchClick={onSearchClick}
                                        onFilterClick={onFilterClick}
                                        onCreateClick={onCreateClick}
                                        onSortClick={onSortClick}
                                        createLabel="Add from Service"
                                    />
                                    <ResourceTable
                                        resourceTitle="Datasets"
                                        columns={["title", "description", "date", "owner"]}
                                        data={projectDatasets}
                                    />
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
            </Container>
        </>
    );
};

export default DatasetPage;
