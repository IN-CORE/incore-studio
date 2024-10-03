import React, { useCallback } from "react";
import {
    Background,
    Controls,
    MiniMap,
    ReactFlow,
    BackgroundVariant,
    useReactFlow,
    ReactFlowProvider,
    Position,
    Panel,
    MarkerType,
    getConnectedEdges
} from "@xyflow/react";
import type { Edge, OnConnect } from "@xyflow/react";
import Dagre from "@dagrejs/dagre";
import { Button, Stack } from "@mui/joy";
import { useShallow } from "zustand/react/shallow";

import useStore, { type ReactFlowAppState } from "./reactFlowStore";
import dependencyGraph from "@app/components/WorkflowEditor/dependency_graph.json";

import { AnalysisInputNode, AnalysisOutputNode, nodeTypes, type AppNode } from "./nodes";
import { edgeTypes } from "./edges";

const getLayoutedElements = (nodes: AppNode[], edges: Edge[]): { nodes: AppNode[]; edges: Edge[] } => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    let direction = "LR";
    let isHorizontal = direction === "LR";
    g.setGraph({ rankdir: direction, nodesep: 100, ranksep: 300 });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) =>
        g.setNode(node.id, {
            ...node,
            width: node.measured?.width ?? 0,
            height: node.measured?.height ?? 0
        })
    );

    Dagre.layout(g);

    return {
        nodes: nodes.map((node) => {
            const position = g.node(node.id);
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            const x = position.x - (node.measured?.width ?? 0) / 2;
            const y = position.y - (node.measured?.height ?? 0) / 2;

            return {
                ...node,
                targetPosition: isHorizontal ? Position.Left : Position.Top,
                sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
                position: { x, y }
            };
        }),
        edges
    };
};

const isConnectible = (srcNode: AppNode | undefined, tgtNode: AppNode | undefined): boolean => {
    if (
        srcNode !== undefined &&
        tgtNode !== undefined &&
        srcNode.type === "analysis-output" &&
        tgtNode.type === "analysis-input" &&
        tgtNode.data.inputData.dataId !== "hazard" &&
        tgtNode.data.inputData.dataId !== "dfr3_mapping"
    ) {
        if (dependencyGraph[srcNode.data.analysisName].after[tgtNode.data.analysisName] !== undefined) {
            return dependencyGraph[srcNode.data.analysisName].after[tgtNode.data.analysisName].some(
                (criteria: { from: string; to: string }) =>
                    srcNode.data.outputData.title === criteria.from && tgtNode.data.inputData.title === criteria.to
            );
        }
    }

    return false;
};

const selector = (state: ReactFlowAppState) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    setNodes: state.setNodes,
    setEdges: state.setEdges
});

const LayoutedWorkflow = () => {
    const { fitView } = useReactFlow();
    const { nodes, edges, onNodesChange, onEdgesChange, setNodes, setEdges } = useStore(useShallow(selector));
    const [layoutApplied, setLayoutApplied] = React.useState(false); // State to check if layout has been applied
    const [nodesReady, setNodesReady] = React.useState(false);

    const onConnect: OnConnect = useCallback(
        (connection) => {
            // prevent self loops
            let srcNode = nodes.find((node) => node.id === connection.source) as AnalysisOutputNode;
            let tgtNode = nodes.find((node) => node.id === connection.target) as AnalysisInputNode;
            let edgeTobeDeletedId = "";
            // allow only 1 input to an input node.
            const existingInputEdges = getConnectedEdges([tgtNode], edges).filter((edge) => edge.target === tgtNode.id);
            if (
                existingInputEdges.length === 0 &&
                connection.source !== connection.target &&
                srcNode &&
                tgtNode &&
                isConnectible(srcNode, tgtNode)
            ) {
                if (dependencyGraph[srcNode.data.analysisName].after[tgtNode.data.analysisName].length > 1) {
                    // we need to remove the existing edge from this src node to one of the input nodes in the target analysis node
                    const connectedEdges = getConnectedEdges([srcNode], edges);
                    const edgeTobeDeleted = connectedEdges.find((edge) => {
                        if (edge.source === srcNode.id && edge.target !== tgtNode.id) {
                            const sameAnalysisNode = nodes.find((node) => node.id === edge.target) as AnalysisInputNode;
                            return sameAnalysisNode.data.analysisName === tgtNode.data.analysisName;
                        }
                        return false;
                    });
                    if (edgeTobeDeleted) {
                        edgeTobeDeletedId = edgeTobeDeleted.id;
                    }
                }
                setEdges([
                    ...edges.filter((edge) => edge.id !== edgeTobeDeletedId),
                    {
                        id: `${connection.source}-${connection.target}`,
                        source: connection.source,
                        target: connection.target,
                        type: "deletableEdge",
                        style: { stroke: "#000000" },
                        markerEnd: { type: MarkerType.ArrowClosed, color: "#000000" }
                    }
                ]);
            }
        },
        [nodes, edges]
    );

    // Function to check if all nodes have non-zero dimensions
    const checkNodesReady = (nodes: AppNode[]) => {
        return nodes.every(
            (node) =>
                node.measured?.width !== undefined &&
                node.measured?.width > 0 &&
                node.measured?.height !== undefined &&
                node.measured?.height > 0
        );
    };

    const fitViewOptions = {
        padding: 0.2,
        duration: 500 // 0.5-second animation
        // minZoom: 0.7 // Minimum zoom level
    };

    const reformatNodes = () => {
        const layouted = getLayoutedElements(nodes, edges);

        setNodes([...layouted.nodes]);
        setEdges([...layouted.edges]);

        // Use requestAnimationFrame to apply the layout after browser is ready to render
        requestAnimationFrame(() => {
            fitView(fitViewOptions);
        });
    };

    const onLayout = useCallback(() => {
        reformatNodes();
        setLayoutApplied(true);
    }, [nodes, edges, fitView]);

    React.useEffect(() => {
        setLayoutApplied(false);
        setNodesReady(false);
    }, [nodes.length]);

    // Automatically layout when all nodes have their dimensions ready
    React.useEffect(() => {
        if (nodesReady && !layoutApplied) {
            onLayout(); // Apply the vertical layout
        }
    }, [nodesReady, layoutApplied]);

    // Use useEffect to apply layout after a delay to ensure nodes have been rendered
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (!layoutApplied) {
                const allNodesReady = checkNodesReady(nodes);
                if (allNodesReady) {
                    setNodesReady(true); // Trigger layout after delay
                }
            }
        }, 250); // Adjust the delay as necessary based on render performance

        return () => clearTimeout(timer);
    }, [nodes, layoutApplied]);

    return (
        <div style={{ width: "100vw", height: "100%" }}>
            <ReactFlow
                nodes={nodes}
                nodeTypes={nodeTypes}
                edges={edges}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodesDraggable={true}
                deleteKeyCode={null}
                snapToGrid
                fitView
            >
                <Background variant={BackgroundVariant.Dots} />
                <MiniMap />
                <Controls />
                <Panel position="top-right">
                    <Stack direction="row" spacing={3}>
                        <Button
                            sx={{ backgroundColor: "primary.main" }}
                            onClick={() => {
                                onLayout();
                            }}
                        >
                            Layout
                        </Button>
                    </Stack>
                </Panel>
            </ReactFlow>
        </div>
    );
};

export default function Workflow() {
    return (
        <ReactFlowProvider>
            <LayoutedWorkflow />
        </ReactFlowProvider>
    );
}
