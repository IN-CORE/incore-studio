import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";

import {
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    Checkbox,
    List,
    ListItem,
    IconButton,
    Input,
    Modal,
    ModalClose,
    Stack,
    Typography,
    Tooltip
} from "@mui/joy";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Done from "@mui/icons-material/Done";

import Workflow from "@app/components/Workflow";
import Loading from "@app/components/Loading";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import {
    getWorkflow,
    setWorkflow,
    clearWorkflowState,
    getWorkflowTools,
    saveWorkflow,
    getDatawolfUser
} from "@app/reducer/workflowSlice";
import { createWorkflowFileFromNodesAndEdges, getNodesAndEdgesFromTool } from "@app/components/Workflow/workflowUtils";
import dependency_graph from "@app/components/WorkflowEditor/dependency_graph.json";

const WorkflowEditor = (): JSX.Element => {
    const { wfID } = useParams<{ wfID: string }>();
    const appDispatch = useAppDispatch();
    const navigate = useNavigate();
    const auth = useAuth();

    const dependencyGraph = dependency_graph;

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

    const [selectAnalysisModalOpen, setSelectAnalysisModalOpen] = React.useState<boolean>(false);
    // const [addAnalysisDrawerOpen, setAddAnalysisDrawerOpen] = React.useState<boolean>(false);
    const [searchAnalysisTerm, setSearchAnalysisTerm] = React.useState<string>("");
    const [selectedAnalysis, setSelectedAnalysis] = React.useState<string>("");
    const [availableAnalyses, setAvailableAnalyses] = React.useState<string[]>([]);

    const clearItems = () => {
        setSelectedAnalysis("");
        setSearchAnalysisTerm("");
        setSelectAnalysisModalOpen(false);
    };

    React.useEffect(() => {
        if (wfID !== workflowID) {
            appDispatch(getWorkflow({ workflowID: wfID }));
        }
        appDispatch(getWorkflowTools());
        appDispatch(getDatawolfUser({ email: auth?.user?.profile?.email }));
    }, []);

    React.useEffect(() => {
        if (datawolfTools.length !== 0) {
            let toolNames = datawolfTools.map((tool) => tool.title).sort();
            toolNames = toolNames.filter(
                (tool) =>
                    dependencyGraph[tool].pretty_name.toLowerCase().search(searchAnalysisTerm.toLowerCase()) !== -1
            );
            setAvailableAnalyses(toolNames);
        }
    }, [datawolfTools, searchAnalysisTerm]);

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

    const AddAnalysisModal = (
        <Modal
            aria-labelledby="modal-title"
            aria-describedby="modal-desc"
            open={selectAnalysisModalOpen}
            onClose={() => setSelectAnalysisModalOpen(false)}
            sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
        >
            <Card
                sx={{
                    width: 800,
                    maxHeight: 800,
                    backgroundColor: "white",
                    padding: "24px"
                }}
            >
                <Box display="flex" flexDirection="row" justifyContent="flex-start" alignItems="center">
                    <TrendingUpRoundedIcon sx={{ color: "#EF6C00", marginRight: "10px" }} />
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
                        Select Analysis
                    </Typography>
                    <ModalClose variant="plain" sx={{ m: 1 }} />
                </Box>
                <CardContent>
                    <Stack direction="column" spacing={3}>
                        <Box>
                            <Input
                                startDecorator={<SearchRoundedIcon />}
                                endDecorator={
                                    searchAnalysisTerm.length > 0 ? (
                                        <IconButton variant="plain" onClick={() => setSearchAnalysisTerm("")}>
                                            <CloseRoundedIcon />
                                        </IconButton>
                                    ) : null
                                }
                                placeholder="Search Analysis"
                                value={searchAnalysisTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setSearchAnalysisTerm(e.target.value.toLowerCase());
                                }}
                            />
                        </Box>
                        <Box sx={{ height: "400px", overflow: "auto", padding: "10px" }}>
                            <List
                                sx={{
                                    "--List-gap": "8px",
                                    "--ListItem-minHeight": "32px",
                                    "--ListItem-gap": "4px"
                                }}
                            >
                                {availableAnalyses.map((analysis) => (
                                    <ListItem key={analysis}>
                                        {analysis === selectedAnalysis && (
                                            <Done
                                                color="primary"
                                                sx={{
                                                    ml: -0.5,
                                                    zIndex: 2,
                                                    pointerEvents: "none"
                                                }}
                                            />
                                        )}
                                        <Checkbox
                                            size="sm"
                                            disableIcon
                                            overlay
                                            label={
                                                dependencyGraph !== undefined && dependencyGraph[analysis] !== undefined
                                                    ? dependencyGraph[analysis].pretty_name
                                                    : analysis
                                            }
                                            checked={selectedAnalysis === analysis}
                                            variant={selectedAnalysis === analysis ? "soft" : "outlined"}
                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                if (event.target.checked) {
                                                    setSelectedAnalysis(analysis);
                                                } else {
                                                    setSelectedAnalysis("");
                                                }
                                            }}
                                            slotProps={{
                                                action: ({ checked }) => ({
                                                    sx: checked
                                                        ? {
                                                              border: "1px solid",
                                                              borderColor: "primary.500"
                                                          }
                                                        : {}
                                                })
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Stack>
                </CardContent>
                <CardActions>
                    <Button
                        variant="solid"
                        sx={{ backgroundColor: "primary.main" }}
                        startDecorator={<AddRoundedIcon />}
                        onClick={() => {
                            if (selectedAnalysis !== "") {
                                const { nodes, edges } = getNodesAndEdgesFromTool(
                                    datawolfTools.find((tool) => tool.title === selectedAnalysis)
                                );
                                clearItems();
                                appDispatch(
                                    setWorkflow({
                                        nodes: initialNodesAndEdges.nodes.concat(nodes),
                                        edges: initialNodesAndEdges.edges.concat(edges)
                                    })
                                );
                            }
                        }}
                    >
                        Add
                    </Button>
                </CardActions>
            </Card>
        </Modal>
    );

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
                    {initialNodesAndEdges.nodes.length === 0 ? (
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
                            {AddAnalysisModal}
                        </Box>
                    ) : (
                        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                            <Workflow initialNodesAndEdges={initialNodesAndEdges} />
                            <Button
                                variant="solid"
                                sx={{
                                    position: "fixed",
                                    bottom: "20px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    backgroundColor: "primary.main"
                                }}
                                onClick={() => setSelectAnalysisModalOpen(true)}
                                startDecorator={<AddRoundedIcon />}
                            >
                                Add another analysis
                            </Button>
                            {AddAnalysisModal}
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default WorkflowEditor;
