import * as React from "react";
import { AspectRatio, Button, Card, CardContent, Typography, Chip, Box } from "@mui/joy";
import workflowImage from "../../images/workflow.png";

export const ProjectCard = (): JSX.Element => {
    return (
        <Card sx={{ width: 440, position: "relative" }}>
            <AspectRatio minHeight="120px" maxHeight="200px">
                <img src={workflowImage} loading="lazy" alt="" />
            </AspectRatio>
            <CardContent orientation="horizontal" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography level="title-lg">Project Name</Typography>
                    <Typography level="body-sm">April 24 to May 02, 2021</Typography>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-start"
                    }}
                >
                    <Chip size="sm" sx={{ borderRadius: 0 }}>
                        Earthquake
                    </Chip>
                    <Chip size="sm" sx={{ borderRadius: 0 }}>
                        Hurricane
                    </Chip>
                    <Chip size="sm" sx={{ borderRadius: 0 }}>
                        Tornado
                    </Chip>
                </Box>
            </CardContent>
            <Button
                variant="solid"
                size="md"
                color="primary"
                aria-label="Open"
                sx={{
                    position: "absolute",
                    bottom: 15,
                    right: 15,
                    fontWeight: 600
                }}
            >
                Open
            </Button>
        </Card>
    );
};
