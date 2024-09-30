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

import { setWorkflow } from "@app/reducer/workflowSlice";
import { useAppDispatch } from "@app/store/hooks";

import {
    // initialNodes,
    nodeTypes,
    type AppNode
} from "./nodes";
import {
    // initialEdges,
    edgeTypes
} from "./edges";

const NodeMeasurements: { [key: string]: { width: number; height: number } } = {
    "analysis-input": { width: 383, height: 81 },
    "analysis-output": { width: 383, height: 81 },
    "analysis": { width: 456, height: 148 }
};

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

interface LayoutFlowProps {
    initialNodesAndEdges: ReactFlowWorkflow;
}

const LayoutFlow = ({ initialNodesAndEdges }: LayoutFlowProps) => {
    const { fitView } = useReactFlow();
    const appDispatch = useAppDispatch();
    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodesAndEdges.nodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialNodesAndEdges.edges);
    const [layoutApplied, setLayoutApplied] = React.useState(false); // State to check if layout has been applied
    const [nodesReady, setNodesReady] = React.useState(false);

    React.useEffect(() => {
        setNodes(initialNodesAndEdges.nodes);
        setEdges(initialNodesAndEdges.edges);
        setNodesReady(false);
        setLayoutApplied(false);
    }, [initialNodesAndEdges]);

    React.useEffect(() => {
        if (nodes.length !== initialNodesAndEdges.nodes.length || edges.length !== initialNodesAndEdges.edges.length) {
            appDispatch(setWorkflow({ nodes, edges }));
        }
    }, [nodes, edges]);

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
    }, [nodesReady, layoutApplied, onLayout, initialNodesAndEdges]);

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
        }, 250); // Adjust the delay as necessary based on render performance

        return () => clearTimeout(timer);
    }, [nodes, layoutApplied, initialNodesAndEdges]);

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

export default function Workflow({ initialNodesAndEdges }: LayoutFlowProps) {
    return (
        <ReactFlowProvider>
            <LayoutFlow initialNodesAndEdges={initialNodesAndEdges} />
        </ReactFlowProvider>
    );
}
