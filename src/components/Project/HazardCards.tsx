import { Card, Grid, Typography } from "@mui/material";
import React from "react";

export const HazardCards = () => {
    return (
        <>
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
        </>
    );
};
