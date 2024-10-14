import { Box, Card, CardContent, Chip, Grid, IconButton, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import { parseDateTime } from "@app/utils";

export const VisualizationCards = () => {
    const projectVisualizations = useSelector((state: RootState) => state.project.projectVisualizations);

    return (
        <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} pl={2} pr={2}>
                <Typography level="h4">Visualizations</Typography>
                <Box display="flex" alignItems="center">
                    <IconButton>
                        <SearchIcon />
                    </IconButton>
                    <IconButton>
                        <FilterListIcon />
                    </IconButton>
                    <IconButton>
                        <AddIcon />
                        <Typography level="body-sm" ml={1}>
                            Create Visualization
                        </Typography>
                    </IconButton>
                </Box>
            </Box>
            {/* Wrapping Cards inside Grid Container */}
            <Grid container spacing={3}>
                {projectVisualizations.map((visualization) => (
                    <Grid key={visualization.id} xs={12} sm={12} md={6} lg={6}>
                        <Card variant="plain" sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                            <CardContent>
                                <Box
                                    sx={{
                                        height: 200,
                                        backgroundColor: "#e0e0e0",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                >
                                    <Typography level="body-sm">Visualization Placeholder</Typography>
                                </Box>
                                <Box sx={{ p: 1, flexGrow: 1, height: 80, overflow: "auto" }}>
                                    <Typography level="body-sm" mb={1} textColor="primary.main">
                                        {visualization.name || "Name not provided"}
                                    </Typography>
                                    <Typography level="body-sm">
                                        {visualization.description || "Description not provided"}
                                    </Typography>
                                </Box>
                            </CardContent>
                            <Box
                                sx={{
                                    mt: "auto",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center"
                                }}
                            >
                                {/* Pill for hazard type */}
                                <Chip size="sm" sx={{ borderRadius: 0 }}>
                                    {visualization.type || "Type not provided"}
                                </Chip>

                                {/* Date on the right */}
                                <Typography level="body-sm">
                                    {visualization.date ? parseDateTime(visualization.date) : "Date not provided"}
                                </Typography>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <Grid container spacing={3} />
        </>
    );
};
