import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Box, Typography } from "@mui/joy";
import StorageIcon from "@mui/icons-material/Storage";

import { type AnalysisOutputNode } from "@app/components/Workflow/nodes";

export function AnalysisOutputNode({
    data,
    sourcePosition,
    targetPosition,
    selected
}: NodeProps<AnalysisOutputNode>): JSX.Element {
    return (
        <Box
            sx={{
                border: "2px solid #E0E0E0",
                borderRadius: "3px",
                padding: "16px 24px 16px 24px",
                gap: "16px",
                backgroundColor: "while",
                height: "auto",
                width: "250px",
                wordWrap: "break-word",
                hyphens: "auto"
            }}
        >
            <Handle type="target" position={targetPosition || Position.Top} />
            <Box display="flex" alignItems="center">
                <StorageIcon sx={{ color: "#AB47BC", marginRight: "5px" }} />
                <Typography level="h4" sx={{ fontWeight: 400, fontSize: "16px", lineHeight: "24px" }}>
                    {" "}
                    {data.label}
                </Typography>
            </Box>
            <Handle type="source" position={sourcePosition || Position.Bottom} />
        </Box>
    );
}
