import React from "react";
import { useParams } from "react-router-dom";

import {
    Box,
    Button,
    CircularProgress,
    Typography,
    Container,
    Divider,
    Grid,
    Stack,
    Sheet,
    Tooltip,
    Snackbar
} from "@mui/joy";

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
import { CreateWorkflowDialog } from "@app/components/Project/CreateWorkflow";
import { CreateVisualizationDialog } from "@app/components/Project/Resource/VisualizationDialog";
import DashboardItemTitleBar from "@app/components/Project/Resource/DashboardItemTitleBar";
import Tally from "@app/components/Project/Resource/Tally";

import DatasetIcon from "@mui/icons-material/FormatListBulleted";
import WorkflowIcon from "@mui/icons-material/AccountTree";
import DFR3Icon from "@mui/icons-material/ShowChart";
import HazardIcon from "@mui/icons-material/Storm";
import VisualizationIcon from "@mui/icons-material/Map";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import { CreateHazardDialog } from "@app/components/Project/Resource/CreateHazardDialog";
import { CreateDatasetDialog } from "@app/components/Project/Resource/CreateDatasetDialog";

const ProjectDashboardComponent: React.FC = (): JSX.Element => {
    const appDispatch = useAppDispatch();

    const project = useAppSelector((state) => state.project.project);
    const projectWorkflows = useAppSelector((state) => state.project.projectWorkflows);
    const success = useAppSelector((state) => state.project.success);
    const error = useAppSelector((state) => state.project.error);

    const { workflowCount, executionCount } = useWorkflowAndExecutionCount(projectWorkflows);
    const [visCounts, setVisCounts] = React.useState<{ tables: number; charts: number; map: number }>({
        tables: 0,
        charts: 0,
        map: 0
    });

    const { hazardStats, hazardCounts } = useHazardStats(project ? project.hazards : []);
    const userUsageStats = useUserUsageStats();
    const usageRingSize = "100px";

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

    React.useEffect(() => {
        if (project) {
            // set visualization counts
            const visCounts = project.visualizations.reduce(
                (acc, vis) => {
                    if (vis.type.toLocaleLowerCase() === "table") {
                        acc.tables += 1;
                    } else if (vis.type.toLocaleLowerCase() === "chart") {
                        acc.charts += 1;
                    } else if (vis.type.toLocaleLowerCase() === "map") {
                        acc.map += 1;
                    }
                    return acc;
                },
                { tables: 0, charts: 0, map: 0 }
            );
            setVisCounts(visCounts);
        }
    }, [project]);

    // create visualization
    const [openCreateVisDialog, setOpenCreateVisDialog] = React.useState(false);
    const handleCloseCreateVisDialog = () => {
        setOpenCreateVisDialog(false);
    };
    const onCreateVisClick = () => {
        setOpenCreateVisDialog(true);
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
            <Grid container spacing={5} sx={{ mt: 3, ml: 0 }}>
                <Grid sm={2}>
                    <ProjectSidebar id={project.id} />
                </Grid>
                {/* Left Column: Workflow, Hazard and Visualization Cards */}
                <Grid sm={10}>
                    <Stack
                        spacing={3}
                        direction={{ xs: "column", sm: "row" }}
                        sx={{ width: "100%", height: "250px" }}
                        justifyContent="space-between"
                        divider={<Divider orientation="vertical" />}
                    >
                        <Box sx={{ width: "100%" }}>
                            <DashboardItemTitleBar
                                title="Workflows"
                                link={`/project/${project.id}/workflows`}
                                icon={<WorkflowIcon sx={{ color: "black" }} />}
                            />
                            <Stack direction="column" spacing={3} sx={{ width: "100%" }}>
                                <Tally
                                    title="Count"
                                    tallyList={[
                                        { label: "Workflows", value: workflowCount.toString() },
                                        { label: "Executions", value: executionCount.toString() }
                                    ]}
                                />
                                <Box sx={{ textAlign: "center", width: "100%" }}>
                                    <Button
                                        startDecorator={<AddRoundedIcon />}
                                        variant="solid"
                                        fullWidth
                                        sx={{ backgroundColor: "primary.main", height: "60px" }}
                                        onClick={onCreateWorkflowClick}
                                    >
                                        Create Workflow
                                    </Button>
                                </Box>
                            </Stack>
                            <CreateWorkflowDialog
                                open={openCreateWorkflowDialog}
                                onClose={handleCloseCreateWorkflowDialog}
                            />
                        </Box>
                        <Box sx={{ width: "100%" }}>
                            <DashboardItemTitleBar
                                title="Visualizations"
                                link={`/project/${project.id}/visualizations`}
                                icon={<VisualizationIcon sx={{ color: "black" }} />}
                            />
                            <Stack direction="column" spacing={3} sx={{ width: "100%" }}>
                                <Tally
                                    title="Total"
                                    tallyList={Object.entries(visCounts).map(([key, value]) => ({
                                        label: key,
                                        value: value.toString()
                                    }))}
                                    totalCount={project.visualizations.length}
                                />

                                <Box sx={{ textAlign: "center", width: "100%" }}>
                                    <Button
                                        startDecorator={<AddRoundedIcon />}
                                        variant="solid"
                                        fullWidth
                                        sx={{ backgroundColor: "primary.main", height: "60px" }}
                                        onClick={onCreateVisClick}
                                    >
                                        Create Visualization
                                    </Button>
                                </Box>
                            </Stack>
                            <CreateVisualizationDialog
                                projectId={project.id}
                                open={openCreateVisDialog}
                                onClose={handleCloseCreateVisDialog}
                            />
                        </Box>
                    </Stack>
                    <Divider sx={{ my: 5 }} />
                    <Stack
                        spacing={3}
                        direction="row"
                        sx={{ width: "100%", height: "auto" }}
                        justifyContent="space-between"
                        divider={<Divider orientation="vertical" />}
                    >
                        <Box sx={{ width: "100%" }}>
                            <DashboardItemTitleBar
                                title="Hazards"
                                link={`/project/${project.id}/hazards`}
                                icon={<HazardIcon sx={{ color: "black" }} />}
                                optionsList={[
                                    {
                                        label: "Add Existing Hazard",
                                        onClick: () => setOpenAddHazardFromServiceDialog(true)
                                    },
                                    {
                                        label: "Create New Hazard",
                                        onClick: () => setOpenCreateHazardDialog(true)
                                    }
                                ]}
                            />
                            <Grid container spacing={5} sx={{ mt: 2 }}>
                                <Grid sm={6}>
                                    <Stack spacing={3} direction="column">
                                        <Sheet sx={{ p: 2, textAlign: "center" }} variant="outlined">
                                            <Stack direction="row" spacing={2} sx={{ width: "100%", mb: 2 }}>
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
                                                    <InfoRoundedIcon />
                                                </Tooltip>
                                            </Stack>
                                            <Stack
                                                direction={{ sm: "column", md: "row" }}
                                                spacing={2}
                                                divider={<Divider orientation="vertical" />}
                                            >
                                                <Box sx={{ width: "100%" }}>
                                                    <CircularProgress
                                                        determinate
                                                        value={userUsageStats.hazards.entities.value}
                                                        color="primary"
                                                        sx={{
                                                            "--CircularProgress-size": {
                                                                sm: "50px",
                                                                md: usageRingSize
                                                            },
                                                            "mb": 1
                                                        }}
                                                        thickness={5}
                                                    >
                                                        <Typography
                                                            level="body-xs"
                                                            sx={{
                                                                whiteSpace: "pre-line",
                                                                display: { sm: "none", md: "block" }
                                                            }}
                                                        >
                                                            {userUsageStats.hazards.entities.text}
                                                        </Typography>
                                                    </CircularProgress>
                                                    <Typography level="title-md">Entities</Typography>
                                                </Box>
                                                <Box sx={{ width: "100%" }}>
                                                    <CircularProgress
                                                        determinate
                                                        value={userUsageStats.hazards.disk.value}
                                                        color="primary"
                                                        sx={{
                                                            "--CircularProgress-size": {
                                                                sm: "50px",
                                                                md: usageRingSize
                                                            },
                                                            "mb": 1
                                                        }}
                                                        thickness={5}
                                                    >
                                                        <Typography
                                                            level="body-xs"
                                                            sx={{
                                                                whiteSpace: "pre-line",
                                                                display: { sm: "none", md: "block" }
                                                            }}
                                                        >
                                                            {userUsageStats.hazards.disk.text}
                                                        </Typography>
                                                    </CircularProgress>
                                                    <Typography level="title-md">Disk</Typography>
                                                </Box>
                                            </Stack>
                                        </Sheet>
                                        <Tally
                                            title="Count"
                                            tallyList={[
                                                { label: "Model Based", value: hazardStats.model.toString() },
                                                { label: "Dataset Based", value: hazardStats.dataset.toString() }
                                            ]}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid sm={6}>
                                    <Sheet sx={{ p: 2, textAlign: "center" }} variant="outlined">
                                        <Stack sx={{ width: "100%" }} spacing={3} direction="column">
                                            <Typography level="title-lg">Hazard Count By Types</Typography>
                                            {hazardCounts.map((hazard, index) => (
                                                <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                    key={index}
                                                >
                                                    <Typography level="title-md">{hazard.label}</Typography>
                                                    <Typography level="body-md">{hazard.value}</Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Sheet>
                                </Grid>
                            </Grid>
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
                        <Box sx={{ width: "100%" }}>
                            <DashboardItemTitleBar
                                title="Datasets"
                                link={`/project/${project.id}/datasets`}
                                icon={<DatasetIcon sx={{ color: "black" }} />}
                                optionsList={[
                                    {
                                        label: "Add Existing Dataset",
                                        onClick: () => setOpenAddDatasetFromServiceDialog(true)
                                    },
                                    {
                                        label: "Upload Dataset",
                                        onClick: () => setOpenCreateDatasetDialog(true)
                                    }
                                ]}
                            />
                            <Grid container spacing={5} sx={{ mt: 2 }}>
                                <Grid sm={6}>
                                    <Stack spacing={3} direction="column">
                                        <Sheet sx={{ p: 2, textAlign: "center" }} variant="outlined">
                                            <Stack direction="row" spacing={2} sx={{ width: "100%", mb: 2 }}>
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
                                                    <InfoRoundedIcon />
                                                </Tooltip>
                                            </Stack>
                                            <Stack
                                                direction="row"
                                                spacing={2}
                                                sx={{ width: "100%" }}
                                                divider={<Divider orientation="vertical" />}
                                            >
                                                <Box sx={{ width: "100%" }}>
                                                    <CircularProgress
                                                        determinate
                                                        value={userUsageStats.datasets.entities.value}
                                                        color="primary"
                                                        sx={{
                                                            "--CircularProgress-size": {
                                                                sm: "50px",
                                                                md: usageRingSize
                                                            },
                                                            "mb": 1
                                                        }}
                                                        thickness={5}
                                                    >
                                                        <Typography
                                                            level="body-xs"
                                                            sx={{
                                                                whiteSpace: "pre-line",
                                                                display: { sm: "none", md: "block" }
                                                            }}
                                                        >
                                                            {userUsageStats.datasets.entities.text}
                                                        </Typography>
                                                    </CircularProgress>
                                                    <Typography level="title-md">Entities</Typography>
                                                </Box>
                                                <Box sx={{ width: "100%" }}>
                                                    <CircularProgress
                                                        determinate
                                                        value={userUsageStats.datasets.disk.value}
                                                        color="primary"
                                                        sx={{
                                                            "--CircularProgress-size": {
                                                                sm: "50px",
                                                                md: usageRingSize
                                                            },
                                                            "mb": 1
                                                        }}
                                                        thickness={5}
                                                    >
                                                        <Typography
                                                            level="body-xs"
                                                            sx={{
                                                                whiteSpace: "pre-line",
                                                                display: { sm: "none", md: "block" }
                                                            }}
                                                        >
                                                            {userUsageStats.datasets.disk.text}
                                                        </Typography>
                                                    </CircularProgress>
                                                    <Typography level="title-md">Disk</Typography>
                                                </Box>
                                            </Stack>
                                        </Sheet>
                                    </Stack>
                                </Grid>
                                <Grid sm={6}>
                                    <Sheet sx={{ p: 2, textAlign: "center" }} variant="outlined">
                                        <Stack
                                            sx={{ width: "100%", scrollBehavior: "smooth", overflow: "auto" }}
                                            spacing={3}
                                            direction="column"
                                        >
                                            <Typography level="title-lg">Hazard Count By Types</Typography>
                                            {getDatasetsCountsByType(project.datasets).map((dataset, index) => (
                                                <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                    key={index}
                                                >
                                                    <Typography level="title-md">{dataset.label}</Typography>
                                                    <Typography level="body-md">{dataset.value}</Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Sheet>
                                </Grid>
                            </Grid>
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
                    <Divider sx={{ my: 5 }} />
                    <Stack
                        spacing={3}
                        direction="row"
                        sx={{ width: "100%", height: "auto", mb: 5 }}
                        justifyContent="space-between"
                    >
                        <Box sx={{ width: "100%" }}>
                            <DashboardItemTitleBar
                                title="DFR3 Mappings"
                                link={`/project/${project.id}/dfr3mappings`}
                                icon={<DFR3Icon sx={{ color: "black" }} />}
                                optionsList={[
                                    {
                                        label: "Add DFR3 Mappings From Service",
                                        onClick: () => setOpenAddDFR3MappingFromServiceDialog(true)
                                    }
                                ]}
                            />
                            <Grid container spacing={5} sx={{ mt: 2 }}>
                                <Grid sm={6}>
                                    <Stack
                                        spacing={3}
                                        direction="column"
                                        sx={{ justifyContent: "center", textAlign: "center" }}
                                    >
                                        <Sheet sx={{ p: 2, textAlign: "center" }} variant="outlined">
                                            <Stack
                                                direction="row"
                                                spacing={2}
                                                sx={{ width: "100%", mb: 2, justifyContent: "center" }}
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
                                                    <InfoRoundedIcon />
                                                </Tooltip>
                                            </Stack>
                                            <Stack
                                                direction="row"
                                                spacing={2}
                                                sx={{ width: "100%" }}
                                                divider={<Divider orientation="vertical" />}
                                            >
                                                <Box sx={{ width: "100%" }}>
                                                    <CircularProgress
                                                        determinate
                                                        value={userUsageStats.dfr3.entities.value}
                                                        color="primary"
                                                        sx={{
                                                            "--CircularProgress-size": {
                                                                sm: "50px",
                                                                md: usageRingSize
                                                            },
                                                            "mb": 1
                                                        }}
                                                        thickness={5}
                                                    >
                                                        <Typography
                                                            level="body-xs"
                                                            sx={{
                                                                whiteSpace: "pre-line",
                                                                display: { sm: "none", md: "block" }
                                                            }}
                                                        >
                                                            {userUsageStats.dfr3.entities.text}
                                                        </Typography>
                                                    </CircularProgress>
                                                    <Typography level="title-md">Entities</Typography>
                                                </Box>
                                            </Stack>
                                        </Sheet>
                                    </Stack>
                                </Grid>
                                <Grid sm={6}>
                                    <Tally
                                        title="Count"
                                        tallyList={[
                                            { label: "DFR3 Mappings", value: project.dfr3Mappings.length.toString() }
                                        ]}
                                    />
                                </Grid>
                            </Grid>
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
    useOutputDatasetsSynchronizationPolling(projectWorkflows, 600000, id);

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
