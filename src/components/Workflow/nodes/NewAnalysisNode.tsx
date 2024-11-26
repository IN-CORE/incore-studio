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

import { useShallow } from "zustand/react/shallow";

import { type NewAnalysisNode } from "@app/components/Workflow/nodes";
import { useAppDispatch, useAppSelector } from "@app/store/hooks";
import { setSidePanelData } from "@app/reducer/workflowSlice";
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

    React.useEffect(() => {
        updateNodeInternals(id);
    }, [zoom]);

    const handleDelete = () => {
        const node = nodes.find((n) => n.id === id);
        if (node) {
            let nodesTobeDeleted = [node];

            let connectedEdges = getConnectedEdges([node], edges);

            setNodes(nodes.filter((n) => !nodesTobeDeleted.includes(n)));
            setEdges(edges.filter((e) => !connectedEdges.includes(e)));
        }
    };

    // Function to calculate positions (percentage) based on the number of handles
    const calculateHandlePosition = (index: number, total: number) => {
        return (index + 1) * (100 / (total + 1));
    };
    const MIN_HEIGHT = data.inputHandles.length * 20 + 60;

    return (
        <Box
            sx={{
                border: selected || hoveredAnalysisID === id ? "4px solid #EF6C00" : "2px solid black",
                borderRadius: "3px",
                padding: "6px 14px 6px 14px",
                backgroundColor: selected ? "#FFE3CC" : "white",
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
            {zoom > 1 && (
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
            )}
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
                        <Typography level="h2" sx={{ fontWeight: 600, fontSize: zoom > 1 ? "24px" : "28px" }}>
                            {data.label}
                        </Typography>
                    </Box>
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
                </Box>
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
                                    currentAnalysis: { name: data.name, id: id }
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
                                    currentAnalysis: { name: data.name, id: id }
                                })
                            );
                        }}
                    >
                        Add Next
                    </Button>
                </Stack>
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
        </Box>
    );
}
