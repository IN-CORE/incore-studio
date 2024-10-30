import { Card, Typography, Box, CardContent, Chip } from "@mui/joy";
import { Grid } from "@mui/material";
import React from "react";
import { parseDateTime } from "@app/utils";
import { MapThumbnail } from "@app/components/Project/MapThumbnail";

function isHazard(resource: any): resource is Hazard {
    return "hazardDatasets" in resource;
}

function isVisualization(resource: any): resource is Visualization {
    return "layers" in resource;
}

function isDataset(resource: any): resource is Dataset {
    return "dataType" in resource && "format" in resource;
}

export const ResourceCards: React.FC<{ resources: Hazard[] | Visualization[] | Dataset[]; cardPerRow?: number }> = ({
    resources,
    cardPerRow
}) => {
    return (
        <Grid container spacing={3}>
            {resources.map((resource) => (
                <Grid
                    key={resource.id}
                    xs={12}
                    sm={12}
                    md={Math.ceil(12 / (cardPerRow ?? 2))}
                    lg={Math.ceil(12 / (cardPerRow ?? 2))}
                >
                    <Card variant="plain" sx={{ display: "flex", flexDirection: "column", height: "100%", padding: 0 }}>
                        <CardContent>
                            {isHazard(resource) ? (
                                <MapThumbnail id={resource?.hazardDatasets?.[0]?.datasetId} />
                            ) : isVisualization(resource) ? (
                                <MapThumbnail id={resource?.layers?.[0]?.layerId} />
                            ) : isDataset(resource) ? (
                                <MapThumbnail id={resource?.id} />
                            ) : (
                                <></>
                            )}
                            <Box sx={{ p: 1, flexGrow: 1, height: 80, overflow: "auto" }}>
                                <Typography level="body-sm" mb={1} textColor="primary.main">
                                    {isDataset(resource) ? resource.title : resource.name || "Name not provided"}
                                </Typography>
                                <Typography level="body-sm">
                                    {resource.description || "Description not provided"}
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
                            {/* Pill for resource type */}
                            <Chip size="sm" sx={{ borderRadius: 0 }}>
                                {isDataset(resource) ? resource.format : resource.type || "Type not provided"}
                            </Chip>

                            {/* Date on the right */}
                            <Typography level="body-sm">
                                {resource.date ? parseDateTime(resource.date) : "Date not provided"}
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};
