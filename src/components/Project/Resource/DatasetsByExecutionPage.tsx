import React, { useEffect, useState } from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionGroup,
    AccordionSummary,
    Box,
    Chip,
    Typography,
    Container,
    Grid,
    Stack,
    CircularProgress,
    accordionClasses
} from "@mui/joy";
import { accordionDetailsClasses } from "@mui/joy/AccordionDetails";
import { accordionSummaryClasses } from "@mui/joy/AccordionSummary";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@app/store";
import { getProject } from "@app/reducer/projectSlice";
import { getAllDatasetsByExecutions } from "@app/utils";
import { ProjectBreadcrumb } from "@app/components/Project/ProjectBreadcrumb";
import { ProjectHeader } from "@app/components/Project/ProjectHeader";
import ResourceFilterBar from "@app/components/Project/Resource/ResourceFilterBar";
import Divider from "@mui/joy/Divider";
import { ProjectSidebar } from "@app/components/Project/ProjectSidebar";
import { useAppDispatch } from "@app/store/hooks";
import Snackbar from "@mui/joy/Snackbar";
import { GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import DatasetIcon from "@mui/icons-material/FormatListBulleted";
import WorkflowIcon from "@mui/icons-material/AccountTree";

import TableDataModal from "@app/components/TableDataModal";
import TableDatasetView from "./TableDatasetView";

const DatasetPage = (): JSX.Element => {
    const { id } = useParams(); // Get projectId from the URL path
    const appDispatch = useAppDispatch();

    // Redux state
    const project = useSelector((state: RootState) => state.project.project);
    const [openTableDataModal, setOpenTableDataModal] = useState(false); // State to control the visibility of the table data modal
    const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null); // State to store the selected dataset
    const [datasetsByExecutions, setDatasetsByExecutions] = useState<DatasetsByExecutions>({}); // State to store datasets by executions

    useEffect(() => {
        if (id) {
            appDispatch(getProject(id));
        }
    }, [id]);

    useEffect(() => {
        if (project && project.id) {
            const fetchDatasetsByExecutions = async () => {
                const datasetsByExecutions = await getAllDatasetsByExecutions(project.workflows);
                setDatasetsByExecutions(datasetsByExecutions);
            };
            fetchDatasetsByExecutions();
        }
    }, [project]);

    const projectDatasets = useSelector((state: RootState) => state.project.projectDatasets);

    const actionColumn: GridColDef = {
        field: "actions",
        type: "actions",
        width: 80,
        getActions: (params) => [
            <GridActionsCellItem
                icon={<PreviewRoundedIcon sx={{ fontSize: "20px" }} />}
                label="Preview"
                onClick={() => {
                    const dataset = projectDatasets.find((ds) => ds.id === params.id);
                    if (dataset) {
                        setSelectedDataset(dataset);
                        setOpenTableDataModal(true);
                    }
                }}
            />
        ]
    };

    // snackbar
    const [snackbarOpen, setSnackbarOpen] = React.useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState<string>("");
    const [snackbarColor, setSnackbarColor] = React.useState<"success" | "danger" | "warning" | "neutral">("neutral");
    const success = useSelector((state: RootState) => state.project.success);
    const error = useSelector((state: RootState) => state.project.error);
    const loading = useSelector((state: RootState) => state.project.loading);
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

    return (
        <Container sx={{ display: "flex", flexDirection: "column", height: "100vh" }} maxWidth="xl">
            <Box sx={{ flexShrink: 0 }} mt={5}>
                {!project ? (
                    <Typography>Loading...</Typography>
                ) : (
                    <>
                        {/* Header Section */}
                        <ProjectBreadcrumb
                            project={{ href: `/project/${project.id}`, label: project.name }}
                            resource="Datasets"
                        />
                        <ProjectHeader project={project} />
                        <Divider />
                        <Grid container spacing={3} mt={3} ml={0}>
                            <Grid sm={3}>
                                <ProjectSidebar id={project.id} />
                            </Grid>
                            <Grid sm={9}>
                                <ResourceFilterBar
                                    title="Datasets By Execution"
                                    icon={<DatasetIcon sx={{ verticalAlign: "middle" }} />}
                                />
                                <Grid
                                    container
                                    spacing={3}
                                    sx={{
                                        borderRadius: "md",
                                        [`& .${accordionDetailsClasses.content}.${accordionDetailsClasses.expanded}`]: {
                                            paddingBlock: "1rem"
                                        },
                                        [`& .${accordionSummaryClasses.button}`]: {
                                            paddingBlock: "1rem"
                                        }
                                    }}
                                >
                                    <AccordionGroup
                                        sx={(theme) => ({
                                            [`& .${accordionClasses.root}`]: {
                                                "marginTop": "0.5rem",
                                                "transition": "0.2s ease",
                                                "& button:not([aria-expanded='true'])": {
                                                    transition: "0.2s ease"
                                                }
                                            },
                                            [`& .${accordionClasses.root}.${accordionClasses.expanded}`]: {
                                                borderRadius: "md",
                                                borderBottom: "1px solid",
                                                borderColor: "background.level2"
                                            },
                                            '& [aria-expanded="true"]': {
                                                boxShadow: `inset 0 -1px 0 ${theme.vars.palette.divider}`
                                            },
                                            "maxHeight": "calc(100vh - 400px)",
                                            "overflowY": "auto"
                                        })}
                                    >
                                        {Object.entries(datasetsByExecutions).map(([executionId, executionData]) => (
                                            <Accordion key={executionId}>
                                                <AccordionSummary>
                                                    <Stack
                                                        direction="row"
                                                        sx={{ width: "100%" }}
                                                        spacing={1}
                                                        justifyContent={"space-between"}
                                                    >
                                                        <Stack direction="row" alignItems={"center"} spacing={1}>
                                                            <Typography
                                                                level="h4"
                                                                sx={{
                                                                    fontWeight: 590,
                                                                    fontSize: "18px",
                                                                    lineHeight: "24px",
                                                                    paragraph: "28px",
                                                                    color: "#172B4D",
                                                                    letter: "5%"
                                                                }}
                                                            >
                                                                Execution:
                                                            </Typography>
                                                            <Typography
                                                                level="h4"
                                                                sx={{
                                                                    fontWeight: 300,
                                                                    fontSize: "16px",
                                                                    lineHeight: "24px",
                                                                    paragraph: "24px",
                                                                    color: "#172B4D",
                                                                    letter: "5%"
                                                                }}
                                                            >
                                                                {executionData.executionName}
                                                            </Typography>
                                                        </Stack>
                                                        <Chip
                                                            startDecorator={<WorkflowIcon sx={{ fontSize: "20px" }} />}
                                                            variant="soft"
                                                        >
                                                            <Typography
                                                                level="body-md"
                                                                sx={{
                                                                    color: "#172B4D"
                                                                }}
                                                            >
                                                                {executionData.workflowName}
                                                            </Typography>
                                                        </Chip>
                                                    </Stack>
                                                </AccordionSummary>
                                                <AccordionDetails>
                                                    {loading && <CircularProgress />}
                                                    <Box
                                                        sx={{
                                                            maxHeight: "300px",
                                                            minHeight: "200px",
                                                            overflow: "auto",
                                                            display: "flex",
                                                            flexDirection: "column"
                                                        }}
                                                    >
                                                        {project !== null ? (
                                                            <TableDatasetView
                                                                datasets={project.datasets.filter((dataset) =>
                                                                    executionData.datasetIds.includes(dataset.id)
                                                                )}
                                                                loading={loading}
                                                                workflowId={executionData.workflowId}
                                                                executionId={executionId}
                                                                actionColumn={actionColumn}
                                                            />
                                                        ) : null}
                                                    </Box>
                                                </AccordionDetails>
                                            </Accordion>
                                        ))}
                                    </AccordionGroup>
                                </Grid>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Box>
            {selectedDataset && (
                <TableDataModal
                    open={openTableDataModal}
                    onClose={() => {
                        setOpenTableDataModal(false);
                    }}
                    dataset={selectedDataset}
                />
            )}
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
        </Container>
    );
};

export default DatasetPage;
