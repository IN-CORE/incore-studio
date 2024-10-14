import React from "react";
import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import WorkflowIcon from "@mui/icons-material/Polyline";
import PlaceIcon from "@mui/icons-material/Place";
import PersonIcon from "@mui/icons-material/Person";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import { parseDateTime } from "@app/utils";
import Divider from "@mui/joy/Divider";

export const ProjectHeader = ({ project }: { project: Project }) => {
    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4, ml: 2, mt: 5 }}>
            {/* Left section with project name and description */}
            <Box>
                <Typography level="h1" textColor="primary.main" sx={{ fontSize: "24px" }}>
                    {project.name}
                </Typography>
                <Typography level="body-sm" textColor="primary.main" sx={{ mt: 1 }}>
                    {project.description}
                </Typography>
            </Box>

            {/* Right section with icons and project details */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                {/* Workflows */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "8em" }}>
                    <WorkflowIcon />
                    <Typography>{project.workflows.length} Workflows</Typography>
                </Box>
                <Divider orientation="vertical" />

                {/* Region */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "5em" }}>
                    <PlaceIcon />
                    <Typography>{project.region}</Typography>
                </Box>
                <Divider orientation="vertical" />

                {/* Owner */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "5em" }}>
                    <PersonIcon />
                    <Typography>{project.owner}</Typography>
                </Box>
                <Divider orientation="vertical" />

                {/* Date */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "10em" }}>
                    <CalendarIcon />
                    <Typography>{project.date ? parseDateTime(project.date) : "No date"}</Typography>
                </Box>
            </Box>
        </Box>
    );
};
