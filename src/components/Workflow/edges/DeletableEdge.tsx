import React from "react";
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from "@xyflow/react";
import { Box, IconButton, Tooltip } from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";

import { useShallow } from "zustand/react/shallow";
import ConfirmationDialog from "@app/components/ConfirmationDialog";
import useStore, { type ReactFlowAppState } from "../reactFlowStore";
const selector = (state: ReactFlowAppState) => ({
    edges: state.edges,
    setEdges: state.setEdges
});

export default function DeletableEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    selected
}: EdgeProps) {
    const { edges, setEdges } = useStore(useShallow(selector));
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition
    });

    const onEdgeDelete = () => {
        setEdges(edges.filter((edge) => edge.id !== id));
    };

    const [openDeleteConfirmationModal, setOpenDeleteConfirmationModal] = React.useState(false);

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    ...style,
                    stroke: selected ? "#EF6C00" : "#000000",
                    strokeWidth: selected ? "1px" : "2px"
                }}
            />
            <EdgeLabelRenderer>
                <Box
                    className="nodrag nopan"
                    sx={{
                        position: "absolute",
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        // everything inside EdgeLabelRenderer has no pointer events by default
                        // if you have an interactive element, set pointer-events: all
                        pointerEvents: "all"
                    }}
                >
                    <Tooltip title="Remove">
                        <IconButton
                            onClick={() => setOpenDeleteConfirmationModal(true)}
                            sx={{
                                "background": "#eee",
                                "cursor": "pointer",
                                "borderRadius": "50%",
                                "pointerEvents": "all",
                                ":hover": {
                                    boxShadow: "0 0 6px 2px rgba(0, 0, 0, 0.08)"
                                }
                            }}
                        >
                            <CloseIcon sx={{ fontSize: "14px" }} />
                        </IconButton>
                    </Tooltip>
                </Box>
                <ConfirmationDialog
                    open={openDeleteConfirmationModal}
                    onClose={() => setOpenDeleteConfirmationModal(false)}
                    onConfirm={onEdgeDelete}
                    confirmationDialogTitle="Delete Edge?"
                    confirmationDialogText="Are you sure you want to delete this edge?"
                    confirmationDialogAction="Delete"
                />
            </EdgeLabelRenderer>
        </>
    );
}
