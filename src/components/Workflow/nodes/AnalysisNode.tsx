import React from "react";
import { Handle, Position, type NodeProps, getIncomers, getOutgoers, getConnectedEdges } from "@xyflow/react";
import { Box, Button, Typography, Stack, IconButton, Tooltip } from "@mui/joy";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import { useShallow } from "zustand/react/shallow";

import { type AnalysisNode } from "@app/components/Workflow/nodes";
import useStore, { type ReactFlowAppState } from "../reactFlowStore";

const selector = (state: ReactFlowAppState) => ({
    nodes: state.nodes,
    edges: state.edges,
    setNodes: state.setNodes,
    setEdges: state.setEdges
});

export function AnalysisNode({
    id,
    data,
    sourcePosition,
    targetPosition,
    selected
}: NodeProps<AnalysisNode>): JSX.Element{
    const { nodes, edges, setNodes, setEdges } = useStore(useShallow(selector));

    const handleDelete = () => {
        const node = nodes.find((n) => n.id === id);
        if (node) {
            const incomers = getIncomers(node, nodes, edges);
            const outgoers = getOutgoers(node, nodes, edges);
            let nodesTobeDeleted = [node];
            nodesTobeDeleted = nodesTobeDeleted.concat(incomers).concat(outgoers);

            let connectedEdges = getConnectedEdges([node], edges);

            incomers.forEach((incomer) => {
                connectedEdges = connectedEdges.concat(
                    getConnectedEdges([incomer], edges).filter(
                        (edge) => connectedEdges.find((e) => e.id === edge.id) === undefined
                    )
                );
            });

            outgoers.forEach((outgoer) => {
                connectedEdges = connectedEdges.concat(
                    getConnectedEdges([outgoer], edges).filter(
                        (edge) => connectedEdges.find((e) => e.id === edge.id) === undefined
                    )
                );
            });

            setNodes(nodes.filter((n) => !nodesTobeDeleted.includes(n)));
            setEdges(edges.filter((e) => !connectedEdges.includes(e)));
        }
    };

    return (
        <Box
            sx={{
                border: selected ? "3px solid #EF6C00" : "2px solid black",
                borderRadius: "3px",
                padding: "16px 24px 16px 24px",
                gap: "20px",
                backgroundColor: "white",
                height: "auto",
                width: "250px",
                wordWrap: "break-word",
                hyphens: "auto"
            }}
        >
            <Handle
                type="target"
                position={targetPosition || Position.Top}
                style={{
                    width: "14px",
                    height: "30px",
                    borderRadius: "3px",
                    backgroundColor: "#007DFF"
                }}
            />
            <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TrendingUpIcon sx={{ color: "#EF6C00", marginRight: "5px" }} />
                    <Typography
                        level="h4"
                        sx={{ fontWeight: 400, fontSize: "16px", lineHeight: "24px", color: "#EF6C00" }}
                    >
                        Analysis Type
                    </Typography>
                </Box>
                <Box sx={{ alignContent: "center" }}>
                    <Tooltip title="Delete" variant="plain" color="neutral" placement="right" sx={{ color: "#172B4D" }}>
                        <IconButton variant="plain" onClick={handleDelete}>
                            <CancelRoundedIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Stack>
            <Stack direction="column" spacing={4}>
                <Box sx={{ marginTop: "5px" }}>
                    <Typography level="h2" sx={{ fontWeight: 600, fontSize: "24px", lineHeight: "28.64px" }}>
                        {data.label}
                    </Typography>
                </Box>
                <Button
                    variant="solid"
                    sx={{ backgroundColor: "#EF6C00", color: "white", fontWeight: 600 }}
                    startDecorator={<AddRoundedIcon />}
                >
                    Add previous
                </Button>
                <Button
                    variant="solid"
                    sx={{ backgroundColor: "#EF6C00", color: "white", fontWeight: 600 }}
                    startDecorator={<AddRoundedIcon />}
                >
                    Add Next
                </Button>
            </Stack>
            <Handle
                type="source"
                position={sourcePosition || Position.Bottom}
                style={{
                    width: "14px",
                    height: "30px",
                    borderRadius: "3px",
                    backgroundColor: "#AB47BC"
                }}
            />
        </Box>
    );
};
