import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Box, Typography } from "@mui/joy";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";

import { type SummaryNode } from "@app/components/Workflow/nodes";

export function SummaryNode({ data }: NodeProps<SummaryNode>): JSX.Element {
    return (
        <Box
            sx={{
                borderRadius: "6px",
                padding: "5px",
                gap: "10px",
                height: "56px",
                width: "56px",
                backgroundColor: "#EA580C",
                wordWrap: "break-word",
                hyphens: "auto"
            }}
        >
            <Handle type="target" position={Position.Left} />
            <ConstructionRoundedIcon sx={{ height: "46px", width: "46px", color: "white" }} />
            <Typography
                level="body-sm"
                sx={{
                    position: "absolute", // Position label absolutely relative to the parent container
                    top: "60px", // Position label just below the node
                    left: "50%", // Center the label horizontally
                    transform: "translateX(-50%)", // Adjust to perfectly center the label
                    textAlign: "center",
                    color: "neutral",
                    wordWrap: "break-word",
                    hyphens: "auto",
                    width: "100px" // Set width for consistent wrapping
                }}
            >
                {data.label}
            </Typography>
            <Handle type="source" position={Position.Right} />
        </Box>
    );
}
