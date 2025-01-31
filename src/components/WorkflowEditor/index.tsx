import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";

import {
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    IconButton,
    Modal,
    ModalClose,
    Sheet,
    Stack,
    Typography,
    Tooltip
} from "@mui/joy";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import Snackbar from "@mui/joy/Snackbar";

import { useShallow } from "zustand/react/shallow";

import AddAnalysisModal from "@app/components/AddAnalysisModal";
import useStore, { type ReactFlowAppState } from "@app/components/Workflow/reactFlowStore";
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
import { finalizeWorkflow, getProject } from "@app/reducer/projectSlice";
import { createWorkflowFileFromNodesAndEdgesV2 } from "@app/components/Workflow/workflowUtils";
import InvalidWorkflowFilePage from "@app/components/InvalidWorkflowFilePage";
import SidePanel from "./SidePanel";
import FinalizeWorkflowDialog from "@app/components/FinalizeWorkflowDialog";

const selector = (state: ReactFlowAppState) => ({
    nodes: state.nodes,
    edges: state.edges,
    setNodes: state.setNodes,
    setEdges: state.setEdges
});

const WorkflowEditor = (): JSX.Element => {
    const { id, wfID } = useParams<{ id: string; wfID: string }>();
    const appDispatch = useAppDispatch();
    const navigate = useNavigate();
    const auth = useAuth();
    const { nodes, edges, setNodes, setEdges } = useStore(useShallow(selector));

    // Redux state
    const reactFlowWorkflow = useAppSelector((state) => state.workflow.reactFlowWorkflow);
    const workflowID = useAppSelector((state) => state.workflow.datawolfWorkflowID);
    const project = useAppSelector((state) => state.project.project);
    const workflowLoading = useAppSelector((state) => state.workflow.workflowLoading);
    const workflowError = useAppSelector((state) => state.workflow.workflowError);
    const createdWorkflowLoading = useAppSelector((state) => state.workflow.createdWorkflowLoading);
    const workflowInvalid = useAppSelector((state) => state.workflow.workflowInvalid);
    const createdWorkflowError = useAppSelector((state) => state.workflow.createdWorkflowError);
    const currentWorkflow = useAppSelector((state) => state.workflow.currentWorkflow);
    const datawolfTools = useAppSelector((state) => state.workflow.datawolfTools);
    const datawolfUser = useAppSelector((state) => state.workflow.datawolfUser);
    const saveWorkflowLoading = useAppSelector((state) => state.workflow.saveWorkflowLoading);
    const saveWorkflowError = useAppSelector((state) => state.workflow.saveWorkflowError);
    const saveWorkflowSuccess = useAppSelector((state) => state.workflow.saveWorkflowSuccess);
    const sidePanelData = useAppSelector((state) => state.workflow.sidePanelData);

    const [selectAnalysisModalOpen, setSelectAnalysisModalOpen] = React.useState<boolean>(false);
    const [snackbarOpen, setSnackbarOpen] = React.useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState<string>("");
    const [snackbarColor, setSnackbarColor] = React.useState<"success" | "danger" | "warning" | "neutral">("neutral");

    const [openFinalize, setOpenFinalize] = React.useState(false);
    const [confirmFinalize, setConfirmFinalize] = React.useState(false);
    const [finalizedRedirectModalOpen, setFinalizedRedirectModalOpen] = React.useState(false);

    React.useEffect(() => {
        if (confirmFinalize && wfID && id) {
            appDispatch(finalizeWorkflow({ projectId: id, workflowId: wfID }));
            navigate(`/project/${id}/workflows/${wfID}/execution/create`);
        }
    }, [confirmFinalize]);

    React.useEffect(() => {
        if (saveWorkflowError) {
            setSnackbarMessage(`Couldn't save workflow. Error: ${saveWorkflowError}`);
            setSnackbarColor("danger");
        } else if (saveWorkflowLoading) {
            setSnackbarMessage("Saving workflow...");
            setSnackbarColor("warning");
        } else if (saveWorkflowSuccess) {
            setSnackbarMessage("Workflow Saved!");
            setSnackbarColor("success");
        } else {
            setSnackbarMessage("Workflow Loaded!");
            setSnackbarColor("neutral");
        }
        setSnackbarOpen(true);
    }, [saveWorkflowError, saveWorkflowLoading]);

    React.useEffect(() => {
        if (reactFlowWorkflow.nodes.length !== 0) {
            setNodes(reactFlowWorkflow.nodes);
            setEdges(reactFlowWorkflow.edges);
        }
    }, [reactFlowWorkflow]);

    // on project load, check if the workflow is finalized, if so, redirect to execution page
    React.useEffect(() => {
        if (project) {
            if (project.workflows.find((wf: Workflow) => wf.id === wfID)?.isFinalized) {
                setFinalizedRedirectModalOpen(true);
            }
        }
    }, [project]);

    React.useEffect(() => {
        if (wfID !== workflowID) {
            appDispatch(getWorkflow({ workflowID: wfID }));
        }
        if (project === null && id) {
            appDispatch(getProject(id));
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
            const newWorkflowFile = createWorkflowFileFromNodesAndEdgesV2({
                nodes,
                edges,
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
            const newWorkflowFile = createWorkflowFileFromNodesAndEdgesV2({
                nodes,
                edges,
                creator: datawolfUser,
                datawolfWorkflowFileID: workflowID,
                title: currentWorkflow !== null ? currentWorkflow.title : "Untitled Workflow",
                description: currentWorkflow !== null ? currentWorkflow.description : "",
                created: currentWorkflow !== null ? currentWorkflow.created : new Date().toISOString(),
                tools: datawolfTools
            });

            appDispatch(saveWorkflow({ workflowID, workflow: newWorkflowFile }));
        } // else dispatch save workflow error
    };
    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "94vh" }}>
            {workflowLoading || createdWorkflowLoading ? (
                <Loading />
            ) : workflowError || createdWorkflowError ? (
                workflowInvalid ? (
                    <InvalidWorkflowFilePage
                        workflowError={workflowError}
                        createdWorkflowError={createdWorkflowError}
                        currentWorkflowTitle={currentWorkflow?.title}
                        handleBackClick={handleBackClick}
                    />
                ) : (
                    <Typography level="h4" color="danger">
                        {workflowError || createdWorkflowError}
                    </Typography>
                )
            ) : (
                <>
                    <Box sx={{ padding: "20px", height: "8vh", borderBottom: "solid 1px black" }}>
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
                                        </Stack>
                                        <Typography
                                            level="h4"
                                            sx={{
                                                fontWeight: 400,
                                                fontSize: "14px",
                                                lineHeight: "20px",
                                                color: "#42526EB2"
                                            }}
                                        >
                                            {currentWorkflow?.description === ""
                                                ? "Description not provided"
                                                : currentWorkflow?.description}
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
                                        variant="solid"
                                        sx={{ backgroundColor: "primary.main" }}
                                        onClick={() => setSelectAnalysisModalOpen(true)}
                                        startDecorator={<AddRoundedIcon />}
                                    >
                                        Add another analysis
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        sx={{
                                            borderColor: "primary.subtle",
                                            color: "primary.subtle",
                                            backgroundColor: "white"
                                        }}
                                        onClick={handleSaveClick}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        variant="solid"
                                        sx={{ backgroundColor: "primary.main" }}
                                        onClick={() => {
                                            if (
                                                project?.workflows.find((wf: Workflow) => wf.id === wfID)?.isFinalized
                                            ) {
                                                navigate(`/project/${id}/workflows/${wfID}/execution/create`);
                                            } else {
                                                setOpenFinalize(true);
                                            }
                                        }}
                                    >
                                        {project?.workflows.find((wf: Workflow) => wf.id === wfID)?.isFinalized
                                            ? "Create Execution"
                                            : "Finalize Workflow"}
                                    </Button>
                                </Stack>
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
                            </Box>
                            <FinalizeWorkflowDialog
                                open={openFinalize}
                                onClose={() => setOpenFinalize(false)}
                                confirmFinalize={() => setConfirmFinalize(true)}
                            />
                        </Stack>
                    </Box>
                    <Modal
                        aria-labelledby="close-modal-title"
                        aria-describedby="modal-desc"
                        open={finalizedRedirectModalOpen}
                        onClose={(_event: React.MouseEvent<HTMLButtonElement>) => {
                            setFinalizedRedirectModalOpen(false);
                            navigate(`/project/${id}/workflows/${wfID}/execution/create`);
                        }}
                        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <Sheet variant="outlined" sx={{ minWidth: 300, borderRadius: "md", p: 3 }}>
                            <ModalClose variant="outlined" />
                            <Typography
                                component="h2"
                                id="close-modal-title"
                                level="h4"
                                textColor="inherit"
                                sx={{ fontWeight: "lg" }}
                            >
                                Workflow Finalized!
                            </Typography>
                            <Typography id="modal-desc" textColor="text.tertiary">
                                This workflow has been finalized! You can no longer make edits. You will be now
                                redirected to the execution page.
                            </Typography>
                        </Sheet>
                    </Modal>
                    {nodes.length === 0 ? (
                        <Box
                            sx={{
                                flexGrow: 1,
                                height: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: "#E0E0E0"
                            }}
                        >
                            <Card
                                variant="soft"
                                sx={{
                                    width: 600,
                                    backgroundColor: "white",
                                    textAlign: "center",
                                    padding: "24px"
                                }}
                            >
                                <Typography
                                    level="title-lg"
                                    sx={{
                                        fontWeight: 500,
                                        fontSize: "24px",
                                        lineHeight: "24px",
                                        paragraph: "28px",
                                        my: "10px"
                                    }}
                                >
                                    Create a Workflow
                                </Typography>
                                <CardContent>
                                    <Typography
                                        level="body-md"
                                        sx={{
                                            fontWeight: 400,
                                            fontSize: "14px",
                                            lineHeight: "20px",
                                            paragraph: "10px",
                                            mb: "10px"
                                        }}
                                    >
                                        Get started with creating a workflow by choosing an analysis. You can then add
                                        more analysis by choosing either from Analysis nodes or drag and drop from left
                                        toolbar.
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        variant="solid"
                                        sx={{ backgroundColor: "primary.main" }}
                                        onClick={() => setSelectAnalysisModalOpen(true)}
                                    >
                                        Select an analysis to start
                                    </Button>
                                </CardActions>
                            </Card>
                            <AddAnalysisModal
                                selectAnalysisModalOpen={selectAnalysisModalOpen}
                                setSelectAnalysisModalOpen={setSelectAnalysisModalOpen}
                            />
                        </Box>
                    ) : (
                        <Box sx={{ display: "flex", flexGrow: 1, position: "relative" }}>
                            <Workflow sidePanelOpen={sidePanelData.open} />
                            {sidePanelData.open && (
                                <Box
                                    sx={{
                                        width: "25vw",
                                        borderLeft: "1px solid black",
                                        backgroundColor: "white",
                                        padding: 0
                                    }}
                                >
                                    <SidePanel />
                                </Box>
                            )}
                            <AddAnalysisModal
                                selectAnalysisModalOpen={selectAnalysisModalOpen}
                                setSelectAnalysisModalOpen={setSelectAnalysisModalOpen}
                            />
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default WorkflowEditor;
