import React from "react";

import { Alert, Box, Button, Input, Divider, Sheet, Stack, IconButton, Tooltip, Typography } from "@mui/joy";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { type Edge, MarkerType } from "@xyflow/react";

import { useShallow } from "zustand/react/shallow";

import { type NewAnalysisNode } from "@app/components/Workflow/nodes";
import { getNodeFromToolV2 } from "@app/components/Workflow/workflowUtils";
import useStore, { type ReactFlowAppState } from "@app/components/Workflow/reactFlowStore";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import { clearSidePanelData } from "@app/reducer/workflowSlice";
import GroupedList from "./GroupedList";

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

    const [selectedAnalysis, setSelectedAnalysis] = React.useState<{
        value: string;
        existing: boolean;
        analysisId: string | null;
    }>({
        value: "",
        existing: false,
        analysisId: null
    });
    const [searchAnalysisTerm, setSearchAnalysisTerm] = React.useState<string>("");
    const [availableAnalyses, setAvailableAnalyses] = React.useState<string[]>([]);
    const [nodeLink, setNodeLink] = React.useState<{ from: string; to: string }>({ from: "", to: "" });

    const clearItems = () => {
        setSelectedAnalysis({ value: "", existing: false, analysisId: null });
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

    const checkEdgetoTargetHandleExists = (nodeNameLabel: string, targetNode: NewAnalysisNode | undefined): boolean => {
        if (!targetNode) {
            return false;
        }
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
                    const srcHandle = existingNode.data.outputHandles.find((handle) => handle.label === nodeLink.from);
                    const edg = edges.find(
                        (ed) =>
                            ed.source === existingNode.id &&
                            ed.target === currAnalysisNode.id &&
                            ed.sourceHandle === srcHandle?.id
                    );
                    if (edg) {
                        return edg;
                    }
                } else {
                    const targetHandle = currAnalysisNode.data.outputHandles.find(
                        (handle) => handle.label === nodeLink.from
                    );
                    const edg = edges.find(
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

    const getGroupedEntries = (
        before: boolean,
        analyses: NewAnalysisNode[]
    ): Map<
        string,
        {
            analysisName: string;
            analysisProperty: string;
            analysisNode: NewAnalysisNode;
            link: { from: string; to: string };
        }[]
    > => {
        const restructuredData = new Map<
            string,
            {
                analysisName: string;
                analysisProperty: string;
                analysisNode: NewAnalysisNode;
                link: { from: string; to: string };
            }[]
        >();
        if (dependencyGraph !== null) {
            analyses.forEach((analysis) => {
                if (
                    before &&
                    dependencyGraph[sidePanelData.currentAnalysis.name].before[analysis.data.name] !== undefined
                ) {
                    dependencyGraph[sidePanelData.currentAnalysis.name].before[analysis.data.name].forEach(
                        (link: { from: string; to: string }) => {
                            if (restructuredData.has(link.to)) {
                                restructuredData.get(link.to)?.push({
                                    analysisName: analysis.data.name,
                                    analysisProperty: link.from,
                                    analysisNode: analysis,
                                    link
                                });
                            } else {
                                restructuredData.set(link.to, [
                                    {
                                        analysisName: analysis.data.name,
                                        analysisProperty: link.from,
                                        analysisNode: analysis,
                                        link
                                    }
                                ]);
                            }
                        }
                    );
                } else if (
                    !before &&
                    dependencyGraph[sidePanelData.currentAnalysis.name].after[analysis.data.name] !== undefined
                ) {
                    dependencyGraph[sidePanelData.currentAnalysis.name].after[analysis.data.name].forEach(
                        (link: { from: string; to: string }) => {
                            if (restructuredData.has(link.from)) {
                                restructuredData.get(link.from)?.push({
                                    analysisName: analysis.data.name,
                                    analysisProperty: link.to,
                                    analysisNode: analysis,
                                    link
                                });
                            } else {
                                restructuredData.set(link.from, [
                                    {
                                        analysisName: analysis.data.name,
                                        analysisProperty: link.to,
                                        analysisNode: analysis,
                                        link
                                    }
                                ]);
                            }
                        }
                    );
                }
            });
        }
        return restructuredData;
    };

    const getGroupedEntriesForNew = (
        before: boolean,
        analyses: string[]
    ): Map<
        string,
        {
            analysisName: string;
            analysisProperty: string;
            link: { from: string; to: string };
        }[]
    > => {
        const restructuredData = new Map<
            string,
            {
                analysisName: string;
                analysisProperty: string;
                link: { from: string; to: string };
            }[]
        >();
        if (dependencyGraph !== null) {
            analyses.forEach((analysis) => {
                if (before && dependencyGraph[sidePanelData.currentAnalysis.name].before[analysis] !== undefined) {
                    dependencyGraph[sidePanelData.currentAnalysis.name].before[analysis].forEach(
                        (link: { from: string; to: string }) => {
                            if (restructuredData.has(link.to)) {
                                restructuredData.get(link.to)?.push({
                                    analysisName: analysis,
                                    analysisProperty: link.from,
                                    link
                                });
                            } else {
                                restructuredData.set(link.to, [
                                    {
                                        analysisName: analysis,
                                        analysisProperty: link.from,
                                        link
                                    }
                                ]);
                            }
                        }
                    );
                } else if (
                    !before &&
                    dependencyGraph[sidePanelData.currentAnalysis.name].after[analysis] !== undefined
                ) {
                    dependencyGraph[sidePanelData.currentAnalysis.name].after[analysis].forEach(
                        (link: { from: string; to: string }) => {
                            if (restructuredData.has(link.from)) {
                                restructuredData.get(link.from)?.push({
                                    analysisName: analysis,
                                    analysisProperty: link.to,
                                    link
                                });
                            } else {
                                restructuredData.set(link.from, [
                                    {
                                        analysisName: analysis,
                                        analysisProperty: link.to,
                                        link
                                    }
                                ]);
                            }
                        }
                    );
                }
            });
        }
        return restructuredData;
    };
    React.useEffect(() => {
        if (dependencyGraph !== null) {
            let toolNames = datawolfTools.map((tool) => tool.title).sort();
            toolNames = toolNames
                .filter((tool) => dependencyGraph[tool] !== undefined)
                .filter(
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
                maxHeight: "90vh",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <Stack direction="row" justifyContent="space-between" alignItems="center" padding="12px">
                <Typography
                    level="h4"
                    sx={{
                        fontWeight: 600,
                        fontSize: "18px",
                        lineHeight: "22px",
                        color: "#172B4D"
                    }}
                >
                    Configure the {sidePanelData.type} analysis
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
                    <Box
                        sx={{
                            p: "1px",
                            height: "20px",
                            width: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            pointerEvents: "none",
                            borderRadius: "3px",
                            backgroundColor: "#EF6C00",
                            marginRight: "10px"
                        }}
                    >
                        <TrendingUpRoundedIcon sx={{ color: "white", fontSize: "16px" }} />
                    </Box>
                    <Typography
                        level="h3"
                        sx={{
                            fontWeight: 700,
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
                <Divider role="presentation" sx={{ my: 1 }} />
                {dependencyGraph !== null && (
                    <Box sx={{ padding: "2px" }}>
                        <Typography
                            level="h4"
                            sx={{
                                fontWeight: 600,
                                fontSize: "18px",
                                lineHeight: "24px",
                                paragraph: "28px",
                                color: "#172B4D",
                                letter: "5%",
                                textTransform: "uppercase",
                                mb: "15px"
                            }}
                        >
                            {`Connect ${sidePanelData.type === "previous" ? "From" : "To"} existing analysis`}
                        </Typography>
                        {Array.from(
                            getGroupedEntries(
                                sidePanelData.type === "previous",
                                nodes.map((node) => node as NewAnalysisNode)
                            ).entries()
                        ).map(
                            ([key, value]: [
                                string,
                                {
                                    analysisName: string;
                                    analysisProperty: string;
                                    analysisNode: NewAnalysisNode;
                                    link: { from: string; to: string };
                                }[]
                            ]) => {
                                return (
                                    <GroupedList
                                        key={`${key}`}
                                        existing
                                        previous={sidePanelData.type === "previous"}
                                        propertyName={key}
                                        optionsList={value}
                                        selectedAnalysis={selectedAnalysis}
                                        nodeLink={nodeLink}
                                        setSelectedAnalysis={setSelectedAnalysis}
                                        setNodeLink={setNodeLink}
                                        checkEdgetoCurrHandleExists={checkEdgetoCurrHandleExists}
                                        checkEdgetoTargetHandleExists={checkEdgetoTargetHandleExists}
                                    />
                                );
                            }
                        )}
                        {Array.from(
                            getGroupedEntries(
                                sidePanelData.type === "previous",
                                nodes.map((node) => node as NewAnalysisNode)
                            ).entries()
                        ).length === 0 && (
                            <Alert startDecorator={<ErrorOutlineRoundedIcon />} color="primary">
                                <Typography level="body-md" sx={{ color: "#172B4D" }}>
                                    No existing analyses found to connect.
                                </Typography>
                            </Alert>
                        )}
                    </Box>
                )}
                <Divider role="presentation" sx={{ my: 1 }} />
                {dependencyGraph !== null && (
                    <Box sx={{ padding: "2px" }}>
                        <Typography
                            level="h4"
                            sx={{
                                fontWeight: 600,
                                fontSize: "18px",
                                lineHeight: "24px",
                                paragraph: "28px",
                                color: "#172B4D",
                                letter: "5%",
                                textTransform: "uppercase",
                                mb: "15px"
                            }}
                        >
                            {`Connect ${sidePanelData.type === "previous" ? "From" : "To"} New analysis`}
                        </Typography>
                        <Box sx={{ mb: "20px" }}>
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
                                    if (/^[A-Za-z0-9 _-]*$/.test(e.target.value)) {
                                        setSearchAnalysisTerm(e.target.value.toLowerCase());
                                    }
                                }}
                            />
                        </Box>
                        <Stack spacing={3} direction="column">
                            {Array.from(
                                getGroupedEntriesForNew(sidePanelData.type === "previous", availableAnalyses).entries()
                            ).map(
                                ([key, value]: [
                                    string,
                                    {
                                        analysisName: string;
                                        analysisProperty: string;
                                        link: { from: string; to: string };
                                    }[]
                                ]) => {
                                    return (
                                        <GroupedList
                                            key={`${key}`}
                                            existing={false}
                                            previous={sidePanelData.type === "previous"}
                                            propertyName={key}
                                            optionsList={value}
                                            selectedAnalysis={selectedAnalysis}
                                            nodeLink={nodeLink}
                                            setSelectedAnalysis={setSelectedAnalysis}
                                            setNodeLink={setNodeLink}
                                            checkEdgetoCurrHandleExists={checkEdgetoCurrHandleExists}
                                            checkEdgetoTargetHandleExists={checkEdgetoTargetHandleExists}
                                        />
                                    );
                                }
                            )}
                            {Array.from(
                                getGroupedEntriesForNew(sidePanelData.type === "previous", availableAnalyses).entries()
                            ).length === 0 && (
                                <Alert startDecorator={<ErrorOutlineRoundedIcon />} color="primary">
                                    <Typography level="body-md" sx={{ color: "#172B4D" }}>
                                        No new analyses found to connect.
                                    </Typography>
                                </Alert>
                            )}
                        </Stack>
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
                                (node) => node.id === selectedAnalysis.analysisId
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
