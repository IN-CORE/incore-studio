import { Card, Grid, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";

export const VisualizationCards = () => {
    const projectVisualizations = useSelector((state: RootState) => state.project.projectVisualizations);

    return (
        <>
            <Typography level="h2" sx={{ mb: 2 }}>
                Visualization
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {/* Loop through filtered visualization and render a row for each one */}
                {projectVisualizations.map((viz) => (
                    <Grid columns={6}>
                        <Card variant="outlined" sx={{ p: 2 }}>
                            <Typography level="h3">{viz.type || "Type not provided"}</Typography>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </>
    );
};
