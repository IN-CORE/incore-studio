import React from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Box, Button, Typography, Container, Divider, Grid, Stack, Sheet, Tooltip, Snackbar, Chip } from "@mui/joy";

import {
    useAppDispatch,
    useAppSelector,
    useOutputDatasetsSynchronizationPolling,
    useWorkflowAndExecutionCount,
    useUserUsageStats,
    useHazardStats
} from "@app/store/hooks";
import {
    getProject,
    addDatasetToProject,
    addHazardToProject,
    addDFR3MappingToProject
} from "@app/reducer/projectSlice";
import withLoading from "@app/components/hocs/withLoading";
import withErrorHandling from "@app/components/hocs/withErrorHandling";
import { ProjectBreadcrumb } from "@app/components/Project/ProjectBreadcrumb";
import { ProjectHeader } from "@app/components/Project/ProjectHeader";
import { ProjectSidebar } from "@app/components/Project/ProjectSidebar";
import { AddFromServiceDialog } from "@app/components/Project/Resource/AddFromServiceDialog";
import { CreateWorkflowDialog } from "@app/components/Project/CreateWorkflowDialog";
import { CreateVisualizationDialog } from "@app/components/Project/Resource/VisualizationDialog";
import DashboardItemTitleBar from "@app/components/Project/Resource/DashboardItemTitleBar";
import { useTheme } from "@mui/joy/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

import DatasetIcon from "@mui/icons-material/FormatListBulleted";
import WorkflowIcon from "@mui/icons-material/AccountTree";
import DFR3Icon from "@mui/icons-material/ShowChart";
import HazardIcon from "@mui/icons-material/Storm";
import VisualizationIcon from "@mui/icons-material/Map";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { CreateHazardDialog } from "@app/components/Project/Resource/CreateHazardDialog";
import { CreateDatasetDialog } from "@app/components/Project/Resource/CreateDatasetDialog";
import ItemCountTable from "./Resource/ItemCountTable";

const ProjectDashboardComponent: React.FC = (): JSX.Element => {
    const theme = useTheme();
    const isLgUp = useMediaQuery(theme.breakpoints.up("lg"));
    const isXsUp = useMediaQuery(theme.breakpoints.up("xs"));

    const appDispatch = useAppDispatch();
    const navigate = useNavigate();

    const project = useAppSelector((state) => state.project.project);
    const projectWorkflows = useAppSelector((state) => state.project.projectWorkflows);
    const success = useAppSelector((state) => state.project.success);
    const error = useAppSelector((state) => state.project.error);

    const { workflowCount, executionCount, execByWorkflow } = useWorkflowAndExecutionCount(projectWorkflows);

    const { hazardStats, hazardCounts } = useHazardStats(project ? project.hazards : []);
    const userUsageStats = useUserUsageStats();
    // const usageRingSize = "100px";

    const getDatasetsCountsByType = (datasets: Dataset[]): { label: string; value: number }[] => {
        const datasetCounts = datasets.reduce(
            (acc, dataset) => {
                const type = dataset.type;
                if (acc[type]) {
                    acc[type] += 1;
                } else {
                    acc[type] = 1;
                }
                return acc;
            },
            {} as Record<string, number>
        );

        return Object.entries(datasetCounts)
            .map(([key, value]) => ({ label: key, value }))
            .sort((a, b) => b.value - a.value);
    };

    // create visualization
    const [openCreateVisDialog, setOpenCreateVisDialog] = React.useState(false);
    const handleCloseCreateVisDialog = () => {
        setOpenCreateVisDialog(false);
    };
    const onCreateVisClick = () => {
        setOpenCreateVisDialog(true);
    };

    const getTwoMostRecentVisualizations = () => {
        if (!project || !project.visualizations) return [];

        // Create a copy before sorting to avoid mutating immutable data
        const sorted = [...project.visualizations].sort((a, b) => {
            const dateA = new Date(a.date || 0).getTime();
            const dateB = new Date(b.date || 0).getTime();
            return dateB - dateA; // newest first
        });

        // Return the two most recent
        return sorted.slice(0, 2);
    };

    // create workflow
    const [openCreateWorkflowDialog, setOpenCreateWorkflowDialog] = React.useState(false);
    const handleCloseCreateWorkflowDialog = () => {
        setOpenCreateWorkflowDialog(false);
    };
    const onCreateWorkflowClick = () => {
        setOpenCreateWorkflowDialog(true);
    };

    // snackbar
    const [snackbarOpen, setSnackbarOpen] = React.useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState<string>("");
    const [snackbarColor, setSnackbarColor] = React.useState<"success" | "danger" | "warning" | "neutral">("neutral");

    React.useEffect(() => {
        if (error) {
            setSnackbarMessage(`Error: ${error}`);
            setSnackbarColor("danger");
            setSnackbarOpen(true);
        } else if (success) {
            setSnackbarMessage(success);
            setSnackbarColor("success");
            setSnackbarOpen(true);
        }
    }, [success, error]);

    // Add resources to project
    // Create dataset
    const [openCreateDatasetDialog, setOpenCreateDatasetDialog] = React.useState(false);
    // Add dataset to project from service
    const [openAddDatasetFromServiceDialog, setOpenAddDatasetFromServiceDialog] = React.useState(false);
    const addDatasetFunc = (projectId: string, resource: Dataset) => {
        appDispatch(addDatasetToProject({ projectId, datasets: [resource] }));
        setOpenAddDatasetFromServiceDialog(false);
    };

    // Add hazard to project from service
    const [openAddHazardFromServiceDialog, setOpenAddHazardFromServiceDialog] = React.useState(false);
    const addHazardFunc = (projectId: string, resource: Hazard) => {
        appDispatch(addHazardToProject({ projectId, hazards: [resource] }));
        setOpenAddHazardFromServiceDialog(false);
    };

    // Create hazard
    const [openCreateHazardDialog, setOpenCreateHazardDialog] = React.useState(false);

    // Add hazard to project from service
    const [openAddDFR3MappingFromServiceDialog, setOpenAddDFR3MappingFromServiceDialog] = React.useState(false);
    const addDFR3MappingFunc = (projectId: string, resource: DFR3Mapping) => {
        appDispatch(addDFR3MappingToProject({ projectId, dfr3Mappings: [resource] }));
        setOpenAddDFR3MappingFromServiceDialog(false);
    };

    if (!project) {
        return <Typography level="h3">Project not found</Typography>;
    }

    return (
        <>
            {/* Header Section */}
            <ProjectBreadcrumb project={{ href: `/project/${project.id}`, label: project.name }} />
            <ProjectHeader project={project} />
            <Divider />
            <Grid container spacing={2} sx={{ mt: 3, ml: 0 }}>
                <Grid sm={2}>
                    <ProjectSidebar id={project.id} />
                </Grid>
                <Grid sm={10}>
                    <Stack
                        spacing={3}
                        direction={{ xs: "column", sm: "column", md: "column", lg: "row" }}
                        sx={{ width: "100%" }}
                        justifyContent="space-between"
                        divider={<Divider orientation={isLgUp ? "vertical" : "horizontal"} />}
                    >
                        {/* workflow section */}
                        <Box
                            sx={{
                                width: "100%",
                                mt: 1,
                                display: "flex",
                                flexDirection: "column",
                                height: 450
                            }}
                        >
                            <DashboardItemTitleBar
                                title="Workflows"
                                link={`/project/${project.id}/workflows`}
                                icon={<WorkflowIcon sx={{ color: "#0000008A" }} />}
                                total={workflowCount.toString()}
                                btnList={[
                                    {
                                        label: "Create Workflow",
                                        icon: <AddRoundedIcon />,
                                        sx: { backgroundColor: "primary.main" },
                                        onClick: onCreateWorkflowClick
                                    }
                                ]}
                            />
                            <Box sx={{ flex: 1 }}>
                                <Stack direction="column" spacing={3} sx={{ width: "100%" }}>
                                    <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" />}>
                                        <Stack direction="row" spacing={2}>
                                            <Typography
                                                level="title-md"
                                                sx={{
                                                    font: "SF Pro, sans-serif",
                                                    fontWeight: 510,
                                                    fontStyle: "medium",
                                                    fontSize: "18px",
                                                    lineHeight: "24px",
                                                    letterSpacing: "0.17px",
                                                    color: "#00000099"
                                                }}
                                            >
                                                Workflow Count:
                                            </Typography>
                                            <Typography
                                                level="title-md"
                                                sx={{
                                                    font: "SF Pro, sans-serif",
                                                    fontWeight: 510,
                                                    fontStyle: "medium",
                                                    fontSize: "18px",
                                                    lineHeight: "24px",
                                                    letterSpacing: "0.17px"
                                                }}
                                            >
                                                {workflowCount}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={2}>
                                            <Typography
                                                level="title-md"
                                                sx={{
                                                    font: "SF Pro, sans-serif",
                                                    fontWeight: 510,
                                                    fontStyle: "medium",
                                                    fontSize: "18px",
                                                    lineHeight: "24px",
                                                    letterSpacing: "0.17px",
                                                    color: "#00000099"
                                                }}
                                            >
                                                Execution: Count:
                                            </Typography>
                                            <Typography
                                                level="title-md"
                                                sx={{
                                                    font: "SF Pro, sans-serif",
                                                    fontWeight: 510,
                                                    fontStyle: "medium",
                                                    fontSize: "18px",
                                                    lineHeight: "24px",
                                                    letterSpacing: "0.17px"
                                                }}
                                            >
                                                {executionCount}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                    <ItemCountTable
                                        tableHeaders={["Workflow", "Execution Count"]}
                                        itemRows={execByWorkflow}
                                    />
                                </Stack>
                            </Box>
                            <Box sx={{ textAlign: "center", mt: "auto" }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        borderColor: "primary.subtle",
                                        color: "primary.subtle",
                                        backgroundColor: "white"
                                    }}
                                    onClick={() => navigate(`/project/${project.id}/workflows`)}
                                >
                                    View All Workflows
                                </Button>
                            </Box>
                            <CreateWorkflowDialog
                                open={openCreateWorkflowDialog}
                                onClose={handleCloseCreateWorkflowDialog}
                            />
                        </Box>

                        {/* visualization section */}
                        <Box
                            sx={{
                                width: "100%",
                                mt: 1,
                                display: "flex",
                                flexDirection: "column",
                                height: 450
                            }}
                        >
                            <DashboardItemTitleBar
                                title="Visualizations"
                                link={`/project/${project.id}/visualizations`}
                                icon={<VisualizationIcon sx={{ color: "#0000008A" }} />}
                                total={project.visualizations.length.toString()}
                                btnList={[
                                    {
                                        label: "Create Visualization",
                                        icon: <AddRoundedIcon />,
                                        sx: { backgroundColor: "primary.main" },
                                        onClick: onCreateVisClick
                                    }
                                ]}
                            />
                            <Box sx={{ flex: 1 }}>
                                <Stack direction="column" spacing={3} sx={{ width: "100%" }}>
                                    <Stack direction={{ sm: "column", md: "column", lg: "row" }} spacing={2}>
                                        {getTwoMostRecentVisualizations().map((vis, index) => (
                                            <Sheet
                                                key={index}
                                                sx={{
                                                    p: 2,
                                                    textAlign: "center",
                                                    width: "100%",
                                                    minHeight: "200px",
                                                    maxHeight: "300px",
                                                    overflow: "auto"
                                                }}
                                                variant="outlined"
                                            >
                                                <Typography level="title-md" sx={{ mb: 1 }}>
                                                    {vis.name}
                                                </Typography>
                                                <Typography level="body-sm" sx={{ mb: 2 }}>
                                                    {vis.description || "No description available."}
                                                </Typography>
                                            </Sheet>
                                        ))}
                                    </Stack>
                                    <Typography level="body-sm" sx={{ p: 2 }}>
                                        {getTwoMostRecentVisualizations().length === 0
                                            ? "No recent visualizations available."
                                            : "Shows up to 2 most recent visualizations."}
                                    </Typography>
                                </Stack>
                            </Box>
                            <Box sx={{ textAlign: "center", mt: "auto" }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        borderColor: "primary.subtle",
                                        color: "primary.subtle",
                                        backgroundColor: "white"
                                    }}
                                    onClick={() => navigate(`/project/${project.id}/visualizations`)}
                                >
                                    View All Visualizations
                                </Button>
                            </Box>
                            <CreateVisualizationDialog
                                projectId={project.id}
                                open={openCreateVisDialog}
                                onClose={handleCloseCreateVisDialog}
                            />
                        </Box>
                    </Stack>
                    <Divider sx={{ my: isLgUp ? 5 : 3 }} />
                    <Stack
                        spacing={3}
                        direction={{ xs: "column", sm: "column", md: "column", lg: "row" }}
                        sx={{ width: "100%" }}
                        justifyContent="space-between"
                        divider={<Divider orientation={isLgUp ? "vertical" : "horizontal"} />}
                    >
                        {/* Hazard section */}
                        <Box
                            sx={{
                                width: "100%",
                                mt: 1,
                                display: "flex",
                                flexDirection: "column",
                                height: 600
                            }}
                        >
                            <DashboardItemTitleBar
                                title="Hazards"
                                link={`/project/${project.id}/hazards`}
                                icon={<HazardIcon sx={{ color: "#0000008A" }} />}
                                total={project.hazards.length.toString()}
                                btnList={[
                                    {
                                        label: "Create Hazard",
                                        icon: <AddRoundedIcon />,
                                        sx: { backgroundColor: "primary.main" },
                                        onClick: () => setOpenCreateHazardDialog(true)
                                    },
                                    {
                                        label: "Add From Service",
                                        icon: <AddRoundedIcon />,
                                        sx: { backgroundColor: "primary.main" },
                                        onClick: () => setOpenAddHazardFromServiceDialog(true)
                                    }
                                ]}
                            />
                            <Box sx={{ flex: 1 }}>
                                <Grid container spacing={2} sx={{ mt: 2 }}>
                                    <Grid xs={12} sm={12} md={6}>
                                        <Stack spacing={3} direction="column" sx={{ height: "100%" }}>
                                            <Sheet sx={{ p: 2, textAlign: "center" }} variant="outlined">
                                                <Stack
                                                    direction="row"
                                                    justifyContent="center"
                                                    spacing={2}
                                                    sx={{ width: "100%", mb: 2 }}
                                                >
                                                    <Typography level="title-lg" sx={{ mb: 2 }}>
                                                        IN-CORE Service Usage
                                                    </Typography>
                                                    <Tooltip
                                                        color="neutral"
                                                        title={
                                                            <Typography
                                                                level="body-xs"
                                                                sx={{ whiteSpace: "pre-line", color: "white", p: 1 }}
                                                            >
                                                                {
                                                                    "Only tracks what you create in your space.\n Not what you add to the project."
                                                                }
                                                            </Typography>
                                                        }
                                                        arrow
                                                    >
                                                        <HelpOutlineRoundedIcon sx={{ fontSize: "20px" }} />
                                                    </Tooltip>
                                                </Stack>
                                                <Stack spacing={1}>
                                                    <Stack
                                                        sx={{
                                                            alignItems: "center",
                                                            justifyContent: "space-between"
                                                        }}
                                                        direction={{ xs: "column", sm: "row" }}
                                                        spacing={2}
                                                    >
                                                        <Typography level="title-md">Entities</Typography>
                                                        <Typography level="body-xs">
                                                            {userUsageStats.hazards.entities.text}
                                                        </Typography>
                                                    </Stack>
                                                    <Stack
                                                        sx={{
                                                            alignItems: "center",
                                                            justifyContent: "space-between"
                                                        }}
                                                        direction={{ xs: "column", sm: "row" }}
                                                        spacing={2}
                                                    >
                                                        <Typography level="title-md">Disk</Typography>
                                                        <Typography level="body-xs">
                                                            {userUsageStats.hazards.disk.text}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            </Sheet>
                                            <Sheet
                                                sx={{ p: 2, textAlign: "center", height: "100%" }}
                                                variant="outlined"
                                            >
                                                <Typography level="title-lg" sx={{ mb: 2 }}>
                                                    Hazards Format
                                                </Typography>
                                                <Stack direction="column" spacing={1} sx={{ width: "100%", mb: 2 }}>
                                                    {[
                                                        { label: "Model Based", value: hazardStats.model.toString() },
                                                        {
                                                            label: "Dataset Based",
                                                            value: hazardStats.dataset.toString()
                                                        }
                                                    ].map((hazard, index) => (
                                                        <Stack
                                                            direction="row"
                                                            justifyContent="space-between"
                                                            alignItems="center"
                                                            key={index}
                                                        >
                                                            <Typography level="body-md">{hazard.label}</Typography>
                                                            <Chip>
                                                                <Typography level="body-md">{hazard.value}</Typography>
                                                            </Chip>
                                                        </Stack>
                                                    ))}
                                                </Stack>
                                            </Sheet>
                                        </Stack>
                                    </Grid>
                                    <Grid xs={12} sm={12} md={6}>
                                        <Sheet sx={{ p: 2, textAlign: "center" }} variant="outlined">
                                            <Stack
                                                sx={{
                                                    width: "100%",
                                                    minHeight: isXsUp ? "200px" : "100px",
                                                    maxHeight: "300px",
                                                    overflow: "auto"
                                                }}
                                                spacing={2}
                                                direction="column"
                                            >
                                                <Typography level="title-lg">Hazard Count By Types</Typography>

                                                {[
                                                    "Earthquake",
                                                    "Tornado",
                                                    "Flood",
                                                    "Hurricane",
                                                    "Tsunami",
                                                    "Hurricane Windfield"
                                                ].map((hazardType) => {
                                                    const found = hazardCounts.find((h) => h.label === hazardType);
                                                    const value = found ? found.value : 0;

                                                    return (
                                                        <Stack
                                                            key={hazardType}
                                                            direction="row"
                                                            justifyContent="space-between"
                                                            alignItems="center"
                                                        >
                                                            <Typography level="title-md">{hazardType}</Typography>
                                                            <Chip>
                                                                <Typography level="body-md">{value}</Typography>
                                                            </Chip>
                                                        </Stack>
                                                    );
                                                })}
                                            </Stack>
                                        </Sheet>
                                    </Grid>
                                </Grid>
                            </Box>
                            <Box sx={{ textAlign: "center", mt: "auto" }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        borderColor: "primary.subtle",
                                        color: "primary.subtle",
                                        backgroundColor: "white"
                                    }}
                                    onClick={() => navigate(`/project/${project.id}/hazards`)}
                                >
                                    View All Hazards
                                </Button>
                            </Box>
                            <AddFromServiceDialog
                                projectId={project.id}
                                resourceType="hazard"
                                open={openAddHazardFromServiceDialog}
                                onClose={() => {
                                    setOpenAddHazardFromServiceDialog(false);
                                }}
                                onAddClick={addHazardFunc}
                            />
                            <CreateHazardDialog
                                projectId={project.id}
                                resourceType="hazard"
                                open={openCreateHazardDialog}
                                onClose={() => {
                                    setOpenCreateHazardDialog(false);
                                }}
                            />
                        </Box>

                        {/* Dataset section */}
                        <Box
                            sx={{
                                width: "100%",
                                mt: 1,
                                display: "flex",
                                flexDirection: "column",
                                height: 600
                            }}
                        >
                            <DashboardItemTitleBar
                                title="Datasets"
                                link={`/project/${project.id}/datasets`}
                                icon={<DatasetIcon sx={{ color: "#0000008A" }} />}
                                total={project.datasets.length.toString()}
                                btnList={[
                                    {
                                        label: "Create Dataset",
                                        icon: <AddRoundedIcon />,
                                        sx: { backgroundColor: "primary.main" },
                                        onClick: () => setOpenCreateDatasetDialog(true)
                                    },
                                    {
                                        label: "Add From Service",
                                        icon: <AddRoundedIcon />,
                                        sx: { backgroundColor: "primary.main" },
                                        onClick: () => setOpenAddDatasetFromServiceDialog(true)
                                    }
                                ]}
                            />
                            <Box sx={{ flex: 1 }}>
                                <Grid container spacing={2} sx={{ mt: 2 }}>
                                    <Grid sm={6}>
                                        <Stack spacing={2} direction="column">
                                            <Sheet sx={{ p: 2, textAlign: "center" }} variant="outlined">
                                                <Stack
                                                    direction="row"
                                                    justifyContent="center"
                                                    spacing={2}
                                                    sx={{ width: "100%", mb: 2 }}
                                                >
                                                    <Typography level="title-lg" sx={{ mb: 2 }}>
                                                        IN-CORE Service Usage
                                                    </Typography>
                                                    <Tooltip
                                                        color="neutral"
                                                        title={
                                                            <Typography
                                                                level="body-xs"
                                                                sx={{ whiteSpace: "pre-line", color: "white", p: 1 }}
                                                            >
                                                                {
                                                                    "Only tracks what you create in your space.\n Not what you add to the project."
                                                                }
                                                            </Typography>
                                                        }
                                                        arrow
                                                    >
                                                        <HelpOutlineRoundedIcon sx={{ fontSize: "20px" }} />
                                                    </Tooltip>
                                                </Stack>
                                                <Stack direction="column" spacing={1}>
                                                    <Stack
                                                        direction="row"
                                                        justifyContent="space-between"
                                                        sx={{
                                                            alignItems: "center"
                                                        }}
                                                    >
                                                        <Typography level="title-md">Entities</Typography>
                                                        <Typography level="body-xs">
                                                            {userUsageStats.datasets.entities.text}
                                                        </Typography>
                                                    </Stack>
                                                    <Stack
                                                        direction="row"
                                                        justifyContent="space-between"
                                                        sx={{
                                                            alignItems: "center"
                                                        }}
                                                    >
                                                        <Typography level="title-md">Disk</Typography>
                                                        <Typography level="body-xs">
                                                            {userUsageStats.datasets.disk.text}
                                                        </Typography>
                                                    </Stack>
                                                </Stack>
                                            </Sheet>
                                        </Stack>
                                    </Grid>
                                    <Grid sm={12}>
                                        <ItemCountTable
                                            tableHeaders={["Dataset Type", "Count"]}
                                            itemRows={getDatasetsCountsByType(project.datasets).map((dataset) => ({
                                                itemName: dataset.label,
                                                count: dataset.value
                                            }))}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                            <Box sx={{ textAlign: "center", mt: "auto" }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        borderColor: "primary.subtle",
                                        color: "primary.subtle",
                                        backgroundColor: "white"
                                    }}
                                    onClick={() => navigate(`/project/${project.id}/datasets`)}
                                >
                                    View All Datasets
                                </Button>
                            </Box>
                            <AddFromServiceDialog
                                projectId={project.id}
                                resourceType="dataset"
                                open={openAddDatasetFromServiceDialog}
                                onClose={() => {
                                    setOpenAddDatasetFromServiceDialog(false);
                                }}
                                onAddClick={addDatasetFunc}
                            />
                            <CreateDatasetDialog
                                projectId={project.id}
                                open={openCreateDatasetDialog}
                                onClose={() => {
                                    setOpenCreateDatasetDialog(false);
                                }}
                            />
                        </Box>
                    </Stack>
                    <Divider sx={{ my: isLgUp ? 5 : 3 }} />
                    <Stack
                        spacing={3}
                        direction={{ sm: "column", md: "column", lg: "row" }}
                        sx={{ width: "100%", height: "auto", mb: 5 }}
                        justifyContent="space-between"
                    >
                        {/* DFR3 Mappings section */}
                        <Box
                            sx={{
                                width: "100%",
                                mt: 1,
                                display: "flex",
                                flexDirection: "column",
                                height: 220
                            }}
                        >
                            <Box sx={{ flex: 1 }}>
                                <DashboardItemTitleBar
                                    title="DFR3 Mappings"
                                    link={`/project/${project.id}/dfr3mappings`}
                                    icon={<DFR3Icon sx={{ color: "#0000008A" }} />}
                                    total={project.dfr3Mappings.length.toString()}
                                    btnList={[
                                        {
                                            label: "Create DFR3 Mapping",
                                            icon: <AddRoundedIcon />,
                                            sx: { backgroundColor: "primary.main" },
                                            onClick: () => setOpenAddDFR3MappingFromServiceDialog(true)
                                        }
                                    ]}
                                />
                                <Stack
                                    spacing={3}
                                    direction="column"
                                    sx={{ justifyContent: "center", textAlign: "center" }}
                                >
                                    <Sheet sx={{ p: 2, textAlign: "center" }} variant="outlined">
                                        <Stack direction="row" spacing={2} sx={{ mb: 2, justifyContent: "center" }}>
                                            <Typography level="title-lg" sx={{ mb: 2 }}>
                                                IN-CORE Service Usage
                                            </Typography>
                                            <Tooltip
                                                color="neutral"
                                                title={
                                                    <Typography
                                                        level="body-xs"
                                                        sx={{ whiteSpace: "pre-line", color: "white", p: 1 }}
                                                    >
                                                        {
                                                            "Only tracks what you create in your space.\n Not what you add to the project."
                                                        }
                                                    </Typography>
                                                }
                                                arrow
                                            >
                                                <HelpOutlineRoundedIcon sx={{ fontSize: "20px" }} />
                                            </Tooltip>
                                        </Stack>
                                        <Stack
                                            direction="row"
                                            spacing={2}
                                            sx={{
                                                width: "100%",
                                                alignItems: "center",
                                                justifyContent: "space-between"
                                            }}
                                        >
                                            <Typography level="title-md">Entities</Typography>
                                            <Typography level="body-xs">{userUsageStats.dfr3.entities.text}</Typography>
                                        </Stack>
                                    </Sheet>
                                </Stack>
                            </Box>
                            <Box sx={{ textAlign: "center", mt: "auto" }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{
                                        borderColor: "primary.subtle",
                                        color: "primary.subtle",
                                        backgroundColor: "white"
                                    }}
                                    onClick={() => navigate(`/project/${project.id}/dfr3mappings`)}
                                >
                                    View All DFR3 Mappings
                                </Button>
                            </Box>
                            <AddFromServiceDialog
                                projectId={project.id}
                                resourceType="DFR3 Mapping"
                                open={openAddDFR3MappingFromServiceDialog}
                                onClose={() => {
                                    setOpenAddDFR3MappingFromServiceDialog(false);
                                }}
                                onAddClick={addDFR3MappingFunc}
                            />
                        </Box>
                        <Box
                            sx={{
                                width: "100%",
                                mt: 1,
                                display: "flex",
                                flexDirection: "column",
                                height: 220
                            }}
                        />
                    </Stack>
                </Grid>
            </Grid>
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                open={snackbarOpen}
                onClose={() => {
                    setSnackbarOpen(false);
                    setSnackbarMessage("");
                }}
                variant="outlined"
                color={snackbarColor}
                autoHideDuration={2000}
            >
                {snackbarMessage}
            </Snackbar>
        </>
    );
};

const ProjectDashboardComponentwithErrorHandlingAndLoading = withErrorHandling(withLoading(ProjectDashboardComponent));

const ProjectDashboard: React.FC = (): JSX.Element => {
    const { id } = useParams(); // Get projectId from the URL path
    const appDispatch = useAppDispatch();

    const loading = useAppSelector((state) => state.project.loading);
    const error = useAppSelector((state) => state.project.error);
    const projectWorkflows = useAppSelector((state) => state.project.projectWorkflows);

    // Synchronize all generated output datasets with the project datasets.
    useOutputDatasetsSynchronizationPolling(projectWorkflows, 60 * 1000, id);

    // Fetch projects when filters or pagination change (but not during search)
    React.useEffect(() => {
        if (id) {
            appDispatch(getProject(id));
        }
    }, [id]);

    return (
        <Container sx={{ display: "flex", flexDirection: "column", height: "100vh" }} maxWidth="xl">
            <Box sx={{ flexShrink: 0 }} mt={5}>
                <ProjectDashboardComponentwithErrorHandlingAndLoading isLoading={loading} error={error} />
            </Box>
        </Container>
    );
};

export default ProjectDashboard;
