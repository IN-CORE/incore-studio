import { Card, Typography, Box, CardContent, Chip } from "@mui/joy";
import { Grid } from "@mui/material";
import React from "react";
import { parseDateTime } from "@app/utils";
import { MapThumbnail } from "@app/components/Project/MapThumbnail";

export const HazardCards: React.FC<{ projectHazards: Hazard[] }> = ({ projectHazards }) => {
    return (
        <Grid container spacing={3}>
            {projectHazards.map((hazard) => (
                <Grid key={hazard.id} xs={12} sm={12} md={6} lg={6}>
                    <Card variant="plain" sx={{ display: "flex", flexDirection: "column", height: "100%", padding: 0 }}>
                        <CardContent>
                            {/* TODO take first layer for thumbnail */}
                            <MapThumbnail id={hazard?.hazardDatasets[0]?.datasetId} />
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
    );
};
