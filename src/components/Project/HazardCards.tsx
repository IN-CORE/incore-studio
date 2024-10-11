import { Card, Grid, Typography, IconButton, Box, CardContent, Chip } from "@mui/joy";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import { parseDateTime } from "@app/utils";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";

export const HazardCards = () => {
    const projectHazards = useSelector((state: RootState) => state.project.projectHazards);

    return (
        <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography level="h4">Hazards</Typography>
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
                            Add from service
                        </Typography>
                    </IconButton>
                </Box>
            </Box>
            {/* Wrapping Cards inside Grid Container */}
            <Grid container spacing={3}>
                {projectHazards.map((hazard) => (
                    <Grid key={hazard.id} columns={4}>
                        <Card variant="plain" sx={{ width: 300 }}>
                            <CardContent>
                                <Box
                                    sx={{
                                        height: 150,
                                        backgroundColor: "#e0e0e0",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center"
                                    }}
                                >
                                    <Typography level="body-sm">Hazard Placeholder</Typography>
                                </Box>
                                <Box sx={{ p: 1, flexGrow: 1, height: 80, overflow: "auto" }}>
                                    <Typography level="body-sm" mb={1} textColor="primary.main">
                                        {hazard.name || "Name not provided"}
                                    </Typography>
                                    <Typography level="body-sm">
                                        {hazard.description || "Description not provided"}
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
                                    {hazard.type || "Type not provided"}
                                </Chip>

                                {/* Date on the right */}
                                <Typography level="body-sm">
                                    {hazard.date ? parseDateTime(hazard.date) : "Date not provided"}
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
