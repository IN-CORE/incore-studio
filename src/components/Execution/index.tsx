import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import { Box, Button, Typography, Stack, Tooltip, IconButton } from "@mui/joy";
import { useShallow } from "zustand/react/shallow";

import useStore, { type ReactFlowAppState } from "@app/components/Workflow/reactFlowStore";
import { getExecutionById, resetExecutionState, setExecutionSidePanelCheckStatus } from "@app/reducer/executionSlice";
import { useAppDispatch, useAppSelector, useExecutionTemplate, useExecutionPolling } from "@app/store/hooks";
import withLoading from "@app/components/hocs/withLoading";
import withErrorHandling from "@app/components/hocs/withErrorHandling";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import ConfirmationDialog from "@app/components/ConfirmationDialog";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Workflow from "@app/components/Workflow";
import { getWorkflow, clearWorkflowState } from "@app/reducer/workflowSlice";
import { ReactSVG } from "react-svg";
import CreateExecutionDialog from "./CreateExecutionDialog";

import SidePanel from "./SidePanel";

const selector = (state: ReactFlowAppState) => ({
    nodes: state.nodes,
    edges: state.edges,
    setNodes: state.setNodes,
    setEdges: state.setEdges
});

const WorkflowWithLoading = withLoading(Workflow);
const WorkflowWithLoadingAndErrorHandling = withErrorHandling(WorkflowWithLoading);

const ExecutionComponent: React.FC<{
    create: boolean;
}> = ({ create }): JSX.Element => {
    const navigate = useNavigate();
    const location = useLocation();
    const { wfID } = useParams<{ exId: string; wfID: string }>();
    const appDispatch = useAppDispatch();
    const { id } = useParams<{ id: string }>();
    const { setNodes, setEdges } = useStore(useShallow(selector));

    const sidePanelData = useAppSelector((state) => state.execution.sidePanelData);
    const currentExecution = useAppSelector((state) => state.execution.currentExecution);
    const reactFlowWorkflow = useAppSelector((state) => state.workflow.reactFlowWorkflow);
    const workflowLoading = useAppSelector((state) => state.workflow.workflowLoading);
    const workflowError = useAppSelector((state) => state.workflow.workflowError);
    const executionParametersAndInputsChecked = useAppSelector(
        (state) => state.execution.executionParametersAndInputsChecked
    );
    const [openExecutionDialog, setOpenExecutionDialog] = React.useState(false);
    const [saveExecutionModalConfirmation, setSaveExecutionModalConfirmation] = React.useState(false);
    const [reRunFlow, setReRunFlow] = React.useState(false);

    // Prevent Browser Refresh / Close
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (create) {
                event.preventDefault();
                event.returnValue =
                    "You have unsaved changes. If you leave this page without submitting, all progress will be lost.";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [create]);

    // Handle Navigation Warning (For Back Button)
    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            if (create && !window.confirm("You have unsaved changes. Do you really want to leave?")) {
                event.preventDefault();
                navigate(location.pathname); // Stay on the current page
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [navigate, location.pathname]);

    useExecutionTemplate(wfID);
    useExecutionPolling(currentExecution ? currentExecution.id : null, 10000);

    const handleBackClick = () => {
        if (create) {
            setSaveExecutionModalConfirmation(true);
        } else {
            appDispatch(resetExecutionState());
            navigate(`/project/${id}/workflows/${wfID}`);
        }
    };

    React.useEffect(() => {
        if (reactFlowWorkflow.nodes.length !== 0) {
            setNodes(reactFlowWorkflow.nodes);
            setEdges(reactFlowWorkflow.edges);
            appDispatch(setExecutionSidePanelCheckStatus(reactFlowWorkflow.nodes.map((node) => node.id)));
        }
    }, [reactFlowWorkflow]);

    React.useEffect(() => {
        if (currentExecution !== null) {
            appDispatch(getWorkflow({ workflowID: currentExecution.workflowId, isExecution: true }));
        } else if (wfID !== undefined) {
            appDispatch(getWorkflow({ workflowID: wfID, isExecution: true }));
        }

        return () => {
            appDispatch(clearWorkflowState());
            setNodes([]);
            setEdges([]);
        };
    }, []);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "94vh" }}>
            <Box sx={{ padding: "20px", height: "4vh", borderBottom: "solid 1px black" }}>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                    <Box sx={{ alignContent: "center" }}>
                        <Stack direction="row" spacing={2}>
                            <Box sx={{ alignContent: "center" }}>
                                <Tooltip title="Go back" variant="plain" color="neutral" sx={{ color: "#172B4D" }}>
                                    <IconButton variant="plain" onClick={() => handleBackClick()}>
                                        <ArrowBackIosRoundedIcon />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <ConfirmationDialog
                                open={saveExecutionModalConfirmation}
                                onClose={() => setSaveExecutionModalConfirmation(false)}
                                onConfirm={() => {
                                    appDispatch(resetExecutionState());
                                    navigate(`/project/${id}/workflows/${wfID}`);
                                }}
                                confirmationDialogTitle="Save Changes Before Leaving?"
                                confirmationDialogText="You have unsaved changes. If you leave this page without submitting, all progress will be lost."
                                confirmationDialogAction="Leave"
                            />
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
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                            variant="solid"
                            disabled={
                                create
                                    ? !Object.values(executionParametersAndInputsChecked).every(
                                          (value) => value === true
                                      )
                                    : false
                            }
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
                            onClick={() => {
                                if (create) {
                                    setOpenExecutionDialog(true);
                                } else {
                                    appDispatch(resetExecutionState());
                                    navigate(`/project/${id}/workflows/${wfID}/execution/create`);
                                }
                            }}
                        >
                            {create ? "Execute Workflow" : "Create new"}
                        </Button>
                        {!create && (
                            <Button
                                variant="solid"
                                startDecorator={<RestartAltRoundedIcon sx={{ fontSize: "25px" }} />}
                                sx={{
                                    backgroundColor: "primary.main",
                                    border: "1px",
                                    display: "flex", // Ensures proper alignment within the button
                                    alignItems: "center", // Aligns text and icon vertically
                                    gap: "8px"
                                }}
                                onClick={() => {
                                    setReRunFlow(true);
                                    setOpenExecutionDialog(true);
                                }}
                            >
                                Re-Run With same Parameters
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Box>
            <CreateExecutionDialog
                open={openExecutionDialog}
                onClose={() => setOpenExecutionDialog(false)}
                wfId={wfID}
                id={id}
                reRun={reRunFlow}
                resetReRun={() => setReRunFlow(false)}
            />

            <Box sx={{ display: "flex", flexGrow: 1, position: "relative" }}>
                <WorkflowWithLoadingAndErrorHandling
                    sidePanelOpen={sidePanelData.open}
                    isExecution
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
    const { exId } = useParams<{ exId: string; wfID: string }>();
    const appDispatch = useAppDispatch();
    const loading = useAppSelector((state) => state.execution.loading);
    const error = useAppSelector((state) => state.execution.error);

    React.useEffect(() => {
        if (!create && exId !== undefined) {
            // Dispatch immediately on mount
            appDispatch(getExecutionById(exId));
        }
        return () => {
            appDispatch(resetExecutionState());
        };
    }, []);

    return <ExecutionComponentWithLoadingAndErrorHandling create={create} isLoading={loading} error={error} />;
};

export default Execution;
