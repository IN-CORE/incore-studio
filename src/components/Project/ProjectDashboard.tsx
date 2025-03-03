import React from "react";
import { useParams } from "react-router-dom";

import { Box, Button, CircularProgress, Typography, Container, Divider, Grid, Stack, Sheet, Tooltip } from "@mui/joy";

import {
    useAppDispatch,
    useAppSelector,
    useOutputDatasetsSynchronizationPolling,
    useWorkflowAndExecutionCount,
    useUserUsageStats,
    useHazardStats
} from "@app/store/hooks";
import { getProject } from "@app/reducer/projectSlice";
import withLoading from "@app/components/hocs/withLoading";
import withErrorHandling from "@app/components/hocs/withErrorHandling";
import { ProjectBreadcrumb } from "@app/components/Project/ProjectBreadcrumb";
import { ProjectHeader } from "@app/components/Project/ProjectHeader";
import { ProjectSidebar } from "@app/components/Project/ProjectSidebar";
import DashboardItemTitleBar from "@app/components/Project/Resource/DashboardItemTitleBar";
import Tally from "@app/components/Project/Resource/Tally";

import DatasetIcon from "@mui/icons-material/FormatListBulleted";
import WorkflowIcon from "@mui/icons-material/AccountTree";
import DFR3Icon from "@mui/icons-material/ShowChart";
import HazardIcon from "@mui/icons-material/Storm";
import VisualizationIcon from "@mui/icons-material/Map";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";

const ProjectDashboardComponent: React.FC = (): JSX.Element => {
    const project = useAppSelector((state) => state.project.project);
    const projectWorkflows = useAppSelector((state) => state.project.projectWorkflows);
    const { workflowCount, executionCount } = useWorkflowAndExecutionCount(projectWorkflows);
    const [visCounts, setVisCounts] = React.useState<{ tables: number; charts: number; map: number }>({
        tables: 0,
        charts: 0,
        map: 0
    });

    const { hazardStats, hazardCounts } = useHazardStats(project ? project.hazards : []);
    const hazardList = [
        { label: "Earthquake", key: "earthquake" },
        { label: "Tornado", key: "tornado" },
        { label: "Hurricane", key: "hurricane" },
        { label: "Hurricane WindField", key: "hurricaneWF" },
        { label: "Flood", key: "flood" },
        { label: "Tsunami", key: "tsunami" }
    ];
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
                                    >
                                        Create Workflow
                                    </Button>
                                </Box>
                            </Stack>
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
                                    >
                                        Create Visualization
                                    </Button>
                                </Box>
                            </Stack>
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
                            />
                            <Grid container spacing={5} sx={{ mt: 2 }}>
                                <Grid sm={6}>
                                    <Stack spacing={3} direction="column">
                                        <Sheet sx={{ p: 2, textAlign: "center", width: "100%" }} variant="outlined">
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
                                                // sx={{ width: "100%" }}
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
                                    <Sheet
                                        sx={{ p: 2, textAlign: "center", width: "100%", height: "100%" }}
                                        variant="outlined"
                                    >
                                        <Stack sx={{ width: "100%" }} spacing={3} direction="column">
                                            <Typography level="title-lg">Hazard Count By Types</Typography>
                                            {hazardList.map((hazard, index) => (
                                                <Stack
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                    key={index}
                                                >
                                                    <Typography level="title-md">{hazard.label}</Typography>
                                                    <Typography level="body-md">
                                                        {hazardCounts[hazard.key as keyof typeof hazardCounts]}
                                                    </Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Sheet>
                                </Grid>
                            </Grid>
                        </Box>
                        <Box sx={{ width: "100%" }}>
                            <DashboardItemTitleBar
                                title="Datasets"
                                link={`/project/${project.id}/datasets`}
                                icon={<DatasetIcon sx={{ color: "black" }} />}
                            />
                            <Grid container spacing={5} sx={{ mt: 2 }}>
                                <Grid sm={6}>
                                    <Stack spacing={3} direction="column">
                                        <Sheet sx={{ p: 2, textAlign: "center", width: "100%" }} variant="outlined">
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
                                    <Sheet
                                        sx={{ p: 2, textAlign: "center", width: "100%", height: "100%" }}
                                        variant="outlined"
                                    >
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
                            />
                            <Grid container spacing={5} sx={{ mt: 2 }}>
                                <Grid sm={6}>
                                    <Stack
                                        spacing={3}
                                        direction="column"
                                        sx={{ justifyContent: "center", textAlign: "center" }}
                                    >
                                        <Sheet sx={{ p: 2, textAlign: "center", width: "100%" }} variant="outlined">
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
                        </Box>
                    </Stack>
                </Grid>
            </Grid>
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
