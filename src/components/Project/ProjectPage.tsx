import React from "react";
import { Box, Typography, Card, Grid, Table, Avatar } from "@mui/joy";
import { useParams } from "react-router-dom";

const ProjectPage = (): JSX.Element => {
    const { projectId } = useParams(); // Get projectId from the URL path

    return (
        <Box sx={{ p: 3 }}>
            {/* Header Section */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
                <Box>
                    <Typography level="h1" sx={{ fontSize: "24px" }}>
                        {projectId} Joplin Hindcast Tornado Analysis
                    </Typography>
                    <Typography level="body-md" sx={{ mt: 1 }}>
                        On May 22, 2011 the city of Joplin, Missouri, USA, was devastated by an EF-5 tornado...
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Typography>5 Workflows</Typography>
                    <Typography>ILLINOIS</Typography>
                    <Typography>Project Owner</Typography>
                    <Typography>Sep.25, 5:48 PM</Typography>
                    <Avatar sx={{ bgcolor: "primary.500" }}>J</Avatar>
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

            {/* Datasets Section */}
            <Typography level="h2" sx={{ mb: 2 }}>
                Datasets
            </Typography>
            <Table aria-label="datasets" hoverRow>
                <thead>
                    <tr>
                        <th>Dataset Name</th>
                        <th>Description</th>
                        <th>Provenance</th>
                        <th>Creator</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Joplin Buildings</td>
                        <td>Buildings in the city of Joplin</td>
                        <td>From data service</td>
                        <td>InCOREdev</td>
                    </tr>
                    {/* Add more dataset rows as needed */}
                </tbody>
            </Table>

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
        </Box>
    );
};

export default ProjectPage;
