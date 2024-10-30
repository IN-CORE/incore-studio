import React, { useEffect, useState } from "react";
import { Box, Typography, Container } from "@mui/joy";
import { Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@app/store";
import { getProject, getProjectDRF3Mappings } from "@app/reducer/projectSlice";
import Topbar from "@app/components/Home/Topbar";
import { ProjectBreadcrumb } from "@app/components/Project/ProjectBreadcrumb";
import { ProjectHeader } from "@app/components/Project/ProjectHeader";
import { ResourceTable } from "@app/components/Project/Resource/ResourceTable";
import { Pagination } from "@app/components/Home/Pagination";
import ResourceFilterBar from "@app/components/Project/Resource/ResourceFilterBar";
import Divider from "@mui/joy/Divider";
import { ProjectSidebar } from "@app/components/Project/ProjectSidebar";

import DFR3Icon from "@mui/icons-material/ShowChart";

const DFR3MappingPage = (): JSX.Element => {
    const { id } = useParams(); // Get projectId from the URL path
    const dispatch = useDispatch();

    // Redux state
    const project = useSelector((state: RootState) => state.project.project);

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
            // @ts-ignore
            dispatch(getProject(id));
        }
    }, [id]);

    useEffect(() => {
        // @ts-ignore
        dispatch(getProjectDRF3Mappings({ projectId: id, skip: (DFR3MappingPageNumber - 1) * 10, limit: 10 }));
    }, [id, DFR3MappingPageNumber]);

    const onSearchClick = () => {};
    const onFilterClick = () => {};
    const onCreateClick = () => {};
    const onSortClick = () => {};

    const projectDFR3Mappings = useSelector((state: RootState) => state.project.projectDFR3Mappings);

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
                                <Grid sm={10}>
                                    <ResourceFilterBar
                                        title="DFR3Mappings"
                                        icon={<DFR3Icon sx={{ verticalAlign: "middle" }} />}
                                        onSearchClick={onSearchClick}
                                        onFilterClick={onFilterClick}
                                        onCreateClick={onCreateClick}
                                        onSortClick={onSortClick}
                                        isTableView
                                        createLabel="Add from Service"
                                    />
                                    <ResourceTable
                                        columns={[
                                            "title",
                                            "hazardType",
                                            "inventoryType",
                                            "mappingType",
                                            "date",
                                            "creator"
                                        ]}
                                        data={projectDFR3Mappings}
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
            </Container>
        </>
    );
};

export default DFR3MappingPage;
