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
                height: "56px",
                width: "56px",
                backgroundColor: "#EA580C",
                position: "relative", // needed for absolute positioning the label
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <Handle type="target" position={Position.Left} />
            <ConstructionRoundedIcon sx={{ height: "46px", width: "46px", color: "white" }} />
            <Typography
                level="body-sm"
                sx={{
                    position: "absolute",
                    top: "70px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    textAlign: "center",
                    color: "neutral",
                    wordWrap: "break-word",
                    hyphens: "auto",
                    width: "100px"
                }}
            >
                {data.label}
            </Typography>
            <Handle type="source" position={Position.Right} />
        </Box>
    );
}
