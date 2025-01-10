import React, { useState } from "react";
import {
    Button,
    Card,
    CardContent,
    Typography,
    Box,
    Chip,
    Dropdown,
    IconButton,
    Menu,
    MenuButton,
    MenuItem
} from "@mui/joy";
import DatasetIcon from "@mui/icons-material/FormatListBulleted";
import WorkflowIcon from "@mui/icons-material/AccountTree";
import DFR3Icon from "@mui/icons-material/ShowChart";
import HazardIcon from "@mui/icons-material/Storm";
import VisualizationIcon from "@mui/icons-material/Map";
import { parseDateTime } from "@app/utils";
import { useNavigate } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { deleteProject } from "@app/reducer/projectSlice";
import { IncoreDialog } from "@app/components/IncoreDialog";
import { useDispatch } from "react-redux";

interface ProjectCardProps {
    project: Project;
}

export const ProjectCard = (props: ProjectCardProps): JSX.Element => {
    const { project } = props;

    // Calculate counts
    const hazardsCount = project.hazards.length;
    const datasetsCount = project.datasets.length;
    const workflowsCount = project.workflows.length;
    const dfr3MappingsCount = project.dfr3Mappings.length;
    const visualizationCount = project.visualizations.length;

    const navigate = useNavigate();

    // delete
    const dispatch = useDispatch();
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const handleCloseDialog = () => {
        setOpenDeleteDialog(false);
    };
    const handleDelete = () => {
        if (project.id) {
            // @ts-ignore
            dispatch(deleteProject(project.id));
        }
        setOpenDeleteDialog(false);
    };

    return (
        <Card sx={{ width: 440, position: "relative" }}>
            {/* Menu Icon on Top-Right */}
            <Dropdown>
                <MenuButton
                    slots={{ root: IconButton }}
                    slotProps={{
                        root: {
                            sx: { position: "absolute", top: 8, right: 0, zIndex: 1000 },
                            variant: "plain",
                            color: "neutral"
                        }
                    }}
                >
                    <MoreVertIcon />
                </MenuButton>
                <Menu placement="bottom-start">
                    <MenuItem
                        onClick={() => {
                            setOpenDeleteDialog(true);
                        }}
                    >
                        Delete
                    </MenuItem>
                </Menu>
            </Dropdown>
            <IncoreDialog
                open={openDeleteDialog}
                onClose={handleCloseDialog}
                onAction={handleDelete}
                message="Are you sure you want to delete this project? This action cannot be undone."
                dialogTitle="Confirm Deletion"
                actionButtonName="Delete"
            />
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Project Name and Description */}
                <Box sx={{ display: "flex", flexDirection: "column", width: "95%" }}>
                    <Typography level="title-lg" textColor="primary.main">
                        {project.name.toUpperCase()}
                    </Typography>
                    <Typography level="body-xs" mb={2}>
                        {project.date ? parseDateTime(project.date) : "No date"}
                    </Typography>
                    <Typography level="body-sm">{project.description}</Typography>
                </Box>

                {/* Hazards, Datasets, Workflows, DFR3 Mappings, Visualization with Icons */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* Hazards */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        <HazardIcon fontSize="small" />
                        <Typography level="body-md" ml={1}>
                            Hazard Scenarios
                        </Typography>
                        <Typography
                            level="body-md"
                            textColor={hazardsCount > 0 ? "success.400" : "danger.main"}
                            sx={{ fontWeight: 600 }}
                        >
                            &nbsp;× {hazardsCount}
                        </Typography>
                    </Box>
                    {/* Visualization */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        <VisualizationIcon fontSize="small" />
                        <Typography level="body-md" ml={1}>
                            Visualizations
                        </Typography>
                        <Typography
                            level="body-md"
                            textColor={visualizationCount > 0 ? "success.400" : "danger.main"}
                            sx={{ fontWeight: 600 }}
                        >
                            &nbsp;× {visualizationCount}
                        </Typography>{" "}
                    </Box>
                    {/* Datasets */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        <DatasetIcon fontSize="small" />
                        <Typography level="body-md" ml={1}>
                            Datasets
                        </Typography>
                        <Typography
                            level="body-md"
                            textColor={datasetsCount > 0 ? "success.400" : "danger.main"}
                            sx={{ fontWeight: 600 }}
                        >
                            &nbsp;× {datasetsCount}
                        </Typography>
                    </Box>

                    {/* Workflows */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        <WorkflowIcon fontSize="small" />
                        <Typography level="body-md" ml={1}>
                            Workflows
                        </Typography>
                        <Typography
                            level="body-md"
                            textColor={workflowsCount > 0 ? "success.400" : "danger.main"}
                            sx={{ fontWeight: 600 }}
                        >
                            &nbsp;× {workflowsCount}
                        </Typography>
                    </Box>

                    {/* DFR3 Mappings */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        <DFR3Icon fontSize="small" />
                        <Typography level="body-md" ml={1}>
                            DFR3 Mappings
                        </Typography>
                        <Typography
                            level="body-md"
                            textColor={dfr3MappingsCount > 0 ? "success.400" : "danger.main"}
                            sx={{ fontWeight: 600 }}
                        >
                            &nbsp;× {dfr3MappingsCount}
                        </Typography>{" "}
                    </Box>
                </Box>
                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-start"
                    }}
                >
                    <Chip size="sm" sx={{ borderRadius: 0 }}>
                        {project.region}
                    </Chip>
                </Box>
                {/* Button positioned at bottom-right */}
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
                    onClick={() => {
                        navigate(`/project/${project.id}`);
                    }}
                >
                    Open
                </Button>
            </CardContent>
        </Card>
    );
};
