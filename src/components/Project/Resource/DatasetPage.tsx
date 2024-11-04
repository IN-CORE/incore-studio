import React, { useEffect, useState } from "react";
import { Box, Typography, Container } from "@mui/joy";
import { Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@app/store";
import { getProject, getProjectDatasets } from "@app/reducer/projectSlice";
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

    // Table view vs Card view
    const [isTableView, setIsTableView] = useState(false); // Toggle state for view mode
    const onViewChangeClick = () => {
        setIsTableView((prev) => !prev); // Toggle between table and card view
    };

    const projectDatasets = useSelector((state: RootState) => state.project.projectDatasets);

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
                                        onFilterClick={onFilterClick}
                                        onCreateClick={onCreateClick}
                                        onSortClick={onSortClick}
                                        onViewChangeClick={onViewChangeClick}
                                        isTableView={isTableView}
                                        createLabel="Add from Service"
                                    />
                                    {isTableView ? (
                                        <ResourceTable
                                            columns={["title", "description", "date", "owner"]}
                                            data={projectDatasets}
                                        />
                                    ) : (
                                        <ResourceCards resources={projectDatasets} cardPerRow={4} />
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
            </Container>
        </>
    );
};

export default DatasetPage;
