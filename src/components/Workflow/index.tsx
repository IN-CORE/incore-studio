import React, { useCallback } from "react";
import {
    Background,
    Controls,
    MiniMap,
    ReactFlow,
    useNodesState,
    useEdgesState,
    BackgroundVariant,
    useReactFlow,
    ReactFlowProvider,
    Position,
    Panel
} from "@xyflow/react";
import type { Edge } from "@xyflow/react";
import Dagre from "@dagrejs/dagre";
import { Box, Button } from "@mui/joy";

import {
    // initialNodes,
    nodeTypes,
    type AppNode
} from "./nodes";
import {
    // initialEdges,
    edgeTypes
} from "./edges";

import workflowExample from "./example_workflow.json";
import { readNodesAndEdgesFromWorkflowFile } from "./workflowUtils";

const NodeMeasurements: { [key: string]: { width: number; height: number } } = {
    "analysis-input": { width: 383, height: 81 },
    "analysis-output": { width: 383, height: 81 },
    "analysis": { width: 456, height: 148 }
};

const getLayoutedElements = (nodes: AppNode[], edges: Edge[]): { nodes: AppNode[]; edges: Edge[] } => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    let direction = "LR";
    let isHorizontal = direction === "LR";
    g.setGraph({ rankdir: direction });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    nodes.forEach((node) =>
        g.setNode(node.id, {
            ...node,
            width: node.measured?.width ?? (node.type !== undefined ? NodeMeasurements[node.type].width : 0),
            height: node.measured?.height ?? (node.type !== undefined ? NodeMeasurements[node.type].height : 0)
        })
    );

    Dagre.layout(g);

    return {
        nodes: nodes.map((node) => {
            const position = g.node(node.id);
            // We are shifting the dagre node position (anchor=center center) to the top left
            // so it matches the React Flow node anchor point (top left).
            const x =
                position.x -
                (node.measured?.width ?? (node.type !== undefined ? NodeMeasurements[node.type].width : 0)) / 2;
            const y =
                position.y -
                (node.measured?.height ?? (node.type !== undefined ? NodeMeasurements[node.type].height : 0)) / 2;

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

const workflowFile: DatawolfWorkflowFile = workflowExample as DatawolfWorkflowFile;

// remove this as this is only for testing purposes
const initialNodesAndEdges = readNodesAndEdgesFromWorkflowFile(workflowFile);

const LayoutFlow = () => {
    const { fitView } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodesAndEdges.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialNodesAndEdges.edges);
    const [layoutApplied, setLayoutApplied] = React.useState(false); // State to check if layout has been applied
    const [nodesReady, setNodesReady] = React.useState(false);

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
        duration: 500, // 0.5-second animation
        minZoom: 0.7 // Minimum zoom level
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

    // Automatically layout when all nodes have their dimensions ready
    React.useEffect(() => {
        if (nodesReady && !layoutApplied) {
            onLayout(); // Apply the vertical layout
        }
    }, [nodesReady, layoutApplied, onLayout]);

    React.useEffect(() => {
        if (layoutApplied) {
            // Use requestAnimationFrame to apply the layout after browser is ready to render
            requestAnimationFrame(() => {
                fitView(fitViewOptions);
            });
        }
    }, [layoutApplied]);

    // Use useEffect to apply layout after a delay to ensure nodes have been rendered
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (!layoutApplied) {
                const allNodesReady = checkNodesReady(nodes);
                if (allNodesReady) {
                    setNodesReady(true); // Trigger layout after delay
                }
            }
        }, 100); // Adjust the delay as necessary based on render performance

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
                nodesDraggable={true}
                fitView
            >
                <Background variant={BackgroundVariant.Dots} />
                <MiniMap />
                <Controls />
                <Panel position="top-right">
                    <Box>
                        <Button
                            onClick={() => {
                                onLayout();
                            }}
                        >
                            Layout
                        </Button>
                    </Box>
                </Panel>
            </ReactFlow>
        </div>
    );
};

export default function Workflow() {
    return (
        <ReactFlowProvider>
            <LayoutFlow />
        </ReactFlowProvider>
    );
}
