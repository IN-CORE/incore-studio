import React from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Box, Typography } from "@mui/joy";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { type AnalysisNode } from "@app/components/Workflow/nodes";

export function AnalysisNode({ data, sourcePosition, targetPosition }: NodeProps<AnalysisNode>): JSX.Element {
    return (
        <Box
            sx={{
                border: "1px solid #E0E0E0",
                borderRadius: "3px",
                padding: "16px 24px 16px 24px",
                gap: "20px",
                backgroundColor: "white"
            }}
        >
            <Handle type="target" position={targetPosition || Position.Top} />
            <Box display="flex" alignItems="center">
                <TrendingUpIcon sx={{ color: "#EF6C00", marginRight: "5px" }} />
                <Typography level="h4" sx={{ fontWeight: 400, fontSize: "16px", lineHeight: "24px", color: "#EF6C00" }}>
                    Analysis Type
                </Typography>
            </Box>
            <Box sx={{ marginTop: "5px" }}>
                <Typography level="h2" sx={{ fontWeight: 600, fontSize: "24px", lineHeight: "28.64px" }}>
                    {data.label}
                </Typography>
            </Box>
            <Handle type="source" position={sourcePosition || Position.Bottom} />
        </Box>
    );
}
