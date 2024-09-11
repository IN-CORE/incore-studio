import React, { useCallback } from "react";
import {
    Background,
    Controls,
    MiniMap,
    ReactFlow,
    applyEdgeChanges,
    applyNodeChanges,
    addEdge,
    BackgroundVariant,
    useReactFlow,
    ReactFlowProvider,
    Panel
} from "@xyflow/react";
import type { OnConnect, OnNodesChange, OnEdgesChange, Edge } from "@xyflow/react";
import Dagre from "@dagrejs/dagre";
import { Box, Button } from "@mui/joy";

import { initialNodes, nodeTypes, type AppNode } from "./nodes";
import { initialEdges, edgeTypes } from "./edges";

const NodeMeasurements: { [key: string]: { width: number; height: number } } = {
    "analysis-input": { width: 383, height: 81 },
    "analysis-output": { width: 383, height: 81 },
    "analysis": { width: 456, height: 148 }
};

// Define the shape of our elements
// interface NodeDimension {
//     width: number;
//     height: number;
// }

// const getLayoutedElements = (nodes: AppNode[], edges: Edge[], nodeDimensions: { [key: string]: NodeDimension }) => {
//     const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
//     g.setGraph({ rankdir: "TD" });

//     edges.forEach((edge) => g.setEdge(edge.source, edge.target));
//     nodes.forEach((node) => {
//         const { width = 460, height = 150 } = nodeDimensions[node.id] || {}; // Default values if not available
//         g.setNode(node.id, {
//             ...node,
//             width: width,
//             height: height
//         });
//     });

//     Dagre.layout(g);

//     return {
//         nodes: nodes.map((node) => {
//             const { width = 460, height = 150 } = nodeDimensions[node.id] || {}; // Default values if not available
//             const position = g.node(node.id);
//             // We are shifting the dagre node position (anchor=center center) to the top left
//             // so it matches the React Flow node anchor point (top left).
//             const x = position.x - width / 2;
//             const y = position.y - height / 2;

//             return { ...node, position: { x, y } };
//         }),
//         edges
//     };
// };

const getLayoutedElements = (nodes: AppNode[], edges: Edge[]) => {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: "TD" });

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

            return { ...node, position: { x, y } };
        }),
        edges
    };
};

const LayoutFlow = () => {
    const { fitView } = useReactFlow();
    const [nodes, setNodes] = React.useState<AppNode[]>(initialNodes);
    const [edges, setEdges] = React.useState<Edge[]>(initialEdges);
    const [layoutApplied, setLayoutApplied] = React.useState(false); // State to check if layout has been applied
    const buttonRef = React.useRef<HTMLButtonElement | null>(null); // Ref for the button

    const onNodesChange: OnNodesChange<AppNode> = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        [setNodes]
    );
    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        [setEdges]
    );

    const onLayout = useCallback((nodes: AppNode[], edges: Edge[]) => {
        const layouted = getLayoutedElements(nodes, edges);

        setNodes([...layouted.nodes] as AppNode[]);
        setEdges([...layouted.edges]);

        // Use requestAnimationFrame to apply the layout after browser is ready to render
        requestAnimationFrame(() => {
            fitView();
        });

        setLayoutApplied(true);
    }, []);

    React.useEffect(() => {
        onLayout(nodes, edges);
        console.log(nodes);
    }, [onLayout]);

    // Emulate button click after everything is loaded
    // React.useEffect(() => {
    //     if (layoutApplied && buttonRef.current) {
    //         buttonRef.current.click();
    //     }
    // }, [layoutApplied]);

    const onConnect: OnConnect = useCallback((connection) => setEdges((eds) => addEdge(connection, eds)), [setEdges]);

    // Wait until layout is applied before rendering React Flow
    if (!layoutApplied) {
        return <div>Loading layout...</div>;
    }

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
                fitView
            >
                <Background variant={BackgroundVariant.Dots} />
                <MiniMap />
                <Controls />
                <Panel position="top-right">
                    <Box>
                        <Button ref={buttonRef} onClick={() => onLayout(nodes, edges)}>
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
