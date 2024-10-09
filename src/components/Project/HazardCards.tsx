import { Card, Grid, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import { parseDateTime } from "@app/utils";

export const HazardCards = () => {
    const projectHazards = useSelector((state: RootState) => state.project.projectHazards);

    return (
        <>
            <Typography level="h2" sx={{ mb: 2 }}>
                Hazard
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {/* Loop through filtered datasets and render a row for each one */}
                {projectHazards.map((hazard) => (
                    <Grid columns={6}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                            <Typography level="h3">{hazard.name || "Name not provided"}</Typography>
                            <Typography level="body-sm">{hazard.description || "Description not provided"}</Typography>
                            <Typography level="body-sm">{hazard.type || "Type not provided"}</Typography>
                            <Typography level="body-sm">
                                {hazard.date ? parseDateTime(hazard.date) : "Date not provided"}
                            </Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </>
    );
};
