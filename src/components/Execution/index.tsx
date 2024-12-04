import React from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Box, Button, Typography, Stack, Tooltip, IconButton } from "@mui/joy";
import { useShallow } from "zustand/react/shallow";

import useStore, { type ReactFlowAppState } from "@app/components/Workflow/reactFlowStore";
import {
    getExecutionById,
    resetExecutionState,
    setExecutionSidePanelCheckStatus
    // updateExecutionSidePanelCheckStatus
} from "@app/reducer/executionSlice";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import withLoading from "@app/components/hocs/withLoading";
import withErrorHandling from "@app/components/hocs/withErrorHandling";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import SidePanel from "./SidePanel";
import Workflow from "@app/components/Workflow";
import { getWorkflow } from "@app/reducer/workflowSlice";

import { ReactSVG } from "react-svg";

const selector = (state: ReactFlowAppState) => ({
    nodes: state.nodes,
    edges: state.edges,
    setNodes: state.setNodes,
    setEdges: state.setEdges
});

const WorkflowWithLoading = withLoading(Workflow);
const WorkflowWithLoadingAndErrorHandling = withErrorHandling(WorkflowWithLoading);

const ExecutionComponent: React.FC<{
    currentExecution: DatawolfExecutionFile | null;
    create: boolean;
    wfId: string | undefined;
}> = ({ currentExecution, create, wfId }): JSX.Element => {
    const navigate = useNavigate();
    const appDispatch = useAppDispatch();
    const { id } = useParams<{ id: string }>();
    const { setNodes, setEdges } = useStore(useShallow(selector));

    const sidePanelData = useAppSelector((state) => state.execution.sidePanelData);
    // const currentWorkflow = useAppSelector((state) => state.workflow.currentWorkflow);
    const reactFlowWorkflow = useAppSelector((state) => state.workflow.reactFlowWorkflow);
    const workflowLoading = useAppSelector((state) => state.workflow.workflowLoading);
    const workflowError = useAppSelector((state) => state.workflow.workflowError);

    const handleBackClick = (wfId: string | undefined) => {
        appDispatch(resetExecutionState());
        navigate(`/project/${id}/workflows/${wfId}`);
    };

    React.useEffect(() => {
        if (reactFlowWorkflow.nodes.length !== 0) {
            setNodes(reactFlowWorkflow.nodes);
            setEdges(reactFlowWorkflow.edges);
            appDispatch(setExecutionSidePanelCheckStatus(reactFlowWorkflow.nodes.map((node) => node.id)));
        }
    }, [reactFlowWorkflow]);

    React.useEffect(() => {
        if (!create && currentExecution !== null) {
            appDispatch(
                getWorkflow({ workflowID: currentExecution.workflowId, isExecution: true, execution: currentExecution })
            );
        } else if (create && wfId !== undefined) {
            appDispatch(getWorkflow({ workflowID: wfId, isExecution: true }));
        }
    }, []);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "94vh" }}>
            <Box sx={{ padding: "20px", height: "8vh", borderBottom: "solid 1px black" }}>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Box sx={{ alignContent: "center" }}>
                        <Stack direction="row" spacing={2}>
                            <Box sx={{ alignContent: "center" }}>
                                <Tooltip title="Go back" variant="plain" color="neutral" sx={{ color: "#172B4D" }}>
                                    <IconButton variant="plain" onClick={() => handleBackClick(wfId)}>
                                        <ArrowBackIosRoundedIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Box>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Typography
                                        level="h3"
                                        sx={{
                                            fontWeight: 800,
                                            fontSize: "18px",
                                            lineHeight: "24px",
                                            color: "#172B4D"
                                        }}
                                    >
                                        Execution: {create ? "Untitled Execution" : currentExecution?.title}
                                    </Typography>
                                    <Typography
                                        level="h4"
                                        sx={{
                                            fontWeight: 400,
                                            fontSize: "12px",
                                            lineHeight: "20px",
                                            color: "#42526EB2"
                                        }}
                                    >
                                        {!create &&
                                            new Date(currentExecution ? currentExecution.date : "").toLocaleDateString(
                                                "en-US",
                                                {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                }
                                            )}
                                    </Typography>
                                </Stack>
                                {!create && (
                                    <Typography
                                        level="h4"
                                        sx={{
                                            fontWeight: 400,
                                            fontSize: "14px",
                                            lineHeight: "20px",
                                            color: "#42526EB2"
                                        }}
                                    >
                                        {currentExecution?.description}
                                    </Typography>
                                )}
                            </Box>
                        </Stack>
                    </Box>
                    <Box>
                        <Stack direction="row" spacing={2}>
                            {!create ? null : (
                                <>
                                    <Button
                                        variant="outlined"
                                        startDecorator={<RestartAltRoundedIcon />}
                                        sx={{
                                            borderColor: "primary.subtle",
                                            color: "primary.subtle",
                                            backgroundColor: "white"
                                        }}
                                        // onClick={handleSaveClick}
                                    >
                                        Reset all inputs
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startDecorator={<RestartAltRoundedIcon />}
                                        sx={{
                                            borderColor: "primary.subtle",
                                            color: "primary.subtle",
                                            backgroundColor: "white"
                                        }}
                                    >
                                        Reset all parameters
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="solid"
                                startDecorator={
                                    create ? (
                                        <ReactSVG
                                            src="/executeIcon.svg"
                                            style={{
                                                display: "inline-block",
                                                height: "1.2em", // Scale the icon to match the font size
                                                width: "1.2em",
                                                verticalAlign: "middle" // Ensures vertical alignment
                                            }}
                                        />
                                    ) : (
                                        <AddRoundedIcon sx={{ fontSize: "25px" }} />
                                    )
                                }
                                sx={{
                                    backgroundColor: "primary.main",
                                    border: "1px",
                                    display: "flex", // Ensures proper alignment within the button
                                    alignItems: "center", // Aligns text and icon vertically
                                    gap: "8px"
                                }}
                            >
                                {create ? "Execute Workflow" : "Create new"}
                            </Button>
                        </Stack>
                        {/* <Snackbar
                                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
                                </Snackbar> */}
                    </Box>
                </Stack>
            </Box>

            <Box sx={{ display: "flex", flexGrow: 1, position: "relative" }}>
                <WorkflowWithLoadingAndErrorHandling
                    sidePanelOpen={sidePanelData.open}
                    isExecution={true}
                    error={workflowError}
                    isLoading={workflowLoading}
                />
                {sidePanelData.open && (
                    <Box
                        sx={{
                            width: "30vw",
                            borderLeft: "1px solid black",
                            backgroundColor: "white",
                            padding: 0
                        }}
                    >
                        <SidePanel createMode={create} />
                    </Box>
                )}
            </Box>
        </Box>
    );
};

const ExecutionComponentWithErrorHandling = withErrorHandling(ExecutionComponent);
const ExecutionComponentWithLoadingAndErrorHandling = withLoading(ExecutionComponentWithErrorHandling);

const Execution: React.FC<{ create: boolean }> = ({ create }): JSX.Element => {
    const { exId, wfID } = useParams<{ exId: string; wfID: string }>();
    const appDispatch = useAppDispatch();
    const currentExecution = useAppSelector((state) => state.execution.currentExecution);
    const loading = useAppSelector((state) => state.execution.loading);
    const error = useAppSelector((state) => state.execution.error);

    React.useEffect(() => {
        if (!create && exId !== undefined && currentExecution === null) {
            // Dispatch immediately on mount
            appDispatch(getExecutionById(exId));

            // Set up interval to fetch every 10 seconds
            const intervalId = setInterval(() => {
                appDispatch(getExecutionById(exId));
            }, 10000);

            // Clear interval on unmount
            return () => clearInterval(intervalId);
        }
    }, []);

    return (
        <ExecutionComponentWithLoadingAndErrorHandling
            wfId={wfID}
            create={create}
            currentExecution={currentExecution}
            isLoading={loading}
            error={error}
        />
    );
};

export default Execution;
