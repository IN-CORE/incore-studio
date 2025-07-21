import React, { useState } from "react";
import { Box, Button, Typography, Divider } from "@mui/joy";
import WorkflowIcon from "@mui/icons-material/AccountTree";
import PlaceIcon from "@mui/icons-material/Place";
import PersonIcon from "@mui/icons-material/Person";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import { parseDateTime } from "@app/utils";
import { EditProjectDialog } from "@app/components/Project/EditProject";
import EditIcon from "@mui/icons-material/Edit";

export const ProjectHeader = ({ project }: { project: Project }) => {
    const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);

    return (
        <>
            <EditProjectDialog
                open={editProjectDialogOpen}
                onClose={() => setEditProjectDialogOpen(false)}
                project={project}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4, ml: 2, mt: 5 }}>
                {/* Left section with project name and description */}
                <Box>
                    <Box sx={{ display: "flex", alignItems: "baseline" }}>
                        <Typography level="h1" textColor="primary.main" sx={{ fontSize: "24px", mr: 1 }}>
                            {project.name}
                        </Typography>
                        <Button
                            size="sm"
                            variant="plain"
                            color="neutral"
                            onClick={() => setEditProjectDialogOpen(true)}
                        >
                            <EditIcon fontSize="small" />
                        </Button>
                    </Box>
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
                        <Typography sx={{ textWrap: "wrap" }}>{project.region}</Typography>
                    </Box>
                    <Divider orientation="vertical" />

                    {/* Owner */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "5em" }}>
                        <PersonIcon />
                        <Typography sx={{ textWrap: "wrap" }}>{project.owner}</Typography>
                    </Box>
                    <Divider orientation="vertical" />

                    {/* Date */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "10em" }}>
                        <CalendarIcon />
                        <Typography>{project.date ? parseDateTime(project.date) : "No date"}</Typography>
                    </Box>
                </Box>
            </Box>
        </>
    );
};
