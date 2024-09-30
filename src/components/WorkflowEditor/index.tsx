import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";

import { Box, Button, IconButton, Stack, Typography, Tooltip } from "@mui/joy";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";

import Workflow from "@app/components/Workflow";
import Loading from "@app/components/Loading";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import {
    getWorkflow,
    clearWorkflowState,
    getWorkflowTools,
    saveWorkflow,
    getDatawolfUser
} from "@app/reducer/workflowSlice";
import { createWorkflowFileFromNodesAndEdges } from "@app/components/Workflow/workflowUtils";

const WorkflowEditor = (): JSX.Element => {
    const { wfID } = useParams<{ wfID: string }>();
    const appDispatch = useAppDispatch();
    const navigate = useNavigate();
    const auth = useAuth();

    // Redux state
    const initialNodesAndEdges = useAppSelector((state) => state.workflow.reactFlowWorkflow);
    const workflowID = useAppSelector((state) => state.workflow.datawolfWorkflowID);
    const workflowLoading = useAppSelector((state) => state.workflow.workflowLoading);
    const workflowError = useAppSelector((state) => state.workflow.workflowError);
    const createdWorkflowLoading = useAppSelector((state) => state.workflow.createdWorkflowLoading);
    const createdWorkflowError = useAppSelector((state) => state.workflow.createdWorkflowError);
    const currentWorkflow = useAppSelector((state) => state.workflow.currentWorkflow);
    const datawolfTools = useAppSelector((state) => state.workflow.datawolfTools);
    const datawolfUser = useAppSelector((state) => state.workflow.datawolfUser);

    React.useEffect(() => {
        if (wfID !== workflowID) {
            appDispatch(getWorkflow({ workflowID: wfID }));
        }
        appDispatch(getWorkflowTools());
        appDispatch(getDatawolfUser({ email: auth?.user?.profile?.email }));
    }, []);

    const handleBackClick = () => {
        appDispatch(clearWorkflowState());
        navigate(-1);
    };

    const handleExportJSONClick = () => {
        if (currentWorkflow !== null && workflowID !== null) {
            const newWorkflowFile = createWorkflowFileFromNodesAndEdges({
                nodes: initialNodesAndEdges.nodes,
                edges: initialNodesAndEdges.edges,
                creator: datawolfUser,
                datawolfWorkflowFileID: workflowID,
                title: currentWorkflow !== null ? currentWorkflow.title : "Untitled Workflow",
                description: currentWorkflow !== null ? currentWorkflow.description : "",
                created: currentWorkflow !== null ? currentWorkflow.created : new Date().toISOString(),
                tools: datawolfTools
            });

            // Convert the object to a JSON string
            const jsonString = JSON.stringify(newWorkflowFile);

            // Create a Blob from the JSON string
            const blob = new Blob([jsonString], { type: "application/json" });

            // Create a link element
            const link = document.createElement("a");

            // Create a URL for the Blob and set it as the href attribute
            link.href = URL.createObjectURL(blob);

            // Set the download attribute to specify the file name
            link.download = "data.json";

            // Append the link to the document, click it, and remove it
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleSaveClick = () => {
        if (currentWorkflow !== null && workflowID !== null) {
            const newWorkflowFile = createWorkflowFileFromNodesAndEdges({
                nodes: initialNodesAndEdges.nodes,
                edges: initialNodesAndEdges.edges,
                creator: datawolfUser,
                datawolfWorkflowFileID: workflowID,
                title: currentWorkflow !== null ? currentWorkflow.title : "Untitled Workflow",
                description: currentWorkflow !== null ? currentWorkflow.description : "",
                created: currentWorkflow !== null ? currentWorkflow.created : new Date().toISOString(),
                tools: datawolfTools
            });

            appDispatch(saveWorkflow({ workflowID: workflowID, workflow: newWorkflowFile }));
        } // else dispatch save workflow error
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
            {workflowLoading || createdWorkflowLoading ? (
                <Loading />
            ) : workflowError || createdWorkflowError ? (
                <Typography level="h4" color="danger">
                    {workflowError || createdWorkflowError}
                </Typography>
            ) : (
                <>
                    <Box sx={{ padding: "24px" }}>
                        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                            <Box sx={{ alignContent: "center" }}>
                                <Stack direction="row" spacing={2}>
                                    <Box sx={{ alignContent: "center" }}>
                                        <Tooltip
                                            title="Go back"
                                            variant="plain"
                                            color="neutral"
                                            sx={{ color: "#172B4D" }}
                                        >
                                            <IconButton variant="plain" onClick={handleBackClick}>
                                                <ArrowBackIosRoundedIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    <Box>
                                        <Typography
                                            level="h3"
                                            sx={{
                                                fontWeight: 800,
                                                fontSize: "18px",
                                                lineHeight: "24px",
                                                color: "#172B4D"
                                            }}
                                        >
                                            {currentWorkflow?.title}
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
                                            Created on:{" "}
                                            {new Date(
                                                currentWorkflow ? currentWorkflow.created : ""
                                            ).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Box>
                            <Box>
                                <Stack direction="row" spacing={2}>
                                    <Tooltip
                                        title="Export Workflow JSON"
                                        variant="plain"
                                        color="neutral"
                                        sx={{ color: "#172B4D" }}
                                    >
                                        <IconButton aria-label="Export" variant="plain" onClick={handleExportJSONClick}>
                                            <FileDownloadRoundedIcon sx={{ color: "#172B4D" }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Button
                                        variant="outlined"
                                        sx={{ borderColor: "primary.subtle", color: "primary.subtle" }}
                                        onClick={handleSaveClick}
                                    >
                                        Save
                                    </Button>
                                    <Button variant="solid" sx={{ backgroundColor: "primary.main" }}>
                                        Set Exection Parameters
                                    </Button>
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>
                    <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                        <Workflow initialNodesAndEdges={initialNodesAndEdges} />
                    </Box>
                </>
            )}
        </Box>
    );
};

export default WorkflowEditor;
