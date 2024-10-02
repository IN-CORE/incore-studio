import React from "react";
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from "@xyflow/react";
import { Box, IconButton, Tooltip } from "@mui/joy";
import CloseIcon from "@mui/icons-material/Close";

import "./buttonedge.css";

import { useShallow } from "zustand/react/shallow";
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

    const onEdgeClick = () => {
        setEdges(edges.filter((edge) => edge.id !== id));
    };

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{ ...style, stroke: selected ? "#EF6C00" : "#000000", strokeWidth: selected ? "1px" : "2px" }}
            />
            <EdgeLabelRenderer>
                <Box
                    className="nodrag nopan"
                    sx={{
                        position: "absolute",
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        fontSize: 10,
                        // everything inside EdgeLabelRenderer has no pointer events by default
                        // if you have an interactive element, set pointer-events: all
                        pointerEvents: "all"
                    }}
                >
                    <Tooltip title="Remove">
                        <IconButton
                            onClick={onEdgeClick}
                            className="edgebutton"
                            sx={{
                                "width": "15px",
                                "height": "15px",
                                "background": "#eee",
                                "border": "1px solid #fff",
                                "cursor": "pointer",
                                "borderRadius": "50%",
                                "fontSize": "10px",
                                "lineHeight": "1",
                                "pointerEvents": "all",
                                ":hover": {
                                    boxShadow: "0 0 6px 2px rgba(0, 0, 0, 0.08)"
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </EdgeLabelRenderer>
        </>
    );
}
