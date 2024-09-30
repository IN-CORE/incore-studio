import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Box, Typography } from "@mui/joy";
import StorageIcon from "@mui/icons-material/Storage";

import { type AnalysisInputNode } from "@app/components/Workflow/nodes";

export function AnalysisInputNode({ data, sourcePosition, targetPosition }: NodeProps<AnalysisInputNode>): JSX.Element {
    return (
        <Box
            sx={{
                border: "2px solid #E0E0E0",
                borderRadius: "3px",
                padding: "16px 24px 16px 24px",
                gap: "16px",
                backgroundColor: "white",
                height: "auto",
                width: "250px",
                wordWrap: "break-word",
                hyphens: "auto"
            }}
        >
            <Handle type="target" position={targetPosition || Position.Top} />
            <Box display="flex" alignItems="center">
                <StorageIcon sx={{ color: "#007DFF", marginRight: "5px" }} />
                <Typography level="h4" sx={{ fontWeight: 400, fontSize: "16px", lineHeight: "24px" }}>
                    {" "}
                    {data.label}
                </Typography>
            </Box>
            <Handle type="source" position={sourcePosition || Position.Bottom} />
        </Box>
    );
}
