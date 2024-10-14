import { Box, Card, CardContent, Chip, Grid, Typography } from "@mui/material";
import React from "react";
import { parseDateTime } from "@app/utils";
import { MapThumbnail } from "@app/components/Project/MapThumbnail";

export const VisualizationCards: React.FC<{ projectVisualizations: Visualization[] }> = ({ projectVisualizations }) => {
    return (
        <>
            {/* Wrapping Cards inside Grid Container */}
            <Grid container spacing={3}>
                {projectVisualizations.map((visualization) => (
                    <Grid key={visualization.id} xs={12} sm={12} md={6} lg={6}>
                        <Card
                            variant="plain"
                            sx={{ display: "flex", flexDirection: "column", height: "100%", padding: 0 }}
                        >
                            <CardContent>
                                <MapThumbnail id={visualization?.layers?.[0]?.layerId} />
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
        </>
    );
};
