import React from "react";

import {
    Box,
    Button,
    Checkbox,
    List,
    ListItem,
    Input,
    Divider,
    Sheet,
    Stack,
    IconButton,
    Tooltip,
    Typography
} from "@mui/joy";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Done from "@mui/icons-material/Done";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { type Edge, MarkerType } from "@xyflow/react";

import { useShallow } from "zustand/react/shallow";

import { type NewAnalysisNode } from "@app/components/Workflow/nodes";
import { getNodeFromToolV2 } from "@app/components/Workflow/workflowUtils";
import useStore, { type ReactFlowAppState } from "@app/components/Workflow/reactFlowStore";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import { clearSidePanelData, setHoveredAnalysis, clearHoveredAnalysis } from "@app/reducer/workflowSlice";
import CheckboxLabel from "./CheckboxLabel";

const selector = (state: ReactFlowAppState) => ({
    nodes: state.nodes,
    edges: state.edges,
    addNodes: state.addNodes,
    addEdges: state.addEdges,
    setEdges: state.setEdges
});

const SidePanel = () => {
    const appDispatch = useAppDispatch();
    const { nodes, edges, addNodes, addEdges, setEdges } = useStore(useShallow(selector));

    const sidePanelData = useAppSelector((state) => state.workflow.sidePanelData);
    const dependencyGraph = useAppSelector((state) => state.workflow.dependencyGraph);
    const datawolfTools = useAppSelector((state) => state.workflow.datawolfTools);

    const [selectedAnalysis, setSelectedAnalysis] = React.useState<{ value: string; existing: boolean }>({
        value: "",
        existing: false
    });
    const [searchAnalysisTerm, setSearchAnalysisTerm] = React.useState<string>("");
    const [availableAnalyses, setAvailableAnalyses] = React.useState<string[]>([]);
    const [nodeLink, setNodeLink] = React.useState<{ from: string; to: string }>({ from: "", to: "" });

    const clearItems = () => {
        setSelectedAnalysis({ value: "", existing: false });
        setSearchAnalysisTerm("");
        appDispatch(clearSidePanelData());
    };

    const checkEdgetoCurrHandleExists = (nodeNameLabel: string): boolean => {
        if (sidePanelData.currentAnalysis.name !== "") {
            const currAnalysisNode = nodes.find(
                (node) => node.id === sidePanelData.currentAnalysis.id
            ) as NewAnalysisNode;
            if (currAnalysisNode && sidePanelData.type === "previous") {
                const testHandle = currAnalysisNode.data.inputHandles.find((inpt) => inpt.label === nodeNameLabel);
                if (testHandle) {
                    return (
                        edges.find((ed) => ed.target === currAnalysisNode.id && ed.targetHandle === testHandle.id) !==
                        undefined
                    );
                }
            }
        }
        return false;
    };

    const checkEdgetoTargetHandleExists = (nodeNameLabel: string, targetNode: NewAnalysisNode): boolean => {
        const testHandle = targetNode.data.inputHandles.find((inpt) => inpt.label === nodeNameLabel);
        if (testHandle) {
            return edges.find((ed) => ed.target === targetNode.id && ed.targetHandle === testHandle.id) !== undefined;
        }
        return false;
    };

    const getEdgeFromCurrentAnalysis = (newNode: NewAnalysisNode | null): Edge | null => {
        if (sidePanelData.currentAnalysis.name !== "" && newNode !== null) {
            const currAnalysisNode = nodes.find(
                (node) => node.id === sidePanelData.currentAnalysis.id
            ) as NewAnalysisNode;
            if (currAnalysisNode) {
                let srcNodeHandleId: string | null = null;
                let destNodeHandleId: string | null = null;
                let srcId = "";
                let tarId = "";
                if (sidePanelData.type === "previous") {
                    srcId = newNode.id;
                    tarId = currAnalysisNode.id;
                    newNode.data.outputHandles.forEach((handle) => {
                        if (handle.label === nodeLink.from) {
                            srcNodeHandleId = handle.id;
                        }
                    });
                    currAnalysisNode.data.inputHandles.forEach((handle) => {
                        if (handle.label === nodeLink.to) {
                            destNodeHandleId = handle.id;
                        }
                    });
                } else {
                    srcId = currAnalysisNode.id;
                    tarId = newNode.id;
                    newNode.data.inputHandles.forEach((handle) => {
                        if (handle.label === nodeLink.to) {
                            destNodeHandleId = handle.id;
                        }
                    });
                    currAnalysisNode.data.outputHandles.forEach((handle) => {
                        if (handle.label === nodeLink.from) {
                            srcNodeHandleId = handle.id;
                        }
                    });
                }

                if (srcNodeHandleId && destNodeHandleId) {
                    return {
                        id: `${srcId}_handle_${srcNodeHandleId}->${tarId}_ handle_${destNodeHandleId}`,
                        source: srcId,
                        target: tarId,
                        sourceHandle: srcNodeHandleId,
                        targetHandle: destNodeHandleId,
                        type: "deletableEdge",
                        markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
                    };
                }
            }
        }
        return null;
    };

    const getEdgeToRemoveFromExistingAnalysis = (existingNode: NewAnalysisNode): Edge | null => {
        if (sidePanelData.currentAnalysis.name !== "") {
            const currAnalysisNode = nodes.find(
                (node) => node.id === sidePanelData.currentAnalysis.id
            ) as NewAnalysisNode;
            if (currAnalysisNode) {
                if (sidePanelData.type === "previous") {
                    let srcHandle = existingNode.data.outputHandles.find((handle) => handle.label === nodeLink.from);
                    let edg = edges.find(
                        (ed) =>
                            ed.source === existingNode.id &&
                            ed.target === currAnalysisNode.id &&
                            ed.sourceHandle === srcHandle?.id
                    );
                    if (edg) {
                        return edg;
                    }
                } else {
                    let targetHandle = currAnalysisNode.data.outputHandles.find(
                        (handle) => handle.label === nodeLink.from
                    );
                    let edg = edges.find(
                        (ed) =>
                            ed.source === currAnalysisNode.id &&
                            ed.sourceHandle === targetHandle?.id &&
                            ed.target === existingNode.id
                    );
                    if (edg) {
                        return edg;
                    }
                }
            }
        }
        return null;
    };

    React.useEffect(() => {
        if (dependencyGraph !== null) {
            let toolNames = datawolfTools.map((tool) => tool.title).sort();
            toolNames = toolNames.filter(
                (tool) =>
                    dependencyGraph[tool].pretty_name.toLowerCase().search(searchAnalysisTerm.toLowerCase()) !== -1
            );
            setAvailableAnalyses(toolNames);
        }
    }, [datawolfTools, searchAnalysisTerm]);

    if (!sidePanelData.open) {
        return null;
    }

    return (
        <Sheet
            sx={{
                backgroundColor: "white",
                padding: 0,
                maxHeight: "92vh",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" padding="12px">
                <Typography
                    level="h4"
                    sx={{
                        fontWeight: 800,
                        fontSize: "18px",
                        lineHeight: "24px",
                        color: "#172B4D"
                    }}
                >
                    Configure: {sidePanelData.type} analysis
                </Typography>
                <Tooltip title="Close" placement="top">
                    <IconButton onClick={() => clearItems()}>
                        <CloseRoundedIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
            <Divider role="presentation" />
            <Stack
                spacing={2}
                direction="column"
                padding="12px"
                sx={{ flexGrow: 1, overflow: "auto", scrollBehavior: "smooth", maxHeight: "100%" }}
            >
                <Box display="flex" flexDirection="row" justifyContent="flex-start" alignItems="center">
                    <TrendingUpRoundedIcon sx={{ color: "#EF6C00", marginRight: "10px" }} />
                    <Typography
                        level="h3"
                        sx={{
                            fontWeight: 800,
                            fontSize: "20px",
                            lineHeight: "24px",
                            color: "#172B4D"
                        }}
                    >
                        {dependencyGraph !== null
                            ? dependencyGraph[sidePanelData.currentAnalysis.name].pretty_name
                            : sidePanelData.currentAnalysis.name}
                    </Typography>
                </Box>
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
                {dependencyGraph !== null && (
                    <Box sx={{ padding: "2px" }}>
                        <Typography
                            level="h4"
                            sx={{
                                fontWeight: 500,
                                fontSize: "16px",
                                lineHeight: "18px",
                                color: "#172B4D",
                                mb: "5px"
                            }}
                        >
                            {sidePanelData.type === "previous"
                                ? "From existing workflow analysis"
                                : "To existing workflow analysis"}
                        </Typography>
                        <List
                            sx={{
                                "--List-gap": "8px",
                                "--ListItem-minHeight": "32px",
                                "--ListItem-gap": "4px"
                            }}
                        >
                            {nodes.map((node) => {
                                if (
                                    sidePanelData.type === "previous" &&
                                    dependencyGraph[sidePanelData.currentAnalysis.name].before[
                                        (node as NewAnalysisNode).data.name
                                    ] !== undefined
                                ) {
                                    return dependencyGraph[sidePanelData.currentAnalysis.name].before[
                                        (node as NewAnalysisNode).data.name
                                    ].map((link: { from: string; to: string }) => {
                                        return (
                                            <ListItem
                                                key={`${(node as NewAnalysisNode).data.name}-${link.from}-${link.to}`}
                                                slotProps={{
                                                    root: {
                                                        onMouseEnter: () =>
                                                            appDispatch(
                                                                setHoveredAnalysis((node as NewAnalysisNode).id)
                                                            ),
                                                        onMouseLeave: () => appDispatch(clearHoveredAnalysis())
                                                    }
                                                }}
                                            >
                                                {selectedAnalysis.value === (node as NewAnalysisNode).data.name &&
                                                    selectedAnalysis.existing === true &&
                                                    nodeLink.from === link.from &&
                                                    nodeLink.to === link.to && (
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
                                                    disabled={checkEdgetoCurrHandleExists(link.to)}
                                                    label={
                                                        <CheckboxLabel
                                                            name={
                                                                dependencyGraph[(node as NewAnalysisNode).data.name] !==
                                                                undefined
                                                                    ? dependencyGraph[
                                                                          (node as NewAnalysisNode).data.name
                                                                      ].pretty_name
                                                                    : (node as NewAnalysisNode).data.name
                                                            }
                                                            from={link.from}
                                                            to={link.to}
                                                            disabled={checkEdgetoCurrHandleExists(link.to)}
                                                        />
                                                    }
                                                    checked={
                                                        selectedAnalysis.value ===
                                                            (node as NewAnalysisNode).data.name &&
                                                        selectedAnalysis.existing === true &&
                                                        nodeLink.from === link.from &&
                                                        nodeLink.to === link.to
                                                    }
                                                    variant={
                                                        selectedAnalysis.value ===
                                                            (node as NewAnalysisNode).data.name &&
                                                        selectedAnalysis.existing === true &&
                                                        nodeLink.from === link.from &&
                                                        nodeLink.to === link.to
                                                            ? "soft"
                                                            : "outlined"
                                                    }
                                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                        if (event.target.checked) {
                                                            setSelectedAnalysis({
                                                                value: (node as NewAnalysisNode).data.name,
                                                                existing: true
                                                            });
                                                            setNodeLink(link);
                                                        } else {
                                                            setSelectedAnalysis({ value: "", existing: false });
                                                            setNodeLink({ from: "", to: "" });
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
                                        );
                                    });
                                } else if (
                                    sidePanelData.type === "next" &&
                                    dependencyGraph[sidePanelData.currentAnalysis.name].after[
                                        (node as NewAnalysisNode).data.name
                                    ] !== undefined
                                ) {
                                    return dependencyGraph[sidePanelData.currentAnalysis.name].after[
                                        (node as NewAnalysisNode).data.name
                                    ].map((link: { from: string; to: string }) => {
                                        return (
                                            <ListItem
                                                key={`${(node as NewAnalysisNode).data.name}-${link.from}-${link.to}`}
                                                slotProps={{
                                                    root: {
                                                        onMouseEnter: () =>
                                                            appDispatch(
                                                                setHoveredAnalysis((node as NewAnalysisNode).id)
                                                            ),
                                                        onMouseLeave: () => appDispatch(clearHoveredAnalysis())
                                                    }
                                                }}
                                            >
                                                {selectedAnalysis.value === (node as NewAnalysisNode).data.name &&
                                                    selectedAnalysis.existing === true &&
                                                    nodeLink.from === link.from &&
                                                    nodeLink.to === link.to && (
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
                                                    disabled={checkEdgetoTargetHandleExists(
                                                        link.to,
                                                        node as NewAnalysisNode
                                                    )}
                                                    label={
                                                        <CheckboxLabel
                                                            name={
                                                                dependencyGraph[(node as NewAnalysisNode).data.name] !==
                                                                undefined
                                                                    ? dependencyGraph[
                                                                          (node as NewAnalysisNode).data.name
                                                                      ].pretty_name
                                                                    : (node as NewAnalysisNode).data.name
                                                            }
                                                            from={link.from}
                                                            to={link.to}
                                                            disabled={checkEdgetoTargetHandleExists(
                                                                link.to,
                                                                node as NewAnalysisNode
                                                            )}
                                                        />
                                                    }
                                                    checked={
                                                        selectedAnalysis.value ===
                                                            (node as NewAnalysisNode).data.name &&
                                                        selectedAnalysis.existing === true &&
                                                        nodeLink.from === link.from &&
                                                        nodeLink.to === link.to
                                                    }
                                                    variant={
                                                        selectedAnalysis.value ===
                                                            (node as NewAnalysisNode).data.name &&
                                                        selectedAnalysis.existing === true &&
                                                        nodeLink.from === link.from &&
                                                        nodeLink.to === link.to
                                                            ? "soft"
                                                            : "outlined"
                                                    }
                                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                        if (event.target.checked) {
                                                            setSelectedAnalysis({
                                                                value: (node as NewAnalysisNode).data.name,
                                                                existing: true
                                                            });
                                                            setNodeLink(link);
                                                        } else {
                                                            setSelectedAnalysis({ value: "", existing: false });
                                                            setNodeLink({ from: "", to: "" });
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
                                        );
                                    });
                                }
                                return null;
                            })}
                        </List>
                    </Box>
                )}
                {dependencyGraph !== null && (
                    <Box sx={{ padding: "2px" }}>
                        <Typography
                            level="h4"
                            sx={{
                                fontWeight: 500,
                                fontSize: "16px",
                                lineHeight: "18px",
                                color: "#172B4D",
                                mb: "5px"
                            }}
                        >
                            {sidePanelData.type === "previous"
                                ? "From new workflow analysis"
                                : "To new workflow analysis"}
                        </Typography>
                        <List
                            sx={{
                                "--List-gap": "8px",
                                "--ListItem-minHeight": "32px",
                                "--ListItem-gap": "4px"
                            }}
                        >
                            {availableAnalyses.map((analysis) => {
                                if (
                                    sidePanelData.type === "previous" &&
                                    dependencyGraph[sidePanelData.currentAnalysis.name].before[analysis] !== undefined
                                ) {
                                    return dependencyGraph[sidePanelData.currentAnalysis.name].before[analysis].map(
                                        (link: { from: string; to: string }) => {
                                            return (
                                                <ListItem key={`${analysis}-${link.from}-${link.to}`}>
                                                    {selectedAnalysis.value === analysis &&
                                                        selectedAnalysis.existing === false &&
                                                        nodeLink.from === link.from &&
                                                        nodeLink.to === link.to && (
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
                                                        disabled={checkEdgetoCurrHandleExists(link.to)}
                                                        label={
                                                            <CheckboxLabel
                                                                name={
                                                                    dependencyGraph[analysis] !== undefined
                                                                        ? dependencyGraph[analysis].pretty_name
                                                                        : analysis
                                                                }
                                                                from={link.from}
                                                                to={link.to}
                                                                disabled={checkEdgetoCurrHandleExists(link.to)}
                                                            />
                                                        }
                                                        checked={
                                                            selectedAnalysis.value === analysis &&
                                                            selectedAnalysis.existing === false &&
                                                            nodeLink.from === link.from &&
                                                            nodeLink.to === link.to
                                                        }
                                                        variant={
                                                            selectedAnalysis.value === analysis &&
                                                            selectedAnalysis.existing === false &&
                                                            nodeLink.from === link.from &&
                                                            nodeLink.to === link.to
                                                                ? "soft"
                                                                : "outlined"
                                                        }
                                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                            if (event.target.checked) {
                                                                setSelectedAnalysis({
                                                                    value: analysis,
                                                                    existing: false
                                                                });
                                                                setNodeLink(link);
                                                            } else {
                                                                setSelectedAnalysis({ value: "", existing: false });
                                                                setNodeLink({ from: "", to: "" });
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
                                            );
                                        }
                                    );
                                } else if (
                                    sidePanelData.type === "next" &&
                                    dependencyGraph[sidePanelData.currentAnalysis.name].after[analysis] !== undefined
                                ) {
                                    return dependencyGraph[sidePanelData.currentAnalysis.name].after[analysis].map(
                                        (link: { from: string; to: string }) => {
                                            return (
                                                <ListItem key={`${analysis}-${link.from}-${link.to}`}>
                                                    {selectedAnalysis.value === analysis &&
                                                        selectedAnalysis.existing === false &&
                                                        nodeLink.from === link.from &&
                                                        nodeLink.to === link.to && (
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
                                                            <CheckboxLabel
                                                                name={
                                                                    dependencyGraph[analysis] !== undefined
                                                                        ? dependencyGraph[analysis].pretty_name
                                                                        : analysis
                                                                }
                                                                from={link.from}
                                                                to={link.to}
                                                                disabled={checkEdgetoCurrHandleExists(link.to)}
                                                            />
                                                        }
                                                        checked={
                                                            selectedAnalysis.value === analysis &&
                                                            selectedAnalysis.existing === false &&
                                                            nodeLink.from === link.from &&
                                                            nodeLink.to === link.to
                                                        }
                                                        variant={
                                                            selectedAnalysis.value === analysis &&
                                                            selectedAnalysis.existing === false &&
                                                            nodeLink.from === link.from &&
                                                            nodeLink.to === link.to
                                                                ? "soft"
                                                                : "outlined"
                                                        }
                                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                            if (event.target.checked) {
                                                                setSelectedAnalysis({
                                                                    value: analysis,
                                                                    existing: false
                                                                });
                                                                setNodeLink(link);
                                                            } else {
                                                                setSelectedAnalysis({ value: "", existing: false });
                                                                setNodeLink({ from: "", to: "" });
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
                                            );
                                        }
                                    );
                                }
                                return null;
                            })}
                        </List>
                    </Box>
                )}
                <Button
                    variant="solid"
                    sx={{ backgroundColor: "primary.main" }}
                    startDecorator={<AddRoundedIcon />}
                    disabled={selectedAnalysis.value === ""}
                    fullWidth
                    onClick={() => {
                        if (selectedAnalysis.value !== "" && !selectedAnalysis.existing) {
                            const newNode = getNodeFromToolV2(
                                datawolfTools.find((tool) => tool.title === selectedAnalysis.value),
                                dependencyGraph
                            );
                            const edgeToAdd = getEdgeFromCurrentAnalysis(newNode);
                            if (newNode !== null) {
                                addNodes([newNode]);
                            }
                            if (edgeToAdd !== null) {
                                addEdges([edgeToAdd]);
                            }
                            clearItems();
                        } else if (selectedAnalysis.value !== "" && selectedAnalysis.existing) {
                            const existingNode = nodes.find(
                                (node) => (node as NewAnalysisNode).data.name === selectedAnalysis.value
                            ) as NewAnalysisNode;
                            const edgeToRemove = getEdgeToRemoveFromExistingAnalysis(existingNode);
                            const edgeToAdd = getEdgeFromCurrentAnalysis(existingNode);
                            if (edgeToRemove !== null && edgeToAdd !== null) {
                                setEdges([...edges.filter((ed) => ed.id !== edgeToRemove.id), edgeToAdd as Edge]);
                            } else if (edgeToRemove === null && edgeToAdd !== null) {
                                addEdges([edgeToAdd]);
                            }
                            clearItems();
                        }
                    }}
                >
                    Add
                </Button>
            </Stack>
        </Sheet>
    );
};

export default SidePanel;
