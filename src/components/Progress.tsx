import * as React from "react";
import { getStatusColor } from "@app/utils";
import { Box, LinearProgress, Typography } from "@mui/joy";

interface ProgressProps {
    status?: string;
}

export const Progress = (props: ProgressProps): JSX.Element => {
    const { status } = props;

    // Check if the progress is determinate
    const isDeterminate = status === "FINISHED" || status === "FAILED" || status === "ABORTED";

    return (
        <Box sx={{ width: "100%", display: "flex", alignItems: "center", gap: 3, padding: "1em" }}>
            <LinearProgress
                determinate={isDeterminate} // Enable determinate mode conditionally
                value={isDeterminate ? 100 : undefined} // Set value only for determinate mode
                variant="soft"
                color={getStatusColor(status)}
                size="sm"
                thickness={15}
                sx={{
                    "--LinearProgress-radius": "10px",
                    "--LinearProgress-thickness": "15px"
                }}
            >
                <Typography level="body-xs" textColor="white" sx={{ mixBlendMode: "difference" }}>
                    {`${status}...` ?? "PENDING..."}
                </Typography>
            </LinearProgress>
        </Box>
    );
};
