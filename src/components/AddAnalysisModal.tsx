import React from "react";

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
    Typography
} from "@mui/joy";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import Done from "@mui/icons-material/Done";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { type Edge, MarkerType } from "@xyflow/react";

import { useShallow } from "zustand/react/shallow";

import { useAppSelector } from "@app/store/hooks";
import { type NewAnalysisNode } from "@app/components/Workflow/nodes";
import { getNodeFromToolV2 } from "@app/components/Workflow/workflowUtils";
import useStore, { type ReactFlowAppState } from "./Workflow/reactFlowStore";

interface AddAnalysisModalProps {
    selectAnalysisModalOpen: boolean;
    setSelectAnalysisModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    dependencyGraph: any;
    isEmpty?: boolean;
    previousAnalysis?: boolean;
    currentAnalysis?: {
        name: string;
        id: string;
    };
}

const selector = (state: ReactFlowAppState) => ({
    nodes: state.nodes,
    edges: state.edges,
    addNodes: state.addNodes,
    addEdges: state.addEdges
});

const AddAnalysisModal = ({
    selectAnalysisModalOpen,
    setSelectAnalysisModalOpen,
    dependencyGraph,
    isEmpty,
    previousAnalysis,
    currentAnalysis
}: AddAnalysisModalProps) => {
    const [selectedAnalysis, setSelectedAnalysis] = React.useState<string>("");
    const [searchAnalysisTerm, setSearchAnalysisTerm] = React.useState<string>("");
    const [availableAnalyses, setAvailableAnalyses] = React.useState<string[]>([]);
    const [srcNodeName, setSrcNodeName] = React.useState<string>("");
    const [destNodeName, setDestNodeName] = React.useState<string>("");

    const { nodes, edges, addNodes, addEdges } = useStore(useShallow(selector));
    const datawolfTools = useAppSelector((state) => state.workflow.datawolfTools);

    const clearItems = () => {
        setSelectedAnalysis("");
        setSearchAnalysisTerm("");
        setSelectAnalysisModalOpen(false);
    };

    const checkEdgetoHandleExists = (nodeNameLabel: string): boolean => {
        if (currentAnalysis !== undefined) {
            const currAnalysisNode = nodes.find((node) => node.id === currentAnalysis.id) as NewAnalysisNode;
            if (currAnalysisNode && previousAnalysis) {
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

    const getEdgeFromCurrentAnalysis = (newNode: NewAnalysisNode | null): Edge | null => {
        if (currentAnalysis !== undefined && newNode !== null) {
            const currAnalysisNode = nodes.find((node) => node.id === currentAnalysis.id) as NewAnalysisNode;
            console.log(currAnalysisNode);
            if (currAnalysisNode) {
                let srcNodeHandleId: string | null = null;
                let destNodeHandleId: string | null = null;
                let srcId = "";
                let tarId = "";
                if (previousAnalysis) {
                    srcId = newNode.id;
                    tarId = currAnalysisNode.id;
                    newNode.data.outputHandles.forEach((handle) => {
                        if (handle.label === srcNodeName) {
                            srcNodeHandleId = handle.id;
                        }
                    });
                    currAnalysisNode.data.inputHandles.forEach((handle) => {
                        if (handle.label === destNodeName) {
                            destNodeHandleId = handle.id;
                        }
                    });
                } else {
                    srcId = currAnalysisNode.id;
                    tarId = newNode.id;
                    currAnalysisNode.data.outputHandles.forEach((handle) => {
                        if (handle.label === srcNodeName) {
                            srcNodeHandleId = handle.id;
                        }
                    });
                    newNode.data.inputHandles.forEach((handle) => {
                        if (handle.label === destNodeName) {
                            destNodeHandleId = handle.id;
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

    return (
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
                                {availableAnalyses.map((analysis) => {
                                    if (isEmpty) {
                                        return (
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
                                                        dependencyGraph !== undefined &&
                                                        dependencyGraph[analysis] !== undefined
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
                                        );
                                    }
                                    if (dependencyGraph !== undefined && currentAnalysis !== undefined) {
                                        if (previousAnalysis !== undefined) {
                                            if (dependencyGraph[currentAnalysis.name].before[analysis] !== undefined) {
                                                return dependencyGraph[currentAnalysis.name].before[analysis].map(
                                                    (link: { from: string; to: string }) => {
                                                        return (
                                                            <ListItem key={`${analysis}-${link.from}-${link.to}`}>
                                                                {selectedAnalysis === analysis &&
                                                                    srcNodeName === link.from &&
                                                                    destNodeName === link.to && (
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
                                                                    disabled={checkEdgetoHandleExists(link.to)}
                                                                    label={
                                                                        dependencyGraph !== undefined &&
                                                                        dependencyGraph[analysis] !== undefined
                                                                            ? `${dependencyGraph[analysis].pretty_name},  from: ${link.from} --> to: ${link.to}`
                                                                            : `${analysis},  from: ${link.from}  --> to: ${link.to}`
                                                                    }
                                                                    checked={
                                                                        selectedAnalysis === analysis &&
                                                                        srcNodeName === link.from &&
                                                                        destNodeName === link.to
                                                                    }
                                                                    variant={
                                                                        selectedAnalysis === analysis &&
                                                                        srcNodeName === link.from &&
                                                                        destNodeName === link.to
                                                                            ? "soft"
                                                                            : "outlined"
                                                                    }
                                                                    onChange={(
                                                                        event: React.ChangeEvent<HTMLInputElement>
                                                                    ) => {
                                                                        if (event.target.checked) {
                                                                            setSelectedAnalysis(analysis);
                                                                            setSrcNodeName(link.from);
                                                                            setDestNodeName(link.to);
                                                                        } else {
                                                                            setSelectedAnalysis("");
                                                                            setSrcNodeName("");
                                                                            setDestNodeName("");
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
                                        } else if (
                                            dependencyGraph[currentAnalysis.name].after[analysis] !== undefined
                                        ) {
                                            return dependencyGraph[currentAnalysis.name].after[analysis].map(
                                                (link: { from: string; to: string }) => {
                                                    return (
                                                        <ListItem key={`${analysis}-${link.from}-${link.to}`}>
                                                            {selectedAnalysis === analysis &&
                                                                srcNodeName === link.from &&
                                                                destNodeName === link.to && (
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
                                                                    dependencyGraph !== undefined &&
                                                                    dependencyGraph[analysis] !== undefined
                                                                        ? `${dependencyGraph[analysis].pretty_name},  from: ${link.from} --> to: ${link.to}`
                                                                        : `${analysis},  from: ${link.from} --> to: ${link.to}`
                                                                }
                                                                checked={
                                                                    selectedAnalysis === analysis &&
                                                                    srcNodeName === link.from &&
                                                                    destNodeName === link.to
                                                                }
                                                                variant={
                                                                    selectedAnalysis === analysis &&
                                                                    srcNodeName === link.from &&
                                                                    destNodeName === link.to
                                                                        ? "soft"
                                                                        : "outlined"
                                                                }
                                                                onChange={(
                                                                    event: React.ChangeEvent<HTMLInputElement>
                                                                ) => {
                                                                    if (event.target.checked) {
                                                                        setSelectedAnalysis(analysis);
                                                                        setSrcNodeName(link.from);
                                                                        setDestNodeName(link.to);
                                                                    } else {
                                                                        setSelectedAnalysis("");
                                                                        setSrcNodeName("");
                                                                        setDestNodeName("");
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
                                    }
                                    return null;
                                })}
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
                                const newNode = getNodeFromToolV2(
                                    datawolfTools.find((tool) => tool.title === selectedAnalysis)
                                );
                                const edgeToAdd = getEdgeFromCurrentAnalysis(newNode);
                                clearItems();
                                if (newNode !== null) {
                                    addNodes([newNode]);
                                }
                                if (edgeToAdd !== null) {
                                    addEdges([edgeToAdd]);
                                }
                            }
                        }}
                    >
                        Add
                    </Button>
                </CardActions>
            </Card>
        </Modal>
    );
};

export default AddAnalysisModal;
