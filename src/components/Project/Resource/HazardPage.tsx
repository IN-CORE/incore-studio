import React, { useEffect, useState } from "react";
import { Box, Typography, Container } from "@mui/joy";
import { Grid } from "@mui/material";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import {
    addLayerToVisualization,
    deleteProjectHazards,
    getProject,
    getProjectHazards
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
import { useAppDispatch } from "@app/store/hooks";

import HazardIcon from "@mui/icons-material/Storm";

const HazardPage = (): JSX.Element => {
    const { id } = useParams(); // Get projectId from the URL path
    const appDispatch = useAppDispatch();

    // Redux state
    const project = useSelector((state: RootState) => state.project.project);
    const deletedHazardIds = useSelector((state: RootState) => state.project.deletedHazardIds);

    // Pagination states
    const [hazardPageNumber, setHazardPageNumber] = useState(1);
    const hazardNextPage = () => {
        setHazardPageNumber((prevPage) => prevPage + 1);
    };
    const hazardPreviousPage = () => {
        setHazardPageNumber((prevPage) => Math.max(prevPage - 1, 1)); // Prevent going below page 1
    };

    useEffect(() => {
        if (id) {
            appDispatch(getProject(id));
        }
    }, [id]);

    useEffect(() => {
        if (id) appDispatch(getProjectHazards({ projectId: id, skip: (hazardPageNumber - 1) * 10, limit: 10 }));
    }, [id, hazardPageNumber, deletedHazardIds]);

    const onSearchClick = () => {};
    const onFilterClick = () => {};
    const onCreateClick = () => {};
    const onSortClick = () => {};

    // Table view vs Card view
    const [isTableView, setIsTableView] = useState(false); // Toggle state for view mode
    const onViewChangeClick = () => {
        setIsTableView((prev) => !prev); // Toggle between table and card view
    };

    const projectHazards = useSelector((state: RootState) => state.project.projectHazards);

    // delete function
    const deleteHazardFunc = (projectId: string, hazard: Hazard) => {
        appDispatch(deleteProjectHazards({ projectId, hazardIds: [hazard.id] }));
    };

    // add to visualization function
    const addHazardVisualizationFunc = (projectId: string, visualizationId: string, hazard: Hazard) => {
        // Create layers array by mapping over each datasetId in hazard.HazardDatasets
        const layers = hazard.hazardDatasets.map((hazardDataset: HazardDataset) => ({
            workspace: "incore",
            layerId: hazardDataset.datasetId
        }));

        // Dispatch the action with the new layers array
        appDispatch(addLayerToVisualization({ projectId, visualizationId, layers }));
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
                            <ProjectBreadcrumb
                                project={{ href: `/project/${project.id}`, label: project.name }}
                                resource="Hazards"
                            />
                            <ProjectHeader project={project} />
                            <Divider />
                            <Grid container spacing={5} mt={3} ml={0}>
                                <Grid sm={2}>
                                    <ProjectSidebar id={project.id} />
                                </Grid>
                                <Grid sm={10}>
                                    <ResourceFilterBar
                                        title="Hazards"
                                        icon={<HazardIcon sx={{ verticalAlign: "middle" }} />}
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
                                            columns={["name", "description", "date", "creator"]}
                                            data={projectHazards}
                                            projectId={project.id}
                                            deleteFunc={deleteHazardFunc}
                                        />
                                    ) : (
                                        <ResourceCards
                                            resources={projectHazards}
                                            cardPerRow={4}
                                            projectId={project.id}
                                            deleteFunc={deleteHazardFunc}
                                            addVisualizationFunc={addHazardVisualizationFunc}
                                        />
                                    )}
                                    <Box mt={4} display="flex" justifyContent="center">
                                        <Pagination
                                            pageNumber={hazardPageNumber}
                                            data={projectHazards}
                                            dataPerPage={10}
                                            previous={hazardPreviousPage}
                                            next={hazardNextPage}
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

export default HazardPage;
