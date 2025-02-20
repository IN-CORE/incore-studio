import React from "react";
import {
    Handle,
    Position,
    type NodeProps,
    getConnectedEdges,
    useViewport,
    useUpdateNodeInternals
} from "@xyflow/react";
import { Box, Button, Typography, Stack, IconButton, Tooltip } from "@mui/joy";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import StorageIcon from "@mui/icons-material/Storage";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

import { useShallow } from "zustand/react/shallow";

import { type NewAnalysisNode } from "@app/components/Workflow/nodes";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import { setSidePanelData } from "@app/reducer/workflowSlice";
import { setExecutionSidePanelData } from "@app/reducer/executionSlice";
import { theme } from "@app/theme";
import { Progress } from "@app/components/Progress";
import useStore, { type ReactFlowAppState } from "../reactFlowStore";

const selector = (state: ReactFlowAppState) => ({
    nodes: state.nodes,
    edges: state.edges,
    setNodes: state.setNodes,
    setEdges: state.setEdges
});

export function NewAnalysisNode({ id, data, selected }: NodeProps<NewAnalysisNode>): JSX.Element {
    const { nodes, edges, setNodes, setEdges } = useStore(useShallow(selector));
    const { zoom } = useViewport();
    const updateNodeInternals = useUpdateNodeInternals();
    const appDispatch = useAppDispatch();
    const hoveredAnalysisID = useAppSelector((state) => state.workflow.hoveredAnalysis);
    // const currentWorkflow = useAppSelector((state) => state.workflow.currentWorkflow);
    const currentExecution = useAppSelector((state) => state.execution.currentExecution);
    const executionParametersAndInputsChecked = useAppSelector(
        (state) => state.execution.executionParametersAndInputsChecked
    );

    const getInputParameters = () => {
        const inputParameters: {
            execFileEntryId: string;
            label: string;
            value: string;
            required: boolean;
        }[] = [];
        if (data.stepData !== undefined) {
            data.stepData.tool.parameters.forEach((param) => {
                if (param.title !== "hazard_id" && param.title !== "dfr3_mapping_set") {
                    const execFileEntryId = data.stepData?.parameters[param.parameterId] ?? "";
                    inputParameters.push({
                        execFileEntryId,
                        label: param.title,
                        required: !param.allowNull,
                        value:
                            currentExecution !== null
                                ? currentExecution.parameters[execFileEntryId] !== undefined
                                    ? currentExecution.parameters[execFileEntryId] === ""
                                        ? "Not Set"
                                        : currentExecution.parameters[execFileEntryId]
                                    : "N/A"
                                : ""
                    });
                }
            });
        }
        return inputParameters;
    };

    const getOutputDatasets = () => {
        const outputDatasets: {
            execFileEntryId: string;
            label: string;
            datasetId: string;
        }[] = [];
        data.outputHandles.forEach((output) => {
            const execFileEntryId = data.stepData?.outputs[output.dataId] ?? "";
            outputDatasets.push({
                execFileEntryId,
                label: output.label,
                datasetId:
                    currentExecution !== null
                        ? currentExecution.datasets[execFileEntryId] !== undefined
                            ? currentExecution.datasets[execFileEntryId] === ""
                                ? "Not present"
                                : currentExecution.datasets[execFileEntryId]
                            : "N/A"
                        : ""
            });
        });
        return outputDatasets;
    };

    const getInputDatasets = () => {
        const inputDatasets: {
            execFileEntryId: string;
            label: string;
            fromExisting: {
                analysisName: string;
                outputName: string;
            } | null;
            required: boolean;
            datasetId?: string;
        }[] = [];
        data.inputHandles.forEach((input) => {
            if (input.dataId === "dfr3_mapping" && data.stepData !== undefined) {
                const dfr3_param = data.stepData.tool.parameters.find((param) => param.title === "dfr3_mapping_set");
                if (dfr3_param !== undefined) {
                    const execFileEntryId = data.stepData?.parameters[dfr3_param.parameterId] ?? "";
                    inputDatasets.push({
                        execFileEntryId,
                        label: input.label,
                        fromExisting: null,
                        required: true,
                        datasetId: currentExecution !== null ? currentExecution.parameters[execFileEntryId] ?? "" : ""
                    });
                }
                // if not found then there is some issue with the tool. Don't display anything, silently fail.
            } else if (input.dataId === "hazard" && data.stepData !== undefined) {
                const hazard_param = data.stepData.tool.parameters.find((param) => param.title === "hazard_id");
                if (hazard_param !== undefined) {
                    const execFileEntryId = data.stepData?.parameters[hazard_param.parameterId] ?? "";
                    inputDatasets.push({
                        execFileEntryId,
                        label: input.label,
                        fromExisting: null,
                        required: true,
                        datasetId: currentExecution !== null ? currentExecution.parameters[execFileEntryId] ?? "" : ""
                    });
                }
                // if not found then there is some issue with the tool. Don't display anything, silently fail.
            } else {
                const incomingEdge = edges.find((edge) => edge.target === id && edge.targetHandle === input.id);
                let opSrcNodeName = "";
                let opHandleName = "";
                const execFileEntryId = data.stepData?.inputs[input.dataId] ?? "";
                if (incomingEdge !== undefined) {
                    // @ts-ignore
                    const sourceNode = nodes.find((node) => node.id === incomingEdge.source) as NewAnalysisNode;
                    if (sourceNode) {
                        const opHandle = sourceNode.data.outputHandles.find(
                            // @ts-ignore
                            (handle) => handle.id === incomingEdge.sourceHandle
                        );
                        if (opHandle) {
                            opSrcNodeName = sourceNode.data.label;
                            opHandleName = opHandle.label;
                        }
                    }
                    inputDatasets.push({
                        execFileEntryId,
                        label: input.label,
                        fromExisting: {
                            analysisName: opSrcNodeName,
                            outputName: opHandleName
                        },
                        required: false
                    });
                } else {
                    inputDatasets.push({
                        execFileEntryId,
                        label: input.label,
                        fromExisting: null,
                        required: input.required,
                        datasetId:
                            currentExecution !== null
                                ? currentExecution.datasets[execFileEntryId] !== undefined
                                    ? currentExecution.datasets[execFileEntryId] === ""
                                        ? "Not Set"
                                        : currentExecution.datasets[execFileEntryId]
                                    : "N/A"
                                : ""
                    });
                }
            }
        });
        return inputDatasets;
    };

    React.useEffect(() => {
        if (selected) {
            appDispatch(
                setExecutionSidePanelData({
                    open: true,
                    currentAnalysis: {
                        name: data.label,
                        id,
                        inputDatasets: getInputDatasets(),
                        inputParameters: getInputParameters(),
                        outputDatasets: getOutputDatasets()
                    }
                })
            );
        }
    }, [selected]);

    React.useEffect(() => {
        updateNodeInternals(id);
    }, [zoom]);

    const handleDelete = () => {
        const node = nodes.find((n) => n.id === id);
        if (node) {
            const nodesTobeDeleted = [node];

            const connectedEdges = getConnectedEdges([node], edges);

            setNodes(nodes.filter((n) => !nodesTobeDeleted.includes(n)));
            setEdges(edges.filter((e) => !connectedEdges.includes(e)));
        }
    };

    // Function to calculate positions (percentage) based on the number of handles
    const calculateHandlePosition = (index: number, total: number) => {
        return (index + 1) * (100 / (total + 1));
    };
    const MIN_HEIGHT = data.inputHandles.length * 20 + 60;

    const NodeHeading = (
        <Box sx={{ display: "flex", alignItems: "center", my: "4px", width: "100%" }}>
            <TrendingUpIcon sx={{ color: "#EF6C00", marginRight: "5px" }} />
            <Typography
                level="h4"
                sx={{
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#EF6C00"
                }}
            >
                Analysis Type
            </Typography>
        </Box>
    );

    return (
        <Box
            sx={{
                border: selected || hoveredAnalysisID === id ? "4px solid #FB8C00" : "2px solid black",
                borderRadius: "3px",
                padding: "6px 14px 6px 14px",
                backgroundColor: selected ? "#FFF1D9" : "white",
                height: "auto",
                minHeight: `${MIN_HEIGHT}px`,
                width: "400px",
                wordWrap: "break-word",
                hyphens: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column"
            }}
        >
            {data.inputHandles.map((inpt, index) => (
                <Handle
                    type="target"
                    position={Position.Left}
                    style={{
                        height: "20px",
                        width: zoom > 1.2 ? "auto" : "20px",
                        borderRadius: "3px",
                        backgroundColor: "#E3F2FD",
                        borderColor: "#007DFF",
                        position: "absolute",
                        top: `${calculateHandlePosition(index, data.inputHandles.length)}%`,
                        left: -2,
                        transform: "translate(-100%, -50%)"
                    }}
                    id={inpt.id}
                    key={inpt.label}
                >
                    <Box
                        className="target"
                        data-handleid={inpt.id}
                        data-nodeid={id}
                        data-handlepos="left"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            padding: "2px",
                            fontWeight: 400,
                            fontSize: "10px",
                            lineHeight: "14px",
                            color: "#007DFF"
                        }}
                    >
                        {zoom > 1.2 ? inpt.label : ""}
                        <StorageIcon
                            sx={{
                                color: "#007DFF",
                                marginLeft: zoom > 1.2 ? "5px" : 0,
                                pointerEvents: "none",
                                fontSize: "15px"
                            }}
                        />
                    </Box>
                </Handle>
            ))}
            {data.isExecution ? NodeHeading : zoom > 1 && NodeHeading}
            <Stack direction="column" spacing={4} sx={{ my: "6px", height: "100%", width: "100%" }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        my: "4px",
                        width: "100%",
                        justifyContent: "space-between"
                    }}
                >
                    <Box>
                        <Typography level="h2" sx={{ fontWeight: 600, fontSize: zoom > 1 ? "20px" : "24px" }}>
                            {data.label}
                        </Typography>
                    </Box>
                    {data.isExecution ? (
                        <Box sx={{ position: "absolute", right: "5px", top: "5px" }}>
                            <Tooltip
                                title="Configure"
                                variant="plain"
                                color="neutral"
                                placement="right"
                                sx={{ color: "#172B4D" }}
                            >
                                <IconButton
                                    variant="plain"
                                    onClick={() =>
                                        appDispatch(
                                            setExecutionSidePanelData({
                                                open: true,
                                                currentAnalysis: {
                                                    name: data.label,
                                                    depGName: data.name,
                                                    id,
                                                    inputDatasets: getInputDatasets(),
                                                    inputParameters: getInputParameters(),
                                                    outputDatasets: getOutputDatasets()
                                                }
                                            })
                                        )
                                    }
                                >
                                    <SettingsRoundedIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ) : (
                        <Box sx={{ position: "absolute", right: "5px", top: "5px" }}>
                            <Tooltip
                                title="Delete"
                                variant="plain"
                                color="neutral"
                                placement="right"
                                sx={{ color: "#172B4D" }}
                            >
                                <IconButton variant="plain" onClick={handleDelete}>
                                    <CancelRoundedIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    )}
                    {data.isExecution && currentExecution === null && (
                        <>
                            {executionParametersAndInputsChecked[id] ? (
                                <CheckCircleRoundedIcon sx={{ color: theme.palette.success[400] }} />
                            ) : (
                                <CheckCircleOutlineRoundedIcon />
                            )}
                        </>
                    )}
                </Box>
                {!data.isExecution && (
                    <Stack direction="row" spacing={2} justifyContent="space-between">
                        <Button
                            variant="solid"
                            sx={{
                                "backgroundColor": "#EF6C00",
                                "color": "white",
                                "fontWeight": 600,
                                "borderRadius": "2px",
                                ":hover": { backgroundColor: "#DF6500" }
                            }}
                            startDecorator={<AddRoundedIcon />}
                            fullWidth
                            onClick={() => {
                                appDispatch(
                                    setSidePanelData({
                                        open: true,
                                        type: "previous",
                                        currentAnalysis: { name: data.name, id }
                                    })
                                );
                            }}
                        >
                            Add previous
                        </Button>
                        <Button
                            variant="solid"
                            sx={{
                                "backgroundColor": "#EF6C00",
                                "color": "white",
                                "fontWeight": 600,
                                "borderRadius": "2px",
                                ":hover": { backgroundColor: "#DF6500" }
                            }}
                            startDecorator={<AddRoundedIcon />}
                            fullWidth
                            onClick={() => {
                                appDispatch(
                                    setSidePanelData({
                                        open: true,
                                        type: "next",
                                        currentAnalysis: { name: data.name, id }
                                    })
                                );
                            }}
                        >
                            Add Next
                        </Button>
                    </Stack>
                )}
            </Stack>

            {data.outputHandles.map((outpt, index) => (
                <Handle
                    type="source"
                    position={Position.Right}
                    style={{
                        height: "20px",
                        width: zoom > 1.2 ? "auto" : "20px",
                        borderRadius: "3px",
                        backgroundColor: "#F3E5F5",
                        borderColor: "#AB47BC",
                        position: "absolute",
                        top: `${calculateHandlePosition(index, data.outputHandles.length)}%`,
                        right: -2,
                        transform: "translate(100%, -50%)"
                    }}
                    id={outpt.id}
                    key={outpt.label}
                >
                    <Box
                        className="source"
                        data-handleid={outpt.id}
                        data-nodeid={id}
                        data-handlepos="right"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            padding: "2px",
                            fontWeight: 400,
                            fontSize: "10px",
                            lineHeight: "14px",
                            color: "#AB47BC"
                        }}
                    >
                        <StorageIcon
                            sx={{
                                color: "#AB47BC",
                                marginRight: zoom > 1.2 ? "5px" : 0,
                                pointerEvents: "none",
                                fontSize: "15px"
                            }}
                        />
                        {zoom > 1.2 ? outpt.label : ""}
                    </Box>
                </Handle>
            ))}
            {data.isExecution && currentExecution !== null && (
                <Progress status={currentExecution?.stepState?.[id] ?? undefined} />
            )}
        </Box>
    );
}
