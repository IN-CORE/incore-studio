import React, { useEffect } from "react";
import { Box, Typography, Card, Grid, Table, Container } from "@mui/joy";
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

const ProjectPage = (): JSX.Element => {
    const { id } = useParams(); // Get projectId from the URL path
    const dispatch = useDispatch();

    // Redux state
    const project = useSelector((state: RootState) => state.project.project);
    const projectDatasets = useSelector((state: RootState) => state.project.projectDatasets);
    // const projectWorkflows = useSelector((state: RootState) => state.project.projectWorkflows);
    // const projectHazards = useSelector((state: RootState) => state.project.projectHazards);
    // const projectDFR3Mappings = useSelector((state: RootState) => state.project.projectDFR3Mappings);

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

                            {/* Workflow Section */}
                            <Typography level="h2" sx={{ mb: 2 }}>
                                Workflow
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                <Grid columns={6}>
                                    <Card variant="outlined" sx={{ p: 2 }}>
                                        <Typography level="h3">Joplin Infrastructure Damage</Typography>
                                        <Typography level="body-sm" sx={{ mt: 1 }}>
                                            Joplin building, power, and water damage analysis
                                        </Typography>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                                            <Typography>5 Executions</Typography>
                                            <Typography>3 Analyses</Typography>
                                        </Box>
                                    </Card>
                                </Grid>
                                <Grid columns={6}>
                                    <Card variant="outlined" sx={{ p: 2 }}>
                                        <Typography level="h3">Socio-Economic Impact of Joplin Tornado 2021</Typography>
                                        <Typography level="body-sm" sx={{ mt: 1 }}>
                                            Population dislocation analysis and economic impact analysis
                                        </Typography>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                                            <Typography>5 Executions</Typography>
                                            <Typography>3 Analyses</Typography>
                                        </Box>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Hazard Section */}
                            <Typography level="h2" sx={{ mb: 2 }}>
                                Hazard
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                <Grid columns={6}>
                                    <Card variant="outlined" sx={{ p: 2 }}>
                                        <Typography level="h3">2011 Joplin Tornado Hindcast</Typography>
                                        <Typography level="body-sm">EFS Joplin tornado 2011</Typography>
                                    </Card>
                                </Grid>
                                <Grid columns={6}>
                                    <Card variant="outlined" sx={{ p: 2 }}>
                                        <Typography level="h3">Joplin Model Based Tornado</Typography>
                                        <Typography level="body-sm">EFS random tornado</Typography>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Dataset Section */}
                            <DatasetTable projectDatasets={projectDatasets} />

                            {/* Visualization Section */}
                            <Typography level="h2" sx={{ mb: 2 }}>
                                Visualization
                            </Typography>
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                <Grid columns={6}>
                                    <Card variant="outlined" sx={{ p: 2 }}>
                                        <Typography level="h3">Joplin Building Damage</Typography>
                                        <Typography level="body-sm">Buildings, tornado</Typography>
                                    </Card>
                                </Grid>
                                <Grid columns={6}>
                                    <Card variant="outlined" sx={{ p: 2 }}>
                                        <Typography level="h3">Building Damage Histogram</Typography>
                                        <Typography level="body-sm">Building damage</Typography>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* DFR3 Mapping Section */}
                            <Typography level="h2" sx={{ mb: 2 }}>
                                DFR3 Mapping
                            </Typography>
                            <Table aria-label="dfr3-mapping" hoverRow>
                                <thead>
                                    <tr>
                                        <th>Mapping Name</th>
                                        <th>Hazard Type</th>
                                        <th>Inventory Type</th>
                                        <th>Creator</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Joplin EFP Fragility Mapping</td>
                                        <td>Tornado</td>
                                        <td>Electric Power Facility</td>
                                        <td>Owner Name</td>
                                    </tr>
                                    {/* Add more mapping rows as needed */}
                                </tbody>
                            </Table>
                        </>
                    )}
                </Box>
            </Container>
        </>
    );
};

export default ProjectPage;
