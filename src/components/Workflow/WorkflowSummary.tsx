import React, { useCallback } from "react";
import {
    Background,
    Controls,
    ReactFlow,
    BackgroundVariant,
    useReactFlow,
    ReactFlowProvider,
    Panel
} from "@xyflow/react";
import { useNavigate } from "react-router-dom";
import { Stack, Button } from "@mui/joy";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { useShallow } from "zustand/react/shallow";
import { useSummaryStore, type SummaryReactFlowStoreState } from "./reactFlowStore";

import { summaryNodeTypes, type SummaryNode } from "./nodes";
import { edgeTypes } from "./edges";
import { getLayoutedElements } from "./layout";

const selector = (state: SummaryReactFlowStoreState) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    setNodes: state.setNodes,
    setEdges: state.setEdges
});

const LayoutedWorkflow = ({
    isFinalized,
    wfId,
    projectId
}: {
    isFinalized: boolean | undefined;
    wfId: string | undefined | null;
    projectId: string | undefined;
}) => {
    const { fitView } = useReactFlow();
    const navigate = useNavigate();
    const { nodes, edges, onNodesChange, onEdgesChange, setNodes, setEdges } = useSummaryStore(useShallow(selector));
    const [layoutApplied, setLayoutApplied] = React.useState(false); // State to check if layout has been applied
    const [nodesReady, setNodesReady] = React.useState(false);

    // Function to check if all nodes have non-zero dimensions
    const checkNodesReady = (nodes: SummaryNode[]) => {
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
        zoom: 0.5 // Minimum zoom level
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
        }, 1000); // Adjust the delay as necessary based on render performance

        return () => clearTimeout(timer);
    }, [nodes, layoutApplied]);

    const handleClick = () => {
        if (isFinalized !== undefined && wfId !== undefined && wfId !== null) {
            if (isFinalized) {
                navigate(`/project/${projectId}/workflows/${wfId}/execution/create`);
            } else {
                navigate(`/project/${projectId}/workflows/${wfId}/workflow-editor`);
            }
        }
    };

    return (
        <div style={{ flex: 1 }}>
            <ReactFlow
                nodes={nodes}
                nodeTypes={summaryNodeTypes}
                edges={edges}
                edgeTypes={edgeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodesDraggable={false}
                deleteKeyCode={null}
                fitView
                attributionPosition="bottom-left"
            >
                <Background variant={BackgroundVariant.Dots} bgColor="#F8FAFC" />
                <Controls position="top-right" />
                <Panel position="bottom-right">
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            sx={{ borderColor: "primary.subtle", color: "primary.subtle", backgroundColor: "white" }}
                            size="md"
                            endDecorator={<ContentCopyRoundedIcon />}
                        >
                            Duplicate the workflow
                        </Button>
                        <Button
                            variant="solid"
                            sx={{ backgroundColor: "primary.main" }}
                            size="md"
                            onClick={handleClick}
                            endDecorator={<ArrowForwardRoundedIcon />}
                        >
                            {isFinalized ? "Create New Execution" : "Edit Workflow"}
                        </Button>
                    </Stack>
                </Panel>
            </ReactFlow>
        </div>
    );
};

export default function WorkflowSummary({
    isFinalized,
    wfId,
    projectId
}: {
    isFinalized: boolean | undefined;
    wfId: string | undefined | null;
    projectId: string | undefined;
}) {
    return (
        <ReactFlowProvider>
            <LayoutedWorkflow isFinalized={isFinalized} wfId={wfId} projectId={projectId} />
        </ReactFlowProvider>
    );
}
