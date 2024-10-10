import React from "react";
import { Handle, Position, type NodeProps, getIncomers, getOutgoers, getConnectedEdges } from "@xyflow/react";
import { Box, Button, Typography, Stack, IconButton, Tooltip } from "@mui/joy";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
// import StorageIcon from "@mui/icons-material/Storage";

import { useShallow } from "zustand/react/shallow";

import { type ExperimentalNode } from "@app/components/Workflow/nodes";
import AddAnalysisModal from "@app/components/AddAnalysisModal";
import useStore, { type ReactFlowAppState } from "../reactFlowStore";
import dependencyGraph from "@app/components/WorkflowEditor/dependency_graph.json";

const selector = (state: ReactFlowAppState) => ({
    nodes: state.nodes,
    edges: state.edges,
    setNodes: state.setNodes,
    setEdges: state.setEdges
});

export function ExperimentalNode({ id, data, selected }: NodeProps<ExperimentalNode>): JSX.Element {
    const { nodes, edges, setNodes, setEdges } = useStore(useShallow(selector));

    const [selectPreviousAnalysisModalOpen, setSelectPreviousAnalysisModalOpen] = React.useState<boolean>(false);
    const [selectAfterAnalysisModalOpen, setSelectAfterAnalysisModalOpen] = React.useState<boolean>(false);

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

    // Function to calculate positions (percentage) based on the number of handles
    const calculateHandlePosition = (index: number, total: number) => {
        return (index + 1) * (100 / (total + 1));
    };

    return (
        <Box
            sx={{
                border: selected ? "3px solid #EF6C00" : "2px solid black",
                borderRadius: "3px",
                padding: "6px 14px 6px 14px",
                backgroundColor: "white",
                height: "auto",
                width: "400px",
                wordWrap: "break-word",
                hyphens: "auto"
            }}
        >
            {data.inputHandles.map((inpt, index) => (
                // <Tooltip
                //     title={inpt.label}
                //     variant="plain"
                //     color="neutral"
                //     placement="right"
                //     sx={{ color: "#172B4D", fontWeight: 400, fontSize: "16px", lineHeight: "24px" }}
                // >
                <Box
                    display="flex"
                    alignContent="center"
                    key={inpt.label}
                    sx={{
                        position: "absolute",
                        left: 0,
                        top: `${calculateHandlePosition(index, data.inputHandles.length)}%`,
                        transform: "translate(-50%, -50%)"
                    }}
                >
                    <Typography level="h4" sx={{ fontWeight: 400, fontSize: "16px", lineHeight: "24px" }}>
                        {inpt.label}
                    </Typography>
                    <Handle
                        type="target"
                        position={Position.Left}
                        style={{
                            height: "20px",
                            width: "20px",
                            borderRadius: "3px",
                            backgroundColor: "#E3F2FD",
                            borderColor: "#007DFF"
                            // left: "-10%",
                        }}
                        id={inpt.id}
                        key={inpt.label}
                    />
                </Box>
                // </Tooltip>
            ))}
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
                    onClick={() => {
                        setSelectPreviousAnalysisModalOpen(true);
                    }}
                >
                    Add previous
                </Button>
                <Button
                    variant="solid"
                    sx={{ backgroundColor: "#EF6C00", color: "white", fontWeight: 600 }}
                    startDecorator={<AddRoundedIcon />}
                    onClick={() => {
                        setSelectAfterAnalysisModalOpen(true);
                    }}
                >
                    Add Next
                </Button>
            </Stack>
            <AddAnalysisModal
                selectAnalysisModalOpen={selectPreviousAnalysisModalOpen}
                setSelectAnalysisModalOpen={setSelectPreviousAnalysisModalOpen}
                dependencyGraph={dependencyGraph}
                previousAnalysis={true}
                currentAnalysis={{
                    name: data.name,
                    id: id
                }}
            />
            <AddAnalysisModal
                selectAnalysisModalOpen={selectAfterAnalysisModalOpen}
                setSelectAnalysisModalOpen={setSelectAfterAnalysisModalOpen}
                dependencyGraph={dependencyGraph}
                currentAnalysis={{
                    name: data.name,
                    id: id
                }}
            />

            {data.outputHandles.map((outpt, index) => (
                <Tooltip
                    title={outpt.label}
                    variant="plain"
                    color="neutral"
                    placement="left"
                    sx={{ color: "#172B4D", fontWeight: 400, fontSize: "16px", lineHeight: "24px" }}
                >
                    <Handle
                        type="source"
                        position={Position.Right}
                        style={{
                            height: "20px",
                            width: "20px",
                            borderRadius: "3px",
                            backgroundColor: "#AB47BC",
                            top: `${calculateHandlePosition(index, data.outputHandles.length)}%`,
                            right: "-11px",
                            textWrap: "nowrap",
                            textAlign: "center"
                        }}
                        id={outpt.id}
                        key={outpt.label}
                    ></Handle>
                </Tooltip>
            ))}
        </Box>
    );
}
